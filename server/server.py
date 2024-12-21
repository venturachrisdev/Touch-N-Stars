from flask import Flask, send_from_directory, request, Response, jsonify, send_file
import requests
import pandas as pd
import os
import threading
import time

app = Flask(__name__, static_folder='static')
#-----------------------------------------------------
# Constants 
#-----------------------------------------------------
BASE_API_URL = "http://localhost:1888/v2/api"
CACHE_PATH = os.path.join(os.getenv('LOCALAPPDATA', ''), 'NINA', 'FramingAssistantCache')
XML_FILE_PATH = os.path.join(CACHE_PATH, 'CacheInfo.xml')
TARGETPIC_CACHE_DIR = os.path.join(CACHE_PATH, 'TargetPicsCache')
os.makedirs(TARGETPIC_CACHE_DIR, exist_ok=True)  # Sicherstellen, dass der Cache-Ordner existiert
TARGETPIC_URL = "https://alaskybis.u-strasbg.fr/hips-image-services/hips2fits"  

#-----------------------------------------------------
# Globale Daten 
#-----------------------------------------------------
search_results_cache = None
guider_data = {
    "RADistanceRaw": [],
    "DECDistanceRaw": [],
}
afRun = False
last_af_timestamp = None  

lock = threading.Lock()
#-----------------------------------------------------
# Load data
#-----------------------------------------------------
data = pd.concat([
    pd.read_csv('./katalog/NGC.csv', sep=';'),
    pd.read_csv('./katalog/addendum.csv', sep=';')
], ignore_index=True)

#-----------------------------------------------------
# Utility functions
#-----------------------------------------------------
def fetch_and_store_data():
    """Periodisch Guider-Daten abrufen und speichern."""
    while True:
        try:
            response = requests.get(f"{BASE_API_URL}/equipment/guider/info")
            if response.status_code == 200:
                data = response.json()

                # Prüfen, ob die Verbindung aktiv ist
                if data.get("Success") and data["Response"].get("Connected"):
                    response_data = data.get("Response", {})

                    # Prüfen, ob LastGuideStep existiert
                    if "LastGuideStep" in response_data:
                        last_guide_step = response_data["LastGuideStep"]

                        ra_distance = round(float(last_guide_step.get("RADistanceRaw", 0)) * float(response_data.get("PixelScale", 1)), 2)
                        dec_distance = round(float(last_guide_step.get("DECDistanceRaw", 0)) * float(response_data.get("PixelScale", 1)), 2)

                        with lock:
                            def add_value_if_changed(array, value, limit=50):
                                if len(array) == 0 or array[-1] != value:  # Speichern nur bei Änderung
                                    if len(array) >= limit:
                                        array.pop(0)  # Entferne den ältesten Wert
                                    array.append(value)

                            add_value_if_changed(guider_data["RADistanceRaw"], ra_distance)
                            add_value_if_changed(guider_data["DECDistanceRaw"], dec_distance)
                    else:
                        print("Schlüssel 'LastGuideStep' fehlt in der API-Antwort.")
                #else:
                    #print("Guider nicht verbunden")
            else:
                print(f"Fehlerhafte API-Antwort: {response.status_code}")
        except Exception as e:
            print(f"Fehler beim Abrufen der Guider-Daten: {e}")
        
        time.sleep(1)  # Abruf alle 1 s

def hms_to_degrees(hms_string):
    """
    Konvertiert eine Zeitangabe im Format HH:MM:SS in Grad.
    :param hms_string: Zeitangabe im Format HH:MM:SS
    :return: Entsprechende Gradzahl
    """
    parts = hms_string.split(":")
    if len(parts) != 3:
        raise ValueError("Ungültiges Format. Erwartet: HH:MM:SS")

    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])

    return hours * 15 + minutes * (15 / 60) + seconds * (15 / 3600)

def dms_to_degrees(dms_string):
    """
    Konvertiert eine Winkelangabe im Format ±DD:MM:SS.s in Grad.
    :param dms_string: Winkelangabe im Format ±DD:MM:SS.s
    :return: Entsprechende Gradzahl
    """
    sign = -1 if dms_string.startswith("-") else 1
    stripped = dms_string.lstrip("-")

    parts = stripped.split(":")
    if len(parts) != 3:
        raise ValueError("Ungültiges Format. Erwartet: ±DD:MM:SS.s")

    degrees = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])

    return sign * (degrees + minutes / 60 + seconds / 3600)

def monitor_last_af():
    global afRun, last_af_timestamp
    try:
        while True:
            try:
               # print(afRun)
                #print(last_af_timestamp)
                response = requests.get(f"{BASE_API_URL}/equipment/focuser/last-af")
                if response.status_code == 200:
                    data = response.json()
                    current_timestamp = data.get("Response", {}).get("Timestamp")
                    if last_af_timestamp is not None and current_timestamp != last_af_timestamp:
                        afRun = False
                    last_af_timestamp = current_timestamp
            except Exception as e:
                print(f"Fehler beim Abrufen von 'last-af': {e}")
            time.sleep(1)
    except Exception as e:
        print(f"Fehler in monitor_last_af: {e}")



#-----------------------------------------------------
# Routes
#-----------------------------------------------------
@app.route('/api/autofocus', methods=['GET'])
def control_autofocus():
    """
    Startet oder stoppt den Autofokus basierend auf dem Query-Parameter 'start'.
    """
    global afRun
    start_param = request.args.get('start', '').lower()  # Query-Parameter abrufen und in Kleinbuchstaben umwandeln
    target_url = f"{BASE_API_URL}/equipment/focuser/auto-focus"
    if start_param == 'true':
        afRun = True
        try:
            # Anfrage an die Ziel-API senden
            response = requests.get(target_url)
            if response.status_code == 200:
                return jsonify({"message": "Autofokus gestartet"}), 200
            else:
                return jsonify({"error": f"Fehler beim Starten des Autofokus: {response.content}"}), response.status_code
        except Exception as e:
            print(f"Fehler beim Starten des Autofokus: {e}")
            return jsonify({"error": "Interner Fehler beim Starten des Autofokus"}), 500

    elif start_param == 'false':
        afRun = False
        print("Autofokus gestoppt")
        try:
            # Anfrage an die Ziel-API senden
            response = requests.get(f"{target_url}?cancel=true")
            print(f"Anfrage-URL: {target_url}?cancel=true")
            if response.status_code == 200:
                return jsonify({"message": "Autofokus gestoppt"}), 200
            else:
                return jsonify({"error": f"Fehler beim stoppen des Autofokus: {response.content}"}), response.status_code
        except Exception as e:
            print(f"Fehler beim stoppen des Autofokus: {e}")
            return jsonify({"error": "Interner Fehler beim stoppen des Autofokus"}), 500
    else:
        # Ungültiger Parameter
        return jsonify({"error": "Ungültiger Wert für 'start'. Erlaubte Werte: 'true' oder 'false'"}), 400


@app.route('/api/guider-data', methods=['GET'])
def get_guider_data():
    """API-Endpunkt, um die letzten Guider-Werte bereitzustellen."""
    with lock:
        return jsonify(guider_data)
    
@app.route('/api/ngc/search', methods=['GET'])
def search_ngc():
    global search_results_cache
    search_results_cache = None
    query = request.args.get('query', '').strip().lower()
    limit = request.args.get('limit', 100)

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        limit = int(limit)
        if limit <= 0:
            return jsonify({"error": "Limit must be a positive integer"}), 400
    except ValueError:
        return jsonify({"error": "Invalid limit parameter"}), 400

    try:
        search_column, search_value = ('Common names', query)
        if query.startswith('m'):
            search_column = 'M'
            search_value = query[1:]  # Remove only the first 'm'
        elif query.startswith('ngc'):
            search_column = 'Name'
            search_value = query[3:]  # Remove only the first 'ngc'
        elif query.startswith('ic'):
            search_column = 'Name'
            search_value = query[2:]  # Remove only the first 'ic'

        results = data[data[search_column].astype(str).str.lower().str.contains(search_value, na=False)].head(limit)
        selected_columns = ['Name', 'Type', 'RA', 'Dec', 'M', 'Common names']
        results_cleaned = results[selected_columns].fillna("")

        final_results = []
        for _, row in results_cleaned.iterrows():
            try:
                ra_decimal = hms_to_degrees(row['RA']) if row['RA'] else None
                dec_decimal = dms_to_degrees(row['Dec']) if row['Dec'] else None
            except Exception as e:
                print(f"Error converting RA/Dec for row: {row.to_dict()}, Error: {e}")
                ra_decimal = None
                dec_decimal = None

            result = row.to_dict()
            result['RA_decimal'] = ra_decimal
            result['Dec_decimal'] = dec_decimal
            final_results.append(result)
        
        return jsonify(final_results)

    except Exception as e:
        print(f"Error in /api/ngc/search: {e}")
        return jsonify({"error": "An internal error occurred"}), 500
    

@app.route('/api/ngc/cache', methods=['GET'])
def get_cached_results():
    global search_results_cache
    if not search_results_cache:
        return jsonify({"error": "Kein Cache verfügbar"}), 404
    return jsonify(search_results_cache)

@app.route('/api/ngc/cache', methods=['POST'])
def update_cached_results():
    global search_results_cache
    try:
        # Neuen Cache-Wert aus der Anfrage übernehmen
        search_results_cache = request.json
        return jsonify({"message": "Cache erfolgreich aktualisiert"}), 200
    except Exception as e:
        print(f"Fehler beim Aktualisieren des Caches: {e}")
        return jsonify({"error": "Fehler beim Aktualisieren des Caches"}), 500
    
@app.route('/api/targetpic', methods=['GET'])
def fetch_target_pic():
    width = request.args.get('width')
    height = request.args.get('height')
    fov = request.args.get('fov')
    ra = request.args.get('ra')
    dec = request.args.get('dec')

    if not all([width, height, fov, ra, dec]):
        return jsonify({"error": "Alle Parameter (width, height, fov, ra, dec) sind erforderlich"}), 400

    # Erstelle einen eindeutigen Cache-Schlüssel
    cache_key = f"{width}_{height}_{fov}_{ra}_{dec}.jpg"
    cache_path = os.path.join(TARGETPIC_CACHE_DIR, cache_key)

    # Prüfen, ob das Bild bereits zwischengespeichert ist
    if os.path.exists(cache_path):
        return send_file(cache_path, mimetype='image/jpeg')

    # Falls nicht im Cache, lade das Bild
    try:
        response = requests.get(
            TARGETPIC_URL,
            params={
                "width": width,
                "height": height,
                "fov": fov,
                "ra": ra,
                "dec": dec,
                "hips": "CDS/P/DSS2/color",
                "projection": "STG",
                "format": "jpg",
            },
            stream=True
        )

        if response.status_code == 200:
            # Speichere das Bild im Cache
            with open(cache_path, 'wb') as cache_file:
                for chunk in response.iter_content(1024):
                    cache_file.write(chunk)

            return send_file(cache_path, mimetype='image/jpeg')
        else:
            return jsonify({"error": "Fehler beim Abrufen des Zielbildes"}), response.status_code

    except Exception as e:
        print(f"Fehler beim Abrufen des Zielbildes: {e}")
        return jsonify({"error": "Interner Fehler beim Abrufen des Zielbildes"}), 500

@app.route('/v2/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(endpoint):
    target_url = f"{BASE_API_URL}/{endpoint}"
    try:
        resp = requests.request(
            method=request.method,
            url=target_url,
            params=request.args if request.method == 'GET' else None,
            json=request.json if request.method in ['POST', 'PUT'] else None
        )
        response = Response(resp.content, status=resp.status_code)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to connect to target API"}, 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')



@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response
#-----------------------------------------------------
# Hintergrund-Thread 
#-----------------------------------------------------


if __name__ == '__main__':
    threading.Thread(target=fetch_and_store_data, daemon=True).start()
    print("Starte monitor_last_af")
    threading.Thread(target=monitor_last_af, daemon=True).start()
    print("monitor_last_af gestartet")
    app.run(host='0.0.0.0', port=5000)

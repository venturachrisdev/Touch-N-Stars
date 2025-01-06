from flask import Flask, send_from_directory, request, Response, jsonify, send_file
import requests
import pandas as pd
import os
import threading
import time
import glob

app = Flask(__name__, static_folder='static')
#-----------------------------------------------------
# Constants 
#-----------------------------------------------------
BASE_API_URL = "http://localhost:1888/v2/api"
CACHE_PATH = os.path.join(os.getenv('LOCALAPPDATA', ''), 'NINA', 'FramingAssistantCache')
LOG_PATH = os.path.join(os.getenv('LOCALAPPDATA', ''), 'NINA', 'Logs')
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
afError = False
afErrorText =""
newAfGraph = False
last_af_timestamp = None  
wshvAktiv = False # Web Session History Viewer aktiv
wshvPort = 80


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
def monitor_logs_for_events():
    """
    Überwacht die Logdatei auf neue Warnungen oder Störungen mit dem Member 'StartAutoFocus'
    und setzt 'afRun' auf False, falls eine gefunden wird.
    """
    global afRun , afError, afErrorText, wshvAktiv, wshvPort
    last_checked_line = 0  # Die zuletzt gelesene Zeile

    try:
        while True:
            log_files = glob.glob(os.path.join(LOG_PATH, '*.log'))
            if not log_files:
                time.sleep(1)  # Falls keine Logdateien existieren, warten und erneut prüfen
                print("Keine Logdateien gefunden")
                continue

            latest_log = max(log_files, key=os.path.getmtime)
            
            with open(latest_log, 'r', encoding='utf-8') as file:
                lines = file.readlines()

            # Überprüfen nur der neuen Zeilen seit dem letzten Durchlauf
            new_lines = lines[last_checked_line:]
            last_checked_line = len(lines)  # Aktualisiere den Stand der zuletzt geprüften Zeile
           
            for line in new_lines:
                # --- 1. Prüfung: Zeile enthält WebServerTask und "http://localhost:XXXX/dist"? ---
                if "WebServerTask" in line and "http://localhost:" in line and "/dist" in line:
                    # Beispielzeile:
                    # 2025-01-01T15:15:37.2624|INFO|HttpServer.cs|WebServerTask|62|starting web server, listening at http://localhost:5001/dist
                    
                    # Schritt 1: Teilstring hinter "http://localhost:"
                    parts_after_localhost = line.split("http://localhost:", 1)
                    if len(parts_after_localhost) < 2:
                        # Sicherheitshalber, falls doch nichts gefunden wurde
                        continue
                    
                    # parts_after_localhost[1] sollte jetzt "5001/dist ..." oder ähnlich enthalten
                    substring = parts_after_localhost[1]
                    
                    # Schritt 2: Abschneiden ab "/dist"
                    parts_before_dist = substring.split("/dist", 1)
                    if len(parts_before_dist) < 2:
                        continue
                    
                    # parts_before_dist[0] sollte jetzt "5001" sein
                    port_candidate = parts_before_dist[0].strip()
                    
                    # Optional prüfen, ob nur Ziffern enthalten sind
                    if port_candidate.isdigit():
                        wshvPort = port_candidate
                        wshvAktiv = True
                        print(f"Server-Port gefunden: {wshvPort}")
                    else:
                        print(f"Konnte Port nicht ermitteln: {port_candidate}")



                # Prüfe, ob die Zeile eine Warnung oder Störung enthält und den Member 'StartAutoFocus'
                if ('|WARNING|' in line or '|ERROR|' in line) and '|StartAutoFocus|' in line:
                    print(f"Warnung/Störung gefunden: {line.strip()}")
                    afRun = False  # Autofokus stoppen
                    afError = True
                    # Extrahiere den relevanten Teil der Log-Zeile
                    parts = line.split('|')
                    if len(parts) >= 6:
                        afErrorText = parts[5].strip()
                    break  # Keine weiteren Zeilen prüfen, da wir afRun bereits gestoppt haben

            time.sleep(1)  # Kurze Pause, um die CPU-Belastung zu reduzieren
    except Exception as e:
        print(f"Fehler in monitor_logs_for_events: {e}")

def fetch_and_store_data():
    """Periodisch Guider-Daten abrufen und speichern."""
    print("--------Guider-Daten-------------------")
    while True:
        try:
            response = requests.get(f"{BASE_API_URL}/equipment/guider/info")
            if response.status_code == 200:
                try:
                    data = response.json()
                    if not isinstance(data, dict):
                        print("Ungültiges Response-Format: Response ist kein Dictionary")
                        time.sleep(5)
                        continue

                    # Prüfen, ob die Verbindung aktiv ist
                    if not data.get("Success", False): 
                        time.sleep(5)
                        continue 
                    
                    response_data = data.get("Response", {})
                    if not isinstance(response_data, dict):
                        print("Ungültiges Response-Format: Response ist kein Dictionary")
                        time.sleep(5)
                        continue

                    if not response_data.get("Connected", False):
                        time.sleep(5)
                        continue

                    # Prüfen, ob LastGuideStep existiert
                    last_guide_step = response_data.get("LastGuideStep", {})
                    if not isinstance(last_guide_step, dict):
                        print("Ungültiges LastGuideStep-Format: Kein Dictionary")
                        time.sleep(5)
                        continue

                    try:
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
                    except (ValueError, TypeError) as e:
                        print(f"Fehler bei der Berechnung der Distanzen: {e}")
                except ValueError as e:
                    print(f"Ungültiges JSON-Format: {e}")
            else:
                print(f"Fehlerhafte API-Antwort: {response.status_code}")
        except Exception as e:
            print(f"Fehler beim Abrufen der Guider-Daten: {e}")
        
        time.sleep(1)  # Abruf alle 1 s

def fetch_safety_monitor_status():
    """Periodisch Safety-Daten abrufen und speichern."""
    print("--------Safety-Daten-------------------")
    while True:
        try:
            response = requests.get(f"{BASE_API_URL}/equipment/safetymonitor/info")
            if response.status_code == 200:
                try:
                    data = response.json()
                    if not isinstance(data, dict):
                        print("Ungültiges Response-Format: Response ist kein Dictionary")
                        time.sleep(5)
                        continue

                    # Prüfen, ob die Verbindung aktiv ist
                    if not data.get("Success", False): 
                        time.sleep(5)
                        continue 
                    
                    response_data = data.get("Response", {})
                    if not isinstance(response_data, dict):
                        print("Ungültiges Response-Format: Response ist kein Dictionary")
                        time.sleep(5)
                        continue

                    if not response_data.get("Connected", False):
                        time.sleep(5)
                        continue

                    # Prüfen, ob IsSafe existiert
                    IsSafe = response_data.get("IsSafe", {})
                    if not isinstance(IsSafe, dict):
                        print("Ungültiges IsSafe-Format: Kein Dictionary")
                        time.sleep(5)
                        continue
                except ValueError as e:
                    print(f"Ungültiges JSON-Format: {e}")
            else:
                print(f"Fehlerhafte API-Antwort: {response.status_code}")
        except Exception as e:
            print(f"Fehler beim Abrufen der Safety-Daten: {e}")
        
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
    global afRun, last_af_timestamp, newAfGraph
    try:
        while True:
            try:
                response = requests.get(f"{BASE_API_URL}/equipment/focuser/last-af")
                if response.status_code == 200:
                    try:
                        # Log raw response for debugging
                       # print(f"Raw response: {response.text[:200]}...")  # Log first 200 chars
                        
                        data = response.json()
                        if not isinstance(data, dict):
                            print(f"Ungültiges Datenformat: API-Antwort ist kein Dictionary. Typ: {type(data)}")
                            time.sleep(1)
                            continue
                            
                        response_data = data.get("Response", {})
                        # Handle case where Response is empty string
                        if isinstance(response_data, str) and not response_data:
                            response_data = {}
                            
                        if not isinstance(response_data, dict):
                            print(f"Ungültiges Response-Format: Response ist kein Dictionary. Typ: {type(response_data)}")
                            time.sleep(1)
                            continue
                            
                        # Handle "No AF available" error case
                        if data.get("Error") == "No AF available":
                            print("Keine AF-Daten verfügbar")
                            time.sleep(1)
                            continue
                            
                        current_timestamp = response_data.get("Timestamp")
                        if current_timestamp is None:
                            print("Kein Timestamp in der Response gefunden")
                            time.sleep(1)
                            continue
                            
                        if last_af_timestamp is not None and current_timestamp != last_af_timestamp:
                            afRun = False
                            newAfGraph = True
                        last_af_timestamp = current_timestamp
                        
                    except ValueError as e:
                        print(f"Fehler beim Parsen der JSON-Antwort: {e}")
                        print(f"Response content: {response.text[:200]}...")  # Log first 200 chars
                else:
                    print(f"API-Antwort mit Statuscode {response.status_code}")
            except Exception as e:
                print(f"Fehler beim Abrufen von 'last-af': {e}")
            time.sleep(1)
    except Exception as e:
        print(f"Fehler in monitor_last_af: {e}")


#-----------------------------------------------------
# Routes
#-----------------------------------------------------
# Logdatei auslesen 
# http://192.168.2.128:5000/api/logs?count=10&level=Error 
# Mögliche level: Error, Warning, Info,  
@app.route('/api/logs', methods=['GET'])
def get_recent_logs():
    """
    Gibt eine konfigurierbare Anzahl von Meldungen aus der aktuellsten Logdatei zurück,
    optional gefiltert nach dem Log-Level.
    """

    excluded_members = ["GetEquipment", "RequestAll", "LoadPlugin"]

    try:
        # Anzahl der Logmeldungen aus dem Query-Parameter lesen, Standard: 5
        count = request.args.get('count', default=5, type=int)

        # Log-Level aus dem Query-Parameter lesen, Standard: None (kein Filter)
        level_filter = request.args.get('level', default=None, type=str)

        # Neueste Logdatei finden
        log_files = glob.glob(os.path.join(LOG_PATH, '*.log'))
        if not log_files:
            return jsonify({"error": "Keine Logdateien gefunden"}), 404

        latest_log = max(log_files, key=os.path.getmtime)
        
        # Alle Zeilen lesen
        with open(latest_log, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        # Nur relevante Zeilen (nach der Kopfzeile) verarbeiten
        log_lines = [line for line in lines if '|' in line]

        # Nach Level filtern, falls angegeben
        if level_filter:
            log_lines = [line for line in log_lines if f"|{level_filter.upper()}|" in line]

        # Einträge filtern
        log_lines = [line for line in log_lines if not any(f"|{member}|" in line for member in excluded_members)]

        # Neueste `count` Logs auswählen
        log_lines = log_lines[-count:]

        # Neueste Logs zuerst
        log_lines.reverse()

        logs = []
        for line in log_lines:
            parts = line.split('|')
            if len(parts) >= 6:
                logs.append({
                    "timestamp": parts[0],
                    "level": parts[1],
                    "source": parts[2],
                    "member": parts[3],
                    "line": parts[4],
                    "message": '|'.join(parts[5:]).strip()
                })

        return jsonify({"logs": logs}), 200

    except Exception as e:
        print(f"Fehler beim Abrufen der Logs: {e}")
        return jsonify({"error": "Fehler beim Abrufen der Logs"}), 500

@app.route('/api/wshv', methods=['GET'])
def get_wshv_data():
    """API-Endpunkt für wshv."""
    global wshvAktiv, wshvPort
    with lock:
        return jsonify({"wshvAktiv": wshvAktiv, "wshvPort": wshvPort})

@app.route('/api/autofocus', methods=['GET'])
def control_autofocus():
    """
    Steuert den Autofokus: Startet, stoppt oder gibt den Status zurück, basierend auf Query-Parametern.
    """
    global afRun , newAfGraph, afError, afErrorText
    # Basis-URL für Autofokus-Aktionen
    target_url = f"{BASE_API_URL}/equipment/focuser/auto-focus"

    # Abrufen der Query-Parameter
    start_param = 'start' in request.args  
    stopp_param = 'stopp' in request.args  
    info_param = 'info' in request.args  

    # Statusabfrage
    if info_param:
        return jsonify({"Success": True,
                        "autofocus_running": afRun,
                        "newAfGraph" : newAfGraph,
                        "afError" : afError,
                        "afErrorText" : afErrorText,
                        })

    # Start des Autofokus
    if start_param:
        afRun = True
        newAfGraph = False
        afError = False
        afErrorText = ""
        try:
            response = requests.get(target_url)
            if response.status_code == 200:
                return jsonify({"message": "Autofokus gestartet"}), 200
            else:
                return jsonify({"error": f"Fehler beim Starten des Autofokus: {response.content}"}), response.status_code
        except Exception as e:
            print(f"Fehler beim Starten des Autofokus: {e}")
            return jsonify({"error": "Interner Fehler beim Starten des Autofokus"}), 500

    # Stopp des Autofokus
    if stopp_param:
        afRun = False
        newAfGraph = False
        try:
            response = requests.get(f"{target_url}?cancel=true")
            if response.status_code == 200:
                return jsonify({"message": "Autofokus gestoppt"}), 200
            else:
                return jsonify({"error": f"Fehler beim Stoppen des Autofokus: {response.content}"}), response.status_code
        except Exception as e:
            print(f"Fehler beim Stoppen des Autofokus: {e}")
            return jsonify({"error": "Interner Fehler beim Stoppen des Autofokus"}), 500

    # Ungültiger Parameter
    else:
        return jsonify({"error": "Ungültige Anfrage. Verwenden Sie 'start=true', 'start=false' oder '?info'."}), 400


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
    threading.Thread(target=monitor_last_af, daemon=True).start()
    threading.Thread(target=monitor_logs_for_events, daemon=True).start()
    threading.Thread(target=fetch_safety_monitor_status, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)

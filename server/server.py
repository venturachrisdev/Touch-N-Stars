from flask import Flask, send_from_directory, request, Response, jsonify
import requests
import pandas as pd
import os
import math
import xmltodict

app = Flask(__name__, static_folder='static')  # Statische Dateien in 'static'

# API URL für NINA
BASE_API_URL = "http://localhost:1888/v2/api"

# NGC Daten einlesen
data = pd.read_csv('./katalog/NGC.csv', sep=';')
data2 = pd.read_csv('./katalog/addendum.csv', sep=';')  
data = pd.concat([data, data2], ignore_index=True)

# -----------------------------------------
# Hilfsfunktion: Finde das nächste Bild basierend auf RA/Dec
# -----------------------------------------
def find_closest_image(ra_target, dec_target, xml_file_path):
    try:
        with open(xml_file_path, 'r', encoding='utf-8') as xml_file:
            data_dict = xmltodict.parse(xml_file.read())
    except FileNotFoundError:
        return None, "XML file not found"
    except Exception as e:
        return None, f"Error reading XML: {e}"

    images = data_dict.get("ImageCacheInfo", {}).get("Image", [])
    if isinstance(images, dict):  # Falls nur ein einzelnes Bild vorhanden ist
        images = [images]

    if not images:
        return None, "No images found in XML"

    closest_image = None
    min_distance = float('inf')
    for image in images:
        ra = float(image['@RA'])
        dec = float(image['@Dec'])
        distance = math.sqrt((ra - ra_target)**2 + (dec - dec_target)**2)
        if distance < min_distance:
            min_distance = distance
            closest_image = image

    return closest_image, None

# -----------------------------------------
# Route: Suche nach NGC-Objekten
# -----------------------------------------
@app.route('/api/ngc/search', methods=['GET'])
def search_ngc():
    query = request.args.get('query', '').strip().lower()
    limit = request.args.get('limit', 100)

    # Validierung
    if not query:
        return {"error": "Query parameter is required"}, 400
    try:
        limit = int(limit)
        if limit <= 0:
            return {"error": "Limit must be a positive integer"}, 400
    except ValueError:
        return {"error": "Invalid limit parameter"}, 400

    # Bestimmen, welche Spalte durchsucht wird
    if query.startswith('m'):
        search_column = 'M'
        search_value = query[1:]
    elif query.startswith('ngc'):
        search_column = 'Name'
        search_value = query[3:]
    elif query.startswith('ic'):
        search_column = 'Name'
        search_value = query[2:]
    else:
        search_column = 'Common names'
        search_value = query[0:]

    results = data[
        data[search_column].astype(str).str.lower().str.contains(search_value, na=False)
    ].head(limit)

    selected_columns = ['Name', 'Type', 'RA', 'Dec', 'M', 'Common names']
    results_filtered = results[selected_columns].fillna("")
    results_cleaned = results_filtered.replace("", None)
    return jsonify(results_cleaned.to_dict(orient='records'))

# -----------------------------------------
# Route: Proxy zu NINA-API
# -----------------------------------------
@app.route('/v2/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(endpoint):
    target_url = f"{BASE_API_URL}/{endpoint}"
    print(f"Forwarding request to: {target_url}")

    try:
        if request.method == 'GET':
            resp = requests.get(target_url, params=request.args)
        elif request.method == 'POST':
            resp = requests.post(target_url, json=request.json)
        elif request.method == 'PUT':
            resp = requests.put(target_url, json=request.json)
        elif request.method == 'DELETE':
            resp = requests.delete(target_url)
        else:
            return {"error": "Unsupported HTTP method"}, 405

        response = Response(resp.content, status=resp.status_code)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to connect to target API"}, 500

# -----------------------------------------
# Route: Vue-App ausliefern
# -----------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue(path):
    """Ausliefern der Vue-App."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# -----------------------------------------
# Route: Suche nach Framing-Bildern
# -----------------------------------------
@app.route('/api/image', methods=['GET'])
def find_image():
    ra_hms = request.args.get('ra')  # z.B. "23:52:52"
    dec_hms = request.args.get('dec') # z.B. "-53:02:07.7"

    # Hier kannst du die H:M:S Werte in dezimal umrechnen, aktuell feste Werte:
    ra_decimal = 358.217
    dec_decimal = -52.9646

    if ra_decimal is None or dec_decimal is None:
        return jsonify({"error": "RA and DEC parameters are required"}), 400

    xml_file_path = "C:\\Users\\Astro\\AppData\\Local\\NINA\\FramingAssistantCache\\CacheInfo.xml"
    closest_image, error = find_closest_image(ra_decimal, dec_decimal, xml_file_path)

    if error:
        return jsonify({"error": error}), 500

    if closest_image:
        return jsonify(closest_image)
    else:
        return jsonify({"error": "No image found"}), 404

# -----------------------------------------
# CORS-Header setzen
# -----------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

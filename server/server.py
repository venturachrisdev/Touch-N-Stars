from flask import Flask, send_from_directory, request, Response, jsonify
import requests
import pandas as pd
import os
import math
import xmltodict

app = Flask(__name__, static_folder='static')
#-----------------------------------------------------
# Constants 
#-----------------------------------------------------
BASE_API_URL = "http://localhost:1888/v2/api"
CACHE_PATH = os.path.join(os.getenv('LOCALAPPDATA', ''), 'NINA', 'FramingAssistantCache')
XML_FILE_PATH = os.path.join(CACHE_PATH, 'CacheInfo.xml')

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
    seconds = int(parts[2])

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

    degrees = float(parts[0])
    minutes = float(parts[1])
    seconds = float(parts[2])

    return sign * (degrees + minutes / 60 + seconds / 3600)
#-----------------------------------------------------
# Routes
#-----------------------------------------------------
@app.route('/api/ngc/search', methods=['GET'])
def search_ngc():
    query = request.args.get('query', '').strip().lower()
    limit = request.args.get('limit', 100)

    if not query:
        return {"error": "Query parameter is required"}, 400

    try:
        limit = int(limit)
        if limit <= 0:
            return {"error": "Limit must be a positive integer"}, 400
    except ValueError:
        return {"error": "Invalid limit parameter"}, 400

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
    
    final_results = [row.to_dict() for _, row in results_cleaned.iterrows()]
    return jsonify(final_results)
    

@app.route('/cache/<path:filename>')
def serve_image_from_cache(filename):
    return send_from_directory(CACHE_PATH, filename)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

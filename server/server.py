from flask import Flask, send_from_directory, request, Response, jsonify
import requests
import pandas as pd
import os

app = Flask(__name__, static_folder='static')  # Statische Dateien in 'static'

# API Url für NINA
BASE_API_URL = "http://localhost:1888/v2/api"

# NGC Daten für die API einlesen
data = pd.read_csv('./katalog/NGC.csv',sep=';')
data2 = pd.read_csv('./katalog/addendum.csv', sep=';')  
data = pd.concat([data, data2], ignore_index=True)

# ------------- API zur Objetksuche -----------------------
@app.route('/api/ngc/search', methods=['GET'])
def search_ngc():
    query = request.args.get('query', '').strip().lower()
    limit = request.args.get('limit', 100)

    # Validierung der Eingaben
    if not query:
        return {"error": "Query parameter is required"}, 400
    try:
        limit = int(limit)
        if limit <= 0:
            return {"error": "Limit must be a positive integer"}, 400
    except ValueError:
        return {"error": "Invalid limit parameter"}, 400

     # Bestimmen, welche Spalte anhand des Prefixes durchsucht werden soll
    if query.startswith('m'):
        search_column = 'M'
        search_value = query[1:]  # entfernt das 'm' am Anfang
    elif query.startswith('ngc'):
        search_column = 'Name'
        search_value = query[3:]  # entfernt das 'ngc' am Anfang
    elif query.startswith('ic'):
        search_column = 'Name'
        search_value = query[2:]  # entfernt das 'ic' am Anfang
    else:
         search_column = 'Common names'
         search_value = query[0:]

    # Filtere die Daten basierend auf der Spalte und dem gekürzten Suchwert
    results = data[
        data[search_column].astype(str).str.lower().str.contains(search_value, na=False)
    ].head(limit)

    # Wähle nur die gewünschten Spalten
    selected_columns = ['Name', 'Type', 'RA', 'Dec', 'M', 'Common names']
    results_filtered = results[selected_columns]

    # Ersetze NaN durch None
    results_temp = results_filtered.fillna(value="")
    results_cleaned = results_temp.replace("", None)

    # Rückgabe als gültiges JSON
    return jsonify(results_cleaned.to_dict(orient='records'))

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# ------------------ Proxy-Route zur NINA API ----------------------
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


# ---------------------Route für die Vue-App-----------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue(path):
    """Ausliefern der Vue-App."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

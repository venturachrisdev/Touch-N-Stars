from flask import Flask, request, Response, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Aktiviert CORS für alle Routen

# Pfad zu den Vue-Statikdateien (nach dem Build-Prozess)
STATIC_FOLDER = os.path.join(os.getcwd(), 'static')  # Ordner für deine Vue-Statikdateien

@app.route('/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(endpoint):
    """Proxy-Server für die API-Anfragen."""
    api_url = f"http://localhost:8080/{endpoint}"  # Ziel-API (ersetze mit der URL deiner Software-API)

    # Weiterleitung der Anfrage
    if request.method == 'GET':
        response = requests.get(api_url, params=request.args)
    elif request.method == 'POST':
        response = requests.post(api_url, json=request.json)
    elif request.method == 'PUT':
        response = requests.put(api_url, json=request.json)
    elif request.method == 'DELETE':
        response = requests.delete(api_url)
    else:
        return {"error": "Unsupported method"}, 405

    # Antwort zurückgeben mit angepassten CORS-Headern
    proxy_response = Response(response.content, status=response.status_code)
    proxy_response.headers['Access-Control-Allow-Origin'] = '*'
    proxy_response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    proxy_response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return proxy_response

# Route für die Vue-App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue(path):
    """Vue-App statisch ausliefern."""
    if path != "" and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    else:
        return send_from_directory(STATIC_FOLDER, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

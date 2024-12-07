from flask import Flask, send_from_directory, request, Response
import requests
import os

app = Flask(__name__, static_folder='static')  # Statische Dateien in 'static'

BASE_API_URL = "http://localhost:1888/v2/api"

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

# Route für die Vue-App
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

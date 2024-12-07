from flask import Flask, request, Response
import requests

app = Flask(__name__)

# Basis-URL der Ziel-API
BASE_API_URL = "http://localhost:1888/v2/api"

@app.route('/v2/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(endpoint):
    # Ziel-URL zusammensetzen
    target_url = f"{BASE_API_URL}/{endpoint}"

    # Logge die weitergeleitete Anfrage
    print(f"Forwarding request to: {target_url}")

    try:
        # Anfrage basierend auf der HTTP-Methode weiterleiten
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

        # Antwort der Ziel-API weitergeben
        response = Response(resp.content, status=resp.status_code)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except Exception as e:
        print(f"Error: {e}")
        return {"error": "Failed to connect to target API"}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

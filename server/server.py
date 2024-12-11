from flask import Flask, send_from_directory, request, Response, jsonify
import requests
import pandas as pd
import os
import math
import xmltodict

app = Flask(__name__, static_folder='static')

# Constants
BASE_API_URL = "http://localhost:1888/v2/api"
CACHE_PATH = os.path.join(os.getenv('LOCALAPPDATA', ''), 'NINA', 'FramingAssistantCache')
XML_FILE_PATH = os.path.join(CACHE_PATH, 'CacheInfo.xml')

# Load data
data = pd.concat([
    pd.read_csv('./katalog/NGC.csv', sep=';'),
    pd.read_csv('./katalog/addendum.csv', sep=';')
], ignore_index=True)

# Utility functions
def great_circle_distance(ra1, dec1, ra2, dec2):
    """Calculate the great circle distance between two points in radians."""
    ra1, dec1, ra2, dec2 = map(math.radians, [ra1, dec1, ra2, dec2])
    delta_ra = ra2 - ra1
    delta_dec = dec2 - dec1
    a = (math.sin(delta_dec / 2)**2 +
         math.cos(dec1) * math.cos(dec2) * math.sin(delta_ra / 2)**2)
    return 2 * math.asin(math.sqrt(a))

def find_closest_image(ra_target, dec_target, xml_file_path):
    """Find the closest image to the given RA and Dec in the XML file."""
    try:
        with open(xml_file_path, 'r', encoding='utf-8') as xml_file:
            data_dict = xmltodict.parse(xml_file.read())
    except FileNotFoundError:
        return None, "XML file not found"
    except Exception as e:
        return None, f"Error reading XML: {e}"

    images = data_dict.get("ImageCacheInfo", {}).get("Image", [])
    if isinstance(images, dict):
        images = [images]

    if not images:
        return None, "No images found in XML"

    closest_image = None
    min_distance = float('inf')
    for image in images:
        try:
            ra = float(image['@RA'])
            dec = float(image['@Dec'])
            distance = great_circle_distance(ra_target, dec_target, ra, dec)
            if distance < min_distance:
                min_distance = distance
                closest_image = image
        except Exception as e:
            print(f"Error processing image: {e}")

    return closest_image, None

def hms_to_decimal(ra_hms, dec_hms, ra_in_hours=False):
    """Convert RA and Dec from HMS/DMS to decimal degrees."""
    def dms_to_degrees(dms):
        parts = list(map(float, dms.split(":")))
        return parts[0] + parts[1] / 60.0 + parts[2] / 3600.0

    ra_decimal = dms_to_degrees(ra_hms)
    if ra_in_hours:
        ra_decimal *= 15.0

    dec_sign = -1 if dec_hms.startswith("-") else 1
    dec_decimal = dec_sign * dms_to_degrees(dec_hms.lstrip("-"))

    return ra_decimal, dec_decimal

# Routes
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
    else: 
        search_column = 'Name'
        search_value = query[2:]  # Remove only the first 'ic'
        

    results = data[data[search_column].astype(str).str.lower().str.contains(search_value, na=False)].head(limit)
    selected_columns = ['Name', 'Type', 'RA', 'Dec', 'M', 'Common names']
    results_cleaned = results[selected_columns].fillna("")
    
    enriched_results = [row.to_dict() for _, row in results_cleaned.iterrows()]
    return jsonify(enriched_results)
    
    '''
    if not os.path.exists(CACHE_PATH):
        enriched_results = [row.to_dict() for _, row in results_cleaned.iterrows()]
        return jsonify(enriched_results)

    if not os.path.exists(XML_FILE_PATH):
        enriched_results = [row.to_dict() for _, row in results_cleaned.iterrows()]
        return jsonify(enriched_results)

    enriched_results = []
    for _, row in results_cleaned.iterrows():
        try:
            ra_decimal, dec_decimal = hms_to_decimal(row['RA'], row['Dec'], ra_in_hours=False)
            closest_image, error = find_closest_image(ra_decimal, dec_decimal, XML_FILE_PATH)
            image_info = {"error": error} if error else {
                "FileName": closest_image.get('@FileName'),
                "RA": closest_image.get('@RA'),
                "Dec": closest_image.get('@Dec'),
                "Source": closest_image.get('@Source'),
                "Name": closest_image.get('@Name'),
            }
        except Exception as e:
            image_info = {"error": f"Error during image lookup: {e}"}

        enriched_results.append({**row.to_dict(), "Image": image_info})
        return jsonify(enriched_results)
    '''
    

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

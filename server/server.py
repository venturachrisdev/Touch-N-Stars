from flask import Flask, send_from_directory, request, Response, jsonify
import requests
import pandas as pd
import os
import math
import xmltodict

app = Flask(__name__, static_folder='static')

BASE_API_URL = "http://localhost:1888/v2/api"

data = pd.read_csv('./katalog/NGC.csv', sep=';')
data2 = pd.read_csv('./katalog/addendum.csv', sep=';')  
data = pd.concat([data, data2], ignore_index=True)

def great_circle_distance(ra1, dec1, ra2, dec2):
    ra1, dec1, ra2, dec2 = map(math.radians, [ra1, dec1, ra2, dec2])
    delta_ra = ra2 - ra1
    delta_dec = dec2 - dec1
    a = math.sin(delta_dec / 2)**2 + math.cos(dec1)*math.cos(dec2)*math.sin(delta_ra / 2)**2
    c = 2*math.asin(math.sqrt(a))
    return c

def find_closest_image(ra_target, dec_target, xml_file_path):
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
            # RA und Dec direkt auslesen (hier wird angenommen, dass @RA und @Dec in Grad sind)
            ra = float(image['@RA'])
            dec = float(image['@Dec'])
            
            distance = great_circle_distance(ra_target, dec_target, ra, dec)
            if distance < min_distance:
                min_distance = distance
                closest_image = image
        except Exception as e:
            print(f"Error processing image: {e}")
    print(closest_image)
    return closest_image, None

def hms_to_decimal(ra_hms, dec_hms, ra_in_hours=False):

    def dms_to_degrees(dms):
        parts = dms.split(":")
        degrees = float(parts[0]) + float(parts[1])/60.0 + float(parts[2])/3600.0
        return degrees

    # RA in Grad berechnen
    ra_decimal = dms_to_degrees(ra_hms)
    if ra_in_hours:
        # Wenn RA in Stunden wäre, dann ra_decimal * 15.0
        # Aber hier RA in D:M:S => also keine Multiplikation
        ra_decimal = ra_decimal * 15.0

    # DEC in Grad berechnen
    dec_sign = -1 if dec_hms.startswith("-") else 1
    dec_hms = dec_hms.lstrip("-")
    dec_decimal = dec_sign * dms_to_degrees(dec_hms)

    return ra_decimal, dec_decimal


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

    local_appdata_path = os.getenv('LOCALAPPDATA')
    if not local_appdata_path:
        return jsonify({"error": "LOCALAPPDATA environment variable not found"}), 500

    xml_file_path = os.path.join(local_appdata_path, 'NINA', 'FramingAssistantCache', 'CacheInfo.xml')
    if not os.path.exists(xml_file_path):
        return jsonify({"error": f"Cache file not found at {xml_file_path}"}), 404

    enriched_results = []
    for _, row in results_cleaned.iterrows():
        try:
            # RA und Dec in Dezimalgrade umrechnen, RA in D:M:S => ra_in_hours=False
            ra_decimal, dec_decimal = hms_to_decimal(row['RA'], row['Dec'], ra_in_hours=False)
            closest_image, error = find_closest_image(ra_decimal, dec_decimal, xml_file_path)
            
            if error:
                image_info = {"error": error}
            else:
                image_info = {
                    "FileName": closest_image.get('@FileName'),
                    "RA": closest_image.get('@RA'),
                    "Dec": closest_image.get('@Dec'),
                    "Source": closest_image.get('@Source'),
                    "Name": closest_image.get('@Name'),
                }
        except Exception as e:
            image_info = {"error": f"Error during image lookup: {e}"}

        enriched_results.append({
            "Name": row['Name'],
            "Type": row['Type'],
            "RA": row['RA'],
            "Dec": row['Dec'],
            "M": row['M'],
            "Common names": row['Common names'],
            "Image": image_info
        })

    return jsonify(enriched_results)

@app.route('/cache/<path:filename>')
def serve_image_from_cache(filename):
    cache_path = "C:\\Users\\Astro\\AppData\\Local\\NINA\\FramingAssistantCache"
    return send_from_directory(cache_path, filename)


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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

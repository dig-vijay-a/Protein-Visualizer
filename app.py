from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

@app.route("/fetch_pdb/<pdb_id>", methods=["GET"])
def fetch_pdb(pdb_id):
    url = f"https://files.rcsb.org/download/{pdb_id}.pdb"
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify({"pdb_data": response.text})
    return jsonify({"error": "Invalid PDB ID"}), 400

@app.route("/upload_pdb", methods=["POST"])
def upload_pdb():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdb'):
        # Save the file to a temporary location
        file_path = os.path.join('/tmp', file.filename)
        file.save(file_path)
        
        # Read the contents of the uploaded PDB file
        with open(file_path, 'r') as f:
            pdb_data = f.read()
        
        # Optionally, you can delete the file after reading
        os.remove(file_path)
        
        return jsonify({"pdb_data": pdb_data})
    
    return jsonify({"error": "Invalid file format. Please upload a .pdb file."}), 400

if __name__ == "__main__":
    app.run(debug=True)

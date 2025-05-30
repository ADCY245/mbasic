from flask import Flask, render_template, send_from_directory
from waitress import serve
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def home():
    return render_template('display.html')

@app.route('/blankets')
def blankets():
    return render_template('products/blankets/blankets.html')

@app.route('/mpack')
def mpack():
    return render_template('products/chemicals/mpack.html')

# Serve JSON for blankets
@app.route('/blankets-data/<filename>')
def serve_blanket_json(filename):
    return send_from_directory('static/products/blankets', filename)

# Serve JSON for mpack (chemicals)
@app.route('/chemicals-data/<filename>')
def serve_chemical_json(filename):
    return send_from_directory('static/products/chemicals', filename)

if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000)

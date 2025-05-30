from flask import Flask, render_template, send_from_directory
from waitress import serve
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('display.html')

@app.route('/blankets')
def blankets():
    return render_template('products/blankets/blankets.html')

@app.route('/mpack')
def mpack():
    return render_template('products/chemicals/mpack.html')

@app.route('/data/blankets/<filename>')
def serve_blanket_json(filename):
    return send_from_directory('static/products/blankets', filename)

@app.route('/data/chemicals/<filename>')
def serve_chemical_json(filename):
    return send_from_directory('static/products/chemicals', filename)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    serve(app, host='0.0.0.0', port=port)


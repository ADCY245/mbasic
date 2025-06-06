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

# Serve JSON from /static/products/blankets/
@app.route('/blankets-data/<path:filename>')
def blankets_data(filename):
    return send_from_directory('static/products/blankets', filename)

# Serve JSON from /static/chemicals/
@app.route('/chemicals-data/<path:filename>')
def chemicals_data(filename):
    return send_from_directory('static/chemicals', filename)

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8080)

@app.route('/cart')
def cart():
    return render_template('cart.html')

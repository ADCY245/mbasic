from flask import Flask, render_template, send_from_directory, request, redirect, url_for, jsonify, flash
from waitress import serve
import os
import json

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'your-secret-key'  # Needed for flash messages

CART_FILE = os.path.join('static', 'data', 'carts.json')

# ---------- ROUTES ---------- #

@app.route('/')
def home():
    return render_template('display.html')

@app.route('/blankets')
def blankets():
    return render_template('products/blankets/blankets.html')

@app.route('/mpack')
def mpack():
    return render_template('products/chemicals/mpack.html')

@app.route('/cart')
def cart():
    cart_data = load_cart()
    total_price = sum(item['total_price'] for item in cart_data.get('products', []))
    return render_template('cart.html', cart=cart_data, total=total_price)

# ---------- STATIC FILE SERVING ---------- #

@app.route('/blankets-data/<path:filename>')
def blankets_data(filename):
    return send_from_directory('static/products/blankets', filename)

@app.route('/chemicals-data/<path:filename>')
def chemicals_data(filename):
    return send_from_directory('static/chemicals', filename)

# ---------- CART HANDLING ---------- #

def load_cart():
    if not os.path.exists(CART_FILE):
        return {"products": []}
    with open(CART_FILE, 'r') as f:
        return json.load(f)

def save_cart(cart):
    os.makedirs(os.path.dirname(CART_FILE), exist_ok=True)
    with open(CART_FILE, 'w') as f:
        json.dump(cart, f, indent=2)

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product = request.json  # expects keys: name, id, quantity, total_price, redirect_route
    cart = load_cart()

    for item in cart['products']:
        if item['id'] == product['id']:
            item.update(product)
            break
    else:
        if len(cart['products']) < 20:
            cart['products'].append(product)
    save_cart(cart)
    return jsonify(success=True)

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    product_id = request.form['product_id']
    cart = load_cart()
    cart['products'] = [item for item in cart['products'] if item['id'] != product_id]
    save_cart(cart)
    return redirect(url_for('cart'))

@app.route('/send-invoice', methods=['POST'])
def send_invoice():
    # Clear the cart after "sending" invoice
    cart = {"products": []}
    save_cart(cart)

    flash('Invoice sent and cart cleared.', 'success')
    return redirect(url_for('cart'))

# ---------- START APP ---------- #

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8080)

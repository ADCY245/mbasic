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

from flask import request, jsonify

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        cart = []
        if os.path.exists('carts.json'):
            with open('carts.json', 'r') as f:
                cart = json.load(f)
        
        # Check if item already exists in cart
        existing_item = None
        for item in cart:
            if (item['category'] == data['category'] and 
                item['name'] == data['name'] and 
                item.get('machine', '') == data.get('machine', '') and 
                item.get('thickness', '') == data.get('thickness', '') and 
                item.get('size', '') == data.get('size', '')):
                existing_item = item
                break

        if existing_item:
            existing_item['quantity'] += data['quantity']
            existing_item['total_price'] = (existing_item['unit_price'] * existing_item['quantity'])
        else:
            cart.append(data)

        with open('carts.json', 'w') as f:
            json.dump(cart, f, indent=2)

        return jsonify({'success': True})
    except Exception as e:
        print(f"Error adding to cart: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/get_cart', methods=['GET'])
def get_cart():
    try:
        if os.path.exists('carts.json'):
            with open('carts.json', 'r') as f:
                cart = json.load(f)
            return jsonify({'success': True, 'cart': cart})
        return jsonify({'success': True, 'cart': []})
    except Exception as e:
        print(f"Error getting cart: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    product_id = request.form['product_id']
    cart = load_cart()
    cart['products'] = [item for item in cart['products'] if item['id'] != product_id]
    save_cart(cart)
    return redirect(url_for('cart'))

@app.route('/send-quote', methods=['POST'])
def send_quote():
    try:
        # Clear the cart
        if os.path.exists('carts.json'):
            os.remove('carts.json')
        
        return jsonify({'success': True, 'message': 'Quote sent successfully'})
    except Exception as e:
        print(f"Error sending quote: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

# ---------- START APP ---------- #

if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8080)

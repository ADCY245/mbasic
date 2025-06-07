import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Use DATABASE_URL if set (Render/Heroku), else fallback to SQLite for local dev
db_url = os.environ.get('DATABASE_URL')
if db_url:
    # Render/Heroku use 'postgres://', SQLAlchemy needs 'postgresql://'
    db_url = db_url.replace('postgres://', 'postgresql://')
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cart.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class CartItem(db.Model):
    id = db.Column(db.String, primary_key=True)
    category = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    final_price = db.Column(db.Float, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        item = CartItem.query.get(data['id'])
        if item:
            item.quantity += data['quantity']
            item.final_price = data['final_price']
        else:
            item = CartItem(
                id=data['id'],
                category=data['category'],
                name=data['name'],
                quantity=data['quantity'],
                final_price=data['final_price']
            )
            db.session.add(item)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error adding to cart: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/get_cart', methods=['GET'])
def get_cart():
    try:
        items = CartItem.query.all()
        cart = [{
            'id': i.id,
            'category': i.category,
            'name': i.name,
            'quantity': i.quantity,
            'final_price': i.final_price
        } for i in items]
        return jsonify({'success': True, 'cart': cart})
    except Exception as e:
        print(f"Error getting cart: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    try:
        data = request.get_json()
        item = CartItem.query.get(data['id'])
        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Item not found'}), 404
    except Exception as e:
        print(f"Error removing from cart: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/send-quote', methods=['POST'])
def send_quote():
    try:
        num_deleted = CartItem.query.delete()
        db.session.commit()
        # You can add email sending logic here if needed
        return jsonify({'success': True, 'deleted': num_deleted})
    except Exception as e:
        print(f"Error sending quote: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# Add any other routes or logic you need below

if __name__ == '__main__':
    app.run(debug=True)

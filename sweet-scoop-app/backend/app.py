import json
import random
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt

app = Flask(__name__)
CORS(app)  


with open("flavors.json", "r") as f:
    flavors_data = json.load(f)

with open("reviews.json", "r") as f:
    reviews_data = json.load(f)


users = [


    {
        "id": 1,
        "username": "sweet_alice",
        "email": "alice@example.com",
        "password_hash": bcrypt.hashpw(b"IceCream!23", bcrypt.gensalt()).decode(),
        "cart": [],
        "orders": []
    }
]

next_user_id = 2
next_order_id = 1




def find_user_by_id(user_id):
    return next((u for u in users if u["id"] == user_id), None)


def find_flavor_by_id(flavor_id):
    return next((f for f in flavors_data if f["id"] == flavor_id), None)


def validate_signup_data(username, email, password):
    # Username checks
    if not (3 <= len(username) <= 20):
        return False, "Username must be between 3 and 20 characters."
    if not username[0].isalpha():
        return False, "Username must start with a letter."
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", username):
        return False, "Username may only contain letters, numbers, underscores, and hyphens."

    # Email check 
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return False, "Email must be in a valid format."

    # Password checks
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?`~]", password):
        return False, "Password must contain at least one special character."

    return True, None


# POST /signup  

@app.route("/signup", methods=["POST"])
def signup():
    global next_user_id

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid request body."}), 400

    username = data.get("username", "").strip()
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    valid, error_msg = validate_signup_data(username, email, password)
    if not valid:
        return jsonify({"success": False, "message": error_msg}), 400

    if any(u["username"] == username for u in users):
        return jsonify({"success": False, "message": "Username is already taken."}), 409
    if any(u["email"] == email for u in users):
        return jsonify({"success": False, "message": "Email is already registered."}), 409

    # Hash password with bcrypt
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Build and store new user
    new_user = {
        "id": next_user_id,
        "username": username,
        "email": email,
        "password_hash": password_hash,
        "cart": [],
        "orders": []
    }
    users.append(new_user)
    next_user_id += 1

    return jsonify({"success": True, "message": "Registration successful."}), 201


# POST /login 

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid request body."}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = next((u for u in users if u["username"] == username), None)

    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "userId": user["id"],
        "username": user["username"]
    }), 200


# GET /reviews  

@app.route("/reviews", methods=["GET"])
def get_reviews():
    shuffled = random.sample(reviews_data, min(2, len(reviews_data)))
    return jsonify({
        "success": True,
        "message": "Reviews loaded.",
        "reviews": shuffled
    }), 200


# GET /flavors 

@app.route("/flavors", methods=["GET"])
def get_flavors():
    return jsonify({
        "success": True,
        "message": "Flavors loaded.",
        "flavors": flavors_data
    }), 200


# GET /cart  (get cart API)

@app.route("/cart", methods=["GET"])
def get_cart():
    user_id = request.args.get("userId", type=int)
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "message": "Cart loaded.",
        "cart": user["cart"]
    }), 200


# POST /cart  (add to cart API)

@app.route("/cart", methods=["POST"])
def add_to_cart():
    data = request.get_json()
    user_id   = data.get("userId")
    flavor_id = data.get("flavorId")

    user   = find_user_by_id(user_id)
    flavor = find_flavor_by_id(flavor_id)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
    if not flavor:
        return jsonify({"success": False, "message": "Flavor not found."}), 404

    # Check if already in cart
    if any(item["flavorId"] == flavor_id for item in user["cart"]):
        return jsonify({
            "success": False,
            "message": "Flavor already in cart. Use PUT /cart to update quantity."
        }), 409

    # Add to cart
    user["cart"].append({
        "flavorId": flavor["id"],
        "name":     flavor["name"],
        "price":    flavor["price"],
        "quantity": 1
    })

    return jsonify({
        "success": True,
        "message": "Flavor added to cart.",
        "cart": user["cart"]
    }), 200


# PUT /cart (update cart)

@app.route("/cart", methods=["PUT"])
def update_cart():
    data = request.get_json()
    user_id   = data.get("userId")
    flavor_id = data.get("flavorId")
    quantity  = data.get("quantity")

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    cart_item = next((i for i in user["cart"] if i["flavorId"] == flavor_id), None)
    if not cart_item:
        return jsonify({"success": False, "message": "Flavor not found in cart."}), 404

    if not isinstance(quantity, int) or quantity < 1:
        return jsonify({"success": False, "message": "Quantity must be at least 1."}), 400

    cart_item["quantity"] = quantity

    return jsonify({
        "success": True,
        "message": "Cart updated successfully.",
        "cart": user["cart"]
    }), 200


# DELETE /cart  

@app.route("/cart", methods=["DELETE"])
def remove_from_cart():
    data = request.get_json()
    user_id   = data.get("userId")
    flavor_id = data.get("flavorId")

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    user["cart"] = [i for i in user["cart"] if i["flavorId"] != flavor_id]

    return jsonify({
        "success": True,
        "message": "Flavor removed from cart.",
        "cart": user["cart"]
    }), 200


# POST /orders  

@app.route("/orders", methods=["POST"])
def place_order():

    global next_order_id

    data    = request.get_json()
    user_id = data.get("userId")

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
    if not user["cart"]:
        return jsonify({"success": False, "message": "Cart is empty."}), 400

    total = sum(item["price"] * item["quantity"] for item in user["cart"])

    order = {
        "orderId":   next_order_id,
        "items":     [dict(item) for item in user["cart"]],  
        "total":     round(total, 2),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    user["orders"].append(order)
    user["cart"] = []         
    next_order_id += 1

    return jsonify({
        "success": True,
        "message": "Order placed successfully.",
        "orderId": order["orderId"]
    }), 201


# GET /orders

@app.route("/orders", methods=["GET"])
def get_orders():
    """
    Returns the logged-in user's order history.

    Query param: ?userId=<int>

    Steps:
      1. Validate user exists.
      2. Return their orders list (empty list is valid for a new user).
    """
    user_id = request.args.get("userId", type=int)
    user    = find_user_by_id(user_id)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "message": "Order history loaded.",
        "orders": user["orders"]
    }), 200



if __name__ == "__main__":
    app.run(debug=True, port=5000)
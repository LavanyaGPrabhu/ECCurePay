from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from Crypto.PublicKey import ECC
from Crypto.Signature import DSS
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
import bcrypt  # for password hashing
import base64
import hashlib
import os
from werkzeug.security import generate_password_hash
from bson import ObjectId
from flask_pymongo import PyMongo
from cryptography.hazmat.primitives import serialization



app = Flask(__name__)
CORS(app)

# MongoDB Configuration - include the database name
app.config["MONGO_URI"] = "mongodb+srv://darshannakshatri:LTj4bPBUbQrXxfli@isclusterecc.iqpnm.mongodb.net/eccurepay?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Define the users collection
users_collection = mongo.db.users
  
@app.route('/verify-password', methods=['POST'])
def verify_password():
    data = request.json
    user_id = data.get('userId')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({'status': 'error', 'message': 'User ID and password are required.'}), 400

    try:
        # Fetch the user from the database using the provided user ID
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found.'}), 404

        # Check if the provided password matches the stored hashed password
        if bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'status': 'success', 'message': 'Password verified successfully.'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Incorrect password.'}), 401

    except Exception as e:
        print(f"Error verifying password: {e}")
        return jsonify({'status': 'error', 'message': 'Password verification failed.'}), 500


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided.'}), 400

    username = data.get('username')
    phone = data.get('phone')
    email = data.get('email')
    age = data.get('age')
    password = data.get('password')

    if not username or not phone or not email or not age or not password:
        return jsonify({'status': 'error', 'message': 'All fields are required.'}), 400

    # Check if user already exists
    if users_collection.find_one({'username': username}):
        return jsonify({'status': 'error', 'message': 'User already exists.'}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_data = {
        'username': username,
        'phone': phone,
        'email': email,
        'age': age,
        'password': hashed_password,
        'cards': []  # Initialize an empty list for storing card information
    }

    try:
        users_collection.insert_one(user_data)
        return jsonify({'status': 'success', 'message': 'User created successfully.'}), 201
    except Exception as e:
        print(f"Error inserting user: {e}")
        return jsonify({'status': 'error', 'message': 'Signup failed. Please try again.'}), 500




#Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'status': 'error', 'message': 'Username and password are required.'}), 400

    user = users_collection.find_one({'username': username})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'status': 'success', 'userId': str(user['_id']), 'message': 'Login successful.'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Invalid username or password.'}), 401
    



    
key_file = "ecc_private_key.pem"

if not os.path.exists(key_file):
    # Generate new key if it doesn't exist
    encryption_private_key = ECC.generate(curve='P-256')
    with open(key_file, "wb") as f:
        f.write(encryption_private_key.export_key(format='PEM').encode())
else:
    # Load existing key
    with open(key_file, "rb") as f:
        encryption_private_key = ECC.import_key(f.read())

encryption_public_key = encryption_private_key.public_key()

# Encryption and decryption helper functions
def encrypt_message(public_key, message):
    shared_secret = public_key.pointQ * encryption_private_key.d
    shared_secret_bytes = int(shared_secret.x).to_bytes(32, byteorder='big')
    aes_key = SHA256.new(shared_secret_bytes).digest()

    cipher = AES.new(aes_key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(message.encode('utf-8'))
    return {
        "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
        "nonce": base64.b64encode(cipher.nonce).decode('utf-8'),
        "tag": base64.b64encode(tag).decode('utf-8')
    }

def decrypt_message(private_key, encrypted_data):
    ciphertext = base64.b64decode(encrypted_data['ciphertext'])
    nonce = base64.b64decode(encrypted_data['nonce'])
    tag = base64.b64decode(encrypted_data['tag'])
    shared_secret = encryption_public_key.pointQ * private_key.d
    shared_secret_bytes = int(shared_secret.x).to_bytes(32, byteorder='big')
    aes_key = SHA256.new(shared_secret_bytes).digest()
    
    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
    decrypted_message = cipher.decrypt_and_verify(ciphertext, tag)
    return decrypted_message.decode('utf-8')


@app.route('/encrypt', methods=['POST'])
def encrypt():
    data = request.get_json()
    card_network = data['cardNetwork']
    card_type = data['cardType']
    card_number = data['cardNumber']
    card_holder_name = data['cardHolderName']
    expiry_date = data['expiryDate']
    cvv = data['cvv']
    
    encrypted_card_network = encrypt_message(encryption_public_key, card_network)
    encrypted_card_type = encrypt_message(encryption_public_key, card_type)
    encrypted_card_number = encrypt_message(encryption_public_key, card_number)
    encrypted_card_holder_name = encrypt_message(encryption_public_key, card_holder_name)
    encrypted_expiry_date = encrypt_message(encryption_public_key, expiry_date)
    encrypted_cvv = encrypt_message(encryption_public_key, cvv)
    
    return jsonify({
        "encrypted_card_network": encrypted_card_network,
        "encrypted_card_type": encrypted_card_type,
        "encrypted_card_number": encrypted_card_number,
        "encrypted_card_holder_name": encrypted_card_holder_name,
        "encrypted_expiry_date": encrypted_expiry_date,
        "encrypted_cvv": encrypted_cvv
    })



@app.route('/store-encrypted', methods=['POST'])
def store_encrypted():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    encrypted_data = {
        "encrypted_card_network": data['encrypted_card_network'],
        "encrypted_card_type": data['encrypted_card_type'],
        "encrypted_card_number": data['encrypted_card_number'],
        "encrypted_card_holder_name": data['encrypted_card_holder_name'],
        "encrypted_expiry_date": data['encrypted_expiry_date'],
        "encrypted_cvv": data['encrypted_cvv']
    }

    try:
        # Convert user_id to ObjectId and update the user document
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'cards': encrypted_data}}  # Append encrypted data to the user's 'cards' list
        )
        return jsonify({"status": "Stored successfully"}), 201
    except Exception as e:
        print(f"Error storing card data: {e}")
        return jsonify({"error": "Failed to store card data"}), 500
    


@app.route('/retrieve-encrypted', methods=['POST'])
def retrieve_encrypted():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Convert user_id to ObjectId and fetch the user's card data
        user_data = users_collection.find_one({"_id": ObjectId(user_id)}, {"cards": 1})

        if user_data and "cards" in user_data:
            # Return the stored encrypted data directly
            return jsonify(user_data["cards"]), 200
        else:
            return jsonify({"error": "No cards found for this user"}), 404
    except Exception as e:
        print(f"Error retrieving cards: {e}")
        return jsonify({"error": "Failed to retrieve cards"}), 500



@app.route('/decrypt', methods=['POST'])
def decrypt():
    data = request.get_json()
    encrypted_card_network = data['encryptedCardNetwork']
    encrypted_card_type = data['encryptedCardType']
    encrypted_card_number = data['encryptedCardNumber']
    encrypted_card_holder_name = data['encryptedCardHolderName']
    encrypted_expiry_date = data['encryptedExpiryDate']
    encrypted_cvv = data['encryptedCvv']

    decrypted_card_network = decrypt_message(encryption_private_key, encrypted_card_network)
    decrypted_card_type = decrypt_message(encryption_private_key, encrypted_card_type)
    decrypted_card_number = decrypt_message(encryption_private_key, encrypted_card_number)
    decrypted_card_holder_name = decrypt_message(encryption_private_key, encrypted_card_holder_name)
    decrypted_expiry_date = decrypt_message(encryption_private_key, encrypted_expiry_date)
    decrypted_cvv = decrypt_message(encryption_private_key, encrypted_cvv)

    return jsonify({
        "decrypted_card_network": decrypted_card_network,
        "decrypted_card_type": decrypted_card_type,
        "decrypted_card_number": decrypted_card_number,
        "decrypted_card_holder_name": decrypted_card_holder_name,
        "decrypted_expiry_date": decrypted_expiry_date,
        "decrypted_cvv": decrypted_cvv
    })


@app.route('/retrieve-decrypted', methods=['POST'])
def retrieve_decrypted():
    data = request.get_json()
    user_id = data.get("userId")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Fetch the user's encrypted card data
        user_data = users_collection.find_one({"_id": ObjectId(user_id)}, {"cards": 1})

        if user_data and "cards" in user_data:
            decrypted_cards = []
            for card in user_data["cards"]:
                decrypted_card = {
                    "card_network": decrypt_message(encryption_private_key, card["encrypted_card_network"]),
                    "card_type": decrypt_message(encryption_private_key, card["encrypted_card_type"]),
                    "card_number": decrypt_message(encryption_private_key, card["encrypted_card_number"]),
                    "card_holder_name": decrypt_message(encryption_private_key, card["encrypted_card_holder_name"]),
                    "expiry_date": decrypt_message(encryption_private_key, card["encrypted_expiry_date"]),
                    "cvv": decrypt_message(encryption_private_key, card["encrypted_cvv"])
                }
                decrypted_cards.append(decrypted_card)

            return jsonify(decrypted_cards), 200
        else:
            return jsonify({"error": "No cards found for this user"}), 404
    except Exception as e:
        print(f"Error retrieving or decrypting cards: {e}")
        return jsonify({"error": "Failed to retrieve or decrypt cards"}), 500






if __name__ == '__main__':
    app.run(port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'fd481ed6555e791ab9a4e49c248e8374574e7fd294965dd2f5c780638ba56180' 
bcrypt = Bcrypt(app)
CORS(app)

# MongoDB setup
MONGO_URI = "mongodb://localhost:27017/"  # Replace with your MongoDB URI
client = MongoClient(MONGO_URI)
db = client['resume_analyzer']  # Replace with your database name
users_collection = db['users']

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    role = data.get('role')  # New field: 'recruiter' or 'job_seeker'

    # Validate required fields
    if not email or not username or not first_name or not last_name or not password or not role:
        return jsonify({"error": "All fields are required, including role"}), 400

    # Validate role
    if role not in ['recruiter', 'job_seeker']:
        return jsonify({"error": "Invalid role. Must be 'recruiter' or 'job_seeker'"}), 400

    # Check if email or username already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Save user to database
    users_collection.insert_one({
        "email": email,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "password": hashed_password,
        "role": role,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "User registered successfully!"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # New field: 'recruiter' or 'job_seeker'

    # Validate required fields
    if not username or not password or not role:
        return jsonify({"error": "Both username, password, and role are required"}), 400

    # Validate role
    if role not in ['recruiter', 'job_seeker']:
        return jsonify({"error": "Invalid role. Must be 'recruiter' or 'job_seeker'"}), 400

    # Find user by username and role
    user = users_collection.find_one({"username": username, "role": role})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username, password, or role"}), 401

    # Generate JWT token
    token = jwt.encode({
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }, app.secret_key, algorithm="HS256")

    return jsonify({"message": "Login successful!", "token": token}), 200


if __name__ == '__main__':
    app.run(debug=True)

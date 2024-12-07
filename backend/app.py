from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from pymongo import MongoClient
import jwt
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
from functools import wraps
from file_parser import extract_text_from_pdf, extract_text_from_docx
from similarity import calculate_similarity
from feedback import generate_feedback
import chardet

app = Flask(__name__)
app.secret_key = 'fd481ed6555e791ab9a4e49c248e8374574e7fd294965dd2f5c780638ba56180'
bcrypt = Bcrypt(app)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create the folder if it doesn't exist
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# MongoDB setup
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['resume_analyzer']
users_collection = db['users']

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# Helper functions
def detect_file_encoding(file_path):
    with open(file_path, 'rb') as f:
        raw_data = f.read()
    result = chardet.detect(raw_data)
    return result['encoding']

def convert_to_utf8(input_path, output_path):
    encoding = detect_file_encoding(input_path)
    with open(input_path, 'r', encoding=encoding) as infile:
        content = infile.read()
    with open(output_path, 'w', encoding='utf-8') as outfile:
        outfile.write(content)

def allowed_file(filename, allowed_extensions):
    """Check if a file is of an allowed type."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({"error": "Authorization token is required"}), 403
            
            # Check token format
            try:
                token = token.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 403

            # Decode and verify token
            try:
                decoded = jwt.decode(token, app.secret_key, algorithms=["HS256"])
                print("Decoded Token:", decoded)
                user_role = decoded.get("role")
                if user_role != required_role:
                    return jsonify({"error": f"Access denied for {user_role} role"}), 403
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError as e:
                return jsonify({"error": f"Invalid token: {str(e)}"}), 401
            
            return fn(*args, **kwargs)
        return decorated
    return wrapper

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    role = data.get('role')

    if not email or not username or not first_name or not last_name or not password or not role:
        return jsonify({"error": "All fields are required, including role"}), 400

    if role not in ['recruiter', 'job_seeker']:
        return jsonify({"error": "Invalid role. Must be 'recruiter' or 'job_seeker'"}), 400

    if users_collection.find_one({"email": email}) or users_collection.find_one({"username": username}):
        return jsonify({"error": "Email or username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
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
    role = data.get('role')

    if not username or not password or not role:
        return jsonify({"error": "Both username, password, and role are required"}), 400

    user = users_collection.find_one({"username": username, "role": role})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username, password, or role"}), 401

    token = jwt.encode({
        "username": username,
        "role": role,
        "user_id": str(user['_id']),
        "exp": datetime.utcnow() + timedelta(hours=8)
    }, app.secret_key, algorithm="HS256")

    return jsonify({"message": "Login successful!", "token": token}), 200

@app.route('/upload', methods=['POST'])
@role_required('job_seeker')
def upload_file():
    if 'resume' not in request.files or 'job_description' not in request.files:
        return jsonify({"error": "Both resume and job description files are required"}), 400

    resume = request.files['resume']
    job_description = request.files['job_description']

    if resume.filename == '' or job_description.filename == '':
        return jsonify({"error": "No selected files"}), 400

    if not allowed_file(resume.filename, {'pdf', 'docx'}):
        return jsonify({"error": "Resume must be a PDF or DOCX file"}), 400
    if not allowed_file(job_description.filename, {'txt'}):
        return jsonify({"error": "Job description must be a TXT file"}), 400

    resume_filename = secure_filename(resume.filename)
    job_description_filename = secure_filename(job_description.filename)
    
    resume_path = os.path.join(app.config['UPLOAD_FOLDER'], resume_filename)
    job_description_path = os.path.join(app.config['UPLOAD_FOLDER'], job_description_filename)
    
    resume.save(resume_path)
    job_description.save(job_description_path)
    
    return jsonify({
        "message": "Files uploaded successfully",
        "resume_path": resume_path,
        "job_description_path": job_description_path
    }), 200

@app.route('/analyze', methods=['POST'])
@role_required('job_seeker')
def analyze_resume():
    data = request.json
    resume_path = data.get('resume_path')
    job_description_path = data.get('job_description_path')

    if not resume_path or not job_description_path:
        return jsonify({"error": "Both resume and job description paths are required"}), 400

    detected_encoding = detect_file_encoding(job_description_path)
    print(f"Detected encoding for job description: {detected_encoding}")

    try:
        with open(job_description_path, 'r', encoding='utf-8', errors='replace') as job_file:
            job_description_text = job_file.read()

        with open(resume_path, 'r', encoding='utf-8', errors='replace') as resume_file:
            resume_text = resume_file.read()

        match_percentage = calculate_similarity(resume_text, job_description_text)*100
        feedback = generate_feedback(resume_text, job_description_text)

        return jsonify({
            "match_percentage": match_percentage,
            "feedback": feedback
        }), 200
    except FileNotFoundError as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404
    except UnicodeDecodeError as e:
        return jsonify({"error": f"File encoding error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
@app.route('/generate_cover_letter', methods=['POST'])
@role_required('job_seeker')
def generate_cover_letter():
    data = request.json
    resume_path = data.get('resume_path')
    job_description_path = data.get('job_description_path')

    if not resume_path or not job_description_path:
        return jsonify({"error": "Resume path and job description path are required"}), 400

    try:
        # Extract text from the resume
        if resume_path.endswith('.pdf'):
            resume_text = extract_text_from_pdf(resume_path)
        elif resume_path.endswith('.docx'):
            resume_text = extract_text_from_docx(resume_path)
        else:
            return jsonify({"error": "Invalid resume file type"}), 400

        # Extract text from the job description
        if job_description_path.endswith('.txt'):
            with open(job_description_path, 'r', encoding='utf-8', errors='replace') as file:
                job_description_text = file.read()
        elif job_description_path.endswith('.pdf'):
            job_description_text = extract_text_from_pdf(job_description_path)
        elif job_description_path.endswith('.docx'):
            job_description_text = extract_text_from_docx(job_description_path)
        else:
            return jsonify({"error": "Invalid job description file type"}), 400

        # Extract skills from the resume and job description
        resume_skills = extract_skills(resume_text)
        job_description_skills = extract_skills(job_description_text)

        # Match the top skills between the resume and the job description
        matching_skills = list(set(resume_skills) & set(job_description_skills))
        if not matching_skills:
            matching_skills = ["your unique skills and experiences"]  # Fallback text

        # Generate the cover letter
        cover_letter = f"""
        Dear Hiring Manager,

        I am excited to apply for the position as described in your job posting. With my expertise in {', '.join(matching_skills[:5])}, 
        I am confident in my ability to contribute to your team's success.

        The job description highlights requirements such as {', '.join(job_description_skills[:5])}. 
        My professional experience and skillset align perfectly with these needs.

        Thank you for considering my application. I would love the opportunity to discuss how my skills and experiences align with your requirements.

        Best regards,
        [Your Name]
        """

        return jsonify({"cover_letter": cover_letter}), 200

    except FileNotFoundError as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Helper function to extract skills
def extract_skills(text):
    # Sample keywords (can be expanded or loaded from an external source)
    skills = [
        "Python", "Flask", "Django", "SQL", "JavaScript", "React", "Node.js",
        "Machine Learning", "Data Analysis", "AWS", "Azure", "Docker", "Kubernetes",
        "Communication", "Leadership", "Problem-Solving", "Critical Thinking"
    ]
    text = text.lower()
    extracted_skills = [skill for skill in skills if skill.lower() in text]
    return extracted_skills

@app.route('/bulk_analyze', methods=['POST'])
@role_required('recruiter')
def bulk_analyze():
    data = request.json
    resumes = data.get('resumes')
    job_description_path = data.get('job_description_path')

    if not resumes or not job_description_path:
        return jsonify({"error": "Resumes and job description paths are required"}), 400

    # Handle job description file
    try:
        if job_description_path.endswith('.txt'):
            with open(job_description_path, 'r', encoding='utf-8', errors='replace') as file:
                job_description_text = file.read()
        elif job_description_path.endswith('.pdf'):
            job_description_text = extract_text_from_pdf(job_description_path)
        elif job_description_path.endswith('.docx'):
            job_description_text = extract_text_from_docx(job_description_path)
        else:
            return jsonify({"error": "Invalid job description file type"}), 400
    except FileNotFoundError as e:
        return jsonify({"error": f"Job description file not found: {str(e)}"}), 404

    # Handle resumes
    results = []
    for resume_path in resumes:
        try:
            if resume_path.endswith('.pdf'):
                resume_text = extract_text_from_pdf(resume_path)
            elif resume_path.endswith('.docx'):
                resume_text = extract_text_from_docx(resume_path)
            else:
                results.append({"error": f"Invalid resume file type: {resume_path}"})
                continue

            # Calculate similarity
            match_percentage = calculate_similarity(resume_text, job_description_text)
            results.append({"resume": resume_path, "match_percentage": match_percentage})
        except FileNotFoundError as e:
            results.append({"error": f"Resume file not found: {str(e)}"})

    return jsonify({"results": results}), 200

@app.route('/upload_multiple', methods=['POST'])
@role_required('recruiter')
def upload_multiple():
    try:
        if 'job_description' not in request.files:
            return jsonify({"error": "Job description file is required"}), 400

        if 'resumes' not in request.files:
            return jsonify({"error": "At least one resume file is required"}), 400

        job_description_file = request.files['job_description']
        resume_files = request.files.getlist('resumes')

        # Save job description file
        job_description_path = os.path.join(UPLOAD_FOLDER, secure_filename(job_description_file.filename))
        job_description_file.save(job_description_path)

        # Save resume files
        resume_paths = []
        for resume_file in resume_files:
            resume_path = os.path.join(UPLOAD_FOLDER, secure_filename(resume_file.filename))
            resume_file.save(resume_path)
            resume_paths.append(resume_path.replace("\\", "/"))  # Replace backslashes with slashes

        return jsonify({
            "job_description_path": job_description_path.replace("\\", "/"),  # Replace backslashes with slashes
            "resumes": resume_paths
        }), 200
    except Exception as e:
        print('Error in upload_multiple:', str(e))
        return jsonify({"error": "An unexpected error occurred"}), 500



if __name__ == '__main__':
    app.run(debug=True)

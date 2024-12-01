from flask import Flask, request, jsonify
from flask_cors import CORS
from file_parser import extract_text_from_docx, extract_text_from_pdf
from similarity import calculate_similarity
from feedback import generate_feedback
import os

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return 'Welcome to the Resume Analyzer!'


@app.route('/upload', methods=['POST'])
def upload():
    print("Request files:", request.files)  # Debugging line to see the incoming files

    resume_file = request.files.get('resume')
    job_description_file = request.files.get('job_description')

    if resume_file is None:
        return "No resume file provided. Please ensure you are using the correct key 'resume'.", 400
    if job_description_file is None:
        return "No job description file provided. Please ensure you are using the correct key 'job_description'.", 400

    # Extract text from uploaded files based on file type
    if resume_file.filename.endswith('.pdf'):
        resume_text = extract_text_from_pdf(resume_file)
    elif resume_file.filename.endswith('.docx'):
        resume_text = extract_text_from_docx(resume_file)
    else:
        return "Invalid resume file format. Please upload a .pdf or .docx file.", 400

    if job_description_file.filename.endswith('.txt'):
        job_description_text = job_description_file.read().decode('utf-8').strip()
    else:
        return "Invalid job description file format. Please upload a .txt file.", 400

    # Calculate similarity
    match_percentage = calculate_similarity(resume_text, job_description_text)

    # Generate feedback
    feedback = generate_feedback(resume_text, job_description_text)

    print({
        "match_percentage": match_percentage,
        "feedback": feedback
    })

    return jsonify({
        "match_percentage": match_percentage,
        "feedback": feedback
    })

if __name__ == '__main__':
    app.run(debug=True)

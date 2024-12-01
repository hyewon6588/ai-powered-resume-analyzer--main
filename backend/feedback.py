from nlp_processing import process_text

def generate_feedback(resume_text, job_description_text):
    # Extract keywords from both the resume and the job description
    resume_keywords = set(process_text(resume_text))
    job_keywords = set(process_text(job_description_text))

    # Identify missing keywords
    missing_keywords = job_keywords - resume_keywords

    if missing_keywords:
        feedback = f"Your resume is missing the following keywords: {', '.join(missing_keywords)}"
    else:
        feedback = "Your resume matches the job description well."

    return feedback

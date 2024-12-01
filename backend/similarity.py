from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(resume_text, job_description_text):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_description_text])
    cosine_sim = cosine_similarity(vectors[0:1], vectors[1:2])
    return round(cosine_sim[0][0] * 100, 2)

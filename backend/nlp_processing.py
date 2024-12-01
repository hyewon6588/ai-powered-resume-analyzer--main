import spacy

# Load SpaCy model
nlp = spacy.load('en_core_web_sm')

def process_text(text):
    doc = nlp(text)
    return [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]

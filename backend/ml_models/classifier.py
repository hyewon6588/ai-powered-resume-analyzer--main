# backend/ml_models/classifier.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def predict_resume_category(resume_text):
    # 1. loading the dataset
    df = pd.read_csv("../backend/resume_dataset.csv")
    resumes = df["Resume"].astype(str)
    labels = df["Category"]

    # 2. vectorizing the resumes
    vectorizer = TfidfVectorizer(max_features=5000)
    X = vectorizer.fit_transform(resumes)

    #3. splitting the dataset into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=0.2, random_state=42
    )

    # 4. training the model
    model = LogisticRegression(max_iter=1000,class_weight="balanced")
    model.fit(X_train, y_train)

    #5. evaluating the model
    y_pred = model.predict(X_test)
    print("Accuracy on test set:", accuracy_score(y_test, y_pred))
    print("Classification Report:\n", classification_report(y_test, y_pred))

    # 6. predicting the category of the input resume
    input_vec = vectorizer.transform([resume_text])
    predicted = model.predict(input_vec)[0]

    return predicted

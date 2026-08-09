import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # Features
    attendance = np.random.uniform(50, 100, num_samples)
    assignment_score = np.random.uniform(40, 100, num_samples)
    practice_score = np.random.uniform(30, 100, num_samples)
    exam_score = np.random.uniform(30, 100, num_samples)
    missing_assignments = np.random.randint(0, 10, num_samples)
    
    data = pd.DataFrame({
        'attendance': attendance,
        'assignment_score': assignment_score,
        'practice_score': practice_score,
        'exam_score': exam_score,
        'missing_assignments': missing_assignments
    })
    
    # Logic for target (Performance Level)
    # 0: Critical/Weak, 1: Average, 2: Strong
    
    def label_performance(row):
        score = (row['attendance'] * 0.2 + 
                 row['assignment_score'] * 0.2 + 
                 row['practice_score'] * 0.2 + 
                 row['exam_score'] * 0.4 - 
                 row['missing_assignments'] * 5)
        
        if score < 50:
            return 0 # Weak/Critical
        elif score < 75:
            return 1 # Average
        else:
            return 2 # Strong

    data['performance_level'] = data.apply(label_performance, axis=1)
    return data

def train_and_save_model():
    print("Generating synthetic training data...")
    data = generate_synthetic_data()
    
    X = data.drop('performance_level', axis=1)
    y = data['performance_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        objective='multi:softprob',
        num_class=3,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained with accuracy: {accuracy:.2f}")
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'performance_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()

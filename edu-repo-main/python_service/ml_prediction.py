import os
import pandas as pd
import numpy as np
import joblib
from sqlalchemy import create_engine
from typing import List, Dict, Any

# Database setup
# Use existing env or default
DB_URL = "mysql+mysqlconnector://root:root@localhost:3306/edu_ml"
engine = create_engine(DB_URL)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'performance_model.joblib')

def get_student_metrics(student_id: int):
    # Fetch all subjects for the student's class
    query_class = f"""
        SELECT c.class_id FROM users u 
        JOIN classrooms c ON u.classroom_id = c.class_id 
        WHERE u.user_id = {student_id}
    """
    class_df = pd.read_sql(query_class, engine)
    if class_df.empty:
        return []
    
    class_id = class_df.iloc[0]['class_id']
    
    # Fetch enrolled subjects for this classroom
    query_subjects = f"""
        SELECT s.subject_id, s.name as subject_name, cs.id as class_subject_id
        FROM class_subjects cs
        JOIN subjects s ON cs.subject_id = s.subject_id
        WHERE cs.classroom_id = {class_id}
    """
    subjects_df = pd.read_sql(query_subjects, engine)
    
    if subjects_df.empty:
        # Fallback to all subjects in case class_subjects is not configured
        query_all_subjects = "SELECT subject_id, name as subject_name FROM subjects"
        subjects_df = pd.read_sql(query_all_subjects, engine)
        subjects_df['class_subject_id'] = None
    
    metrics = []
    
    for _, sub in subjects_df.iterrows():
        sub_id = sub['subject_id']
        sub_name = sub['subject_name']
        class_subject_id = sub.get('class_subject_id') if 'class_subject_id' in subjects_df.columns else None
        if pd.isna(class_subject_id) or class_subject_id is None:
            # Look up or fallback to a matching class_subject_id if possible
            q_cs_lookup = f"SELECT id FROM class_subjects WHERE subject_id = {sub_id} LIMIT 1"
            cs_lookup_df = pd.read_sql(q_cs_lookup, engine)
            class_subject_id = cs_lookup_df.iloc[0]['id'] if not cs_lookup_df.empty else sub_id
        
        # Attendance
        q_att = f"SELECT status FROM attendance WHERE student_id = {student_id} AND subject_id = {sub_id}"
        att_df = pd.read_sql(q_att, engine)
        att_pct = 85.0
        if not att_df.empty:
            presents = (att_df['status'] == 'PRESENT').sum()
            att_pct = (presents / len(att_df)) * 100 if len(att_df) > 0 else 85.0
        
        # Assignments & Submissions
        q_assign = f"SELECT assignment_id FROM assignments WHERE classroom_id = {class_id} AND subject_id = {sub_id}"
        assign_df = pd.read_sql(q_assign, engine)
        
        q_sub = f"SELECT assignment_id FROM submissions WHERE student_id = {student_id}"
        sub_df = pd.read_sql(q_sub, engine)
        
        missing_count = 0
        if not assign_df.empty:
            missing_count = len(assign_df) - len(assign_df[assign_df['assignment_id'].isin(sub_df['assignment_id'])])
        
        # Average assignment score (placeholder or real data if available in submission)
        # Using grade if numeric, otherwise default
        q_grades = f"SELECT grade FROM submissions WHERE student_id = {student_id} AND assignment_id IN (SELECT assignment_id FROM assignments WHERE subject_id = {sub_id})"
        grades_df = pd.read_sql(q_grades, engine)
        assign_score = 80.0
        if not grades_df.empty:
            # Try to parse grades as floats if possible
            grades_df['grade_val'] = pd.to_numeric(grades_df['grade'], errors='coerce')
            if not grades_df['grade_val'].dropna().empty:
                assign_score = grades_df['grade_val'].mean()
        
        # Practice Scores
        q_prac = f"SELECT score FROM practice_history WHERE user_id = {student_id} AND class_subject_id IN (SELECT id FROM class_subjects WHERE subject_id = {sub_id})"
        prac_df = pd.read_sql(q_prac, engine)
        prac_score = prac_df['score'].mean() if not prac_df.empty else 75.0
        
        # Exam Marks
        q_marks = f"SELECT marks_obtained, total_marks FROM marks WHERE student_id = {student_id} AND subject_id = {sub_id}"
        marks_df = pd.read_sql(q_marks, engine)
        exam_score = 70.0
        if not marks_df.empty:
            valid_marks = marks_df[marks_df['total_marks'] > 0]
            if not valid_marks.empty:
                exam_score = (valid_marks['marks_obtained'] / valid_marks['total_marks']).mean() * 100
        
        # Ensure values are standard Python floats for JSON serialization
        att_pct = float(round(att_pct, 2))
        assign_score = float(round(assign_score, 2))
        prac_score = float(round(prac_score, 2))
        exam_score = float(round(exam_score, 2))
        
        metrics.append({
            'subject_id': sub_id,
            'subject_name': sub_name,
            'class_subject_id': int(class_subject_id) if class_subject_id is not None else None,
            'attendance': att_pct,
            'assignment_score': assign_score,
            'practice_score': prac_score,
            'exam_score': exam_score,
            'missing_assignments': missing_count
        })
        
    return metrics

def predict_performance(student_id: int):
    if not os.path.exists(MODEL_PATH):
        return {"error": "Model not found"}
    
    model = joblib.load(MODEL_PATH)
    metrics = get_student_metrics(student_id)
    
    if not metrics:
        return {"error": "No data found for student"}
    
    results = []
    for m in metrics:
        features = np.array([[
            m['attendance'],
            m['assignment_score'],
            m['practice_score'],
            m['exam_score'],
            m['missing_assignments']
        ]])
        
        probs = model.predict_proba(features)[0]
        pred_idx = int(np.argmax(probs))  # cast to Python int to avoid np.int64
        confidence = float(probs[pred_idx] * 100)
        
        levels = ["Critical", "Average", "Strong"]
        # Map 0 to Weak/Critical, 1 to Average, 2 to Strong
        perf_level = levels[pred_idx]
        if pred_idx == 0:
             risk = "Critical" if confidence > 80 else "Weak"
        else:
             risk = "None"

        # Reason and Recommendation generation
        strength_reasons = []
        weak_reasons = []
        recommendations = []
        
        # 1. Evaluate Attendance
        if m['attendance'] >= 90:
            strength_reasons.append(f"Excellent attendance record ({m['attendance']:.1f}%)")
        elif m['attendance'] < 75:
            weak_reasons.append(f"Low attendance ({m['attendance']:.1f}%)")
            recommendations.append("Prioritize attending more live classes to catch up on core concepts")
            
        # 2. Evaluate Assignments
        if m['missing_assignments'] == 0:
            strength_reasons.append("Highly consistent assignment submissions")
        else:
            weak_reasons.append(f"{m['missing_assignments']} missing assignments")
            recommendations.append(f"Complete the {m['missing_assignments']} pending assignments to reinforce learning")
            
        # 3. Evaluate Practice Performance
        if m['practice_score'] >= 85:
            strength_reasons.append("Exceptional performance in AI practice sessions")
        elif m['practice_score'] < 65:
            weak_reasons.append("Needs improvement in AI practice drills")
            recommendations.append(f"Focus on practicing 15-20 more questions in {m['subject_name']} this week")

        # 4. Evaluate Exam Scores
        if m['exam_score'] >= 80:
            strength_reasons.append("Strong grasp of concepts reflected in exam scores")
        elif m['exam_score'] < 60:
            weak_reasons.append("Exam performance shows foundational gaps")
            recommendations.append("Review previous exam patterns and sample questions")

        # Fallbacks for empty lists
        if not strength_reasons:
            strength_reasons.append("Steady progress in the subject")
        if not weak_reasons:
            weak_reasons.append("Minor room for improvement in overall engagement")
            recommendations.append("Try setting a daily study goal to boost consistency")
        if not recommendations:
            recommendations.append("Keep up the current momentum and stay consistent!")

        results.append({
            "subject": m['subject_name'],
            "subjectId": int(m['subject_id']),
            "classSubjectId": int(m['class_subject_id']) if m.get('class_subject_id') is not None else None,
            "performance": "Strong" if pred_idx == 2 else "Average" if pred_idx == 1 else risk,
            "confidence": float(round(confidence, 1)),
            "probability": float(round(confidence, 1)) if pred_idx == 0 else 0.0,
            "risk": risk if pred_idx == 0 else "None",
            "attendance": float(round(float(m['attendance']), 1)),
            "assignmentAverage": float(round(float(m['assignment_score']), 1)),
            "practiceAverage": float(round(float(m['practice_score']), 1)),
            "examAverage": float(round(float(m['exam_score']), 1)),
            "trend": "Strong" if pred_idx == 2 else "Improving" if pred_idx == 1 else "Declining",
            "reason": strength_reasons if pred_idx == 2 else (weak_reasons if pred_idx == 0 else strength_reasons + weak_reasons),
            "recommendation": recommendations
        })
    
    # Format for response
    strong = [r for r in results if r['performance'] == "Strong"]
    weak = [r for r in results if r['performance'] in ["Weak", "Critical"]]
    
    # Fallback: if no strong/weak subjects found by model, take top/bottom by confidence
    if not strong:
        # Take subjects with highest practice/exam scores
        sorted_by_best = sorted(results, key=lambda x: x['examAverage'] + x['practiceAverage'], reverse=True)
        strong = sorted_by_best[:3]
        for s in strong: s['performance'] = "Strong" # Mark as strong for UI

    if not weak:
        # Take subjects with lowest scores
        sorted_by_weak = sorted(results, key=lambda x: x['examAverage'] + x['practiceAverage'])
        weak = [s for s in sorted_by_weak if s not in strong][:2]
        for w in weak: 
            w['performance'] = "Weak" # Mark as weak for UI
            w['risk'] = "Low"
            w['probability'] = 30 # Default probability for fallback weak

    strong.sort(key=lambda x: x['confidence'], reverse=True)

    # Calculate overall performance
    all_confidences = [r['confidence'] for r in results]
    avg_conf = float(np.mean(all_confidences)) if all_confidences else 0.0
    
    overall = "Average"
    if len(strong) > len(results) / 2: overall = "Strong"
    elif len(weak) > len(results) / 2: overall = "Weak"

    return {
        "studentId": student_id,
        "overallPerformance": overall,
        "strongSubjects": strong[:3],
        "weakSubjects": weak,
        "subjects": results
    }

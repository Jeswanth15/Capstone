import pandas as pd
from sqlalchemy import create_engine

DB_URL = "mysql+mysqlconnector://root:root@localhost:3306/edu_ml"
engine = create_engine(DB_URL)

def check_student(student_id):
    # Student Info
    u = pd.read_sql(f"SELECT * FROM users WHERE user_id = {student_id}", engine)
    print("--- STUDENT INFO ---")
    print(u)
    
    # Class
    c = pd.read_sql(f"SELECT * FROM classrooms WHERE class_id = (SELECT classroom_id FROM users WHERE user_id = {student_id})", engine)
    print("\n--- CLASSROOM ---")
    print(c)
    
    # Subjects
    s = pd.read_sql("SELECT * FROM subjects", engine)
    print("\n--- SUBJECTS ---")
    print(s)
    
    # Marks
    m = pd.read_sql(f"SELECT * FROM marks WHERE student_id = {student_id}", engine)
    print("\n--- MARKS ---")
    print(m)
    
    # Attendance
    a = pd.read_sql(f"SELECT subject_id, status, count(*) as count FROM attendance WHERE student_id = {student_id} GROUP BY subject_id, status", engine)
    print("\n--- ATTENDANCE ---")
    print(a)
    
    # Submissions
    sub = pd.read_sql(f"SELECT * FROM submissions WHERE student_id = {student_id}", engine)
    print("\n--- SUBMISSIONS ---")
    print(sub)

if __name__ == "__main__":
    check_student(2) # student2@gmail.com

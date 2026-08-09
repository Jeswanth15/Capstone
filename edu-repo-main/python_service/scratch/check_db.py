import mysql.connector
import json

def check_student(student_id):
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="edu_ml"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"SELECT * FROM users WHERE user_id = {student_id}")
        user = cursor.fetchone()
        
        if user:
            print(f"User found: {json.dumps(user)}")
        else:
            print("User not found")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_student(7)

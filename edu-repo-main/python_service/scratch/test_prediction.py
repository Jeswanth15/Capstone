import os
import sys

# Add the parent directory (python_service) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_prediction import predict_performance

def test():
    try:
        print("Testing prediction for student 7...")
        result = predict_performance(7)
        print("RESULT SUCCESS")
        print(result)
    except Exception as e:
        print(f"FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()

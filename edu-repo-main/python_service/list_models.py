import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

key = os.getenv("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=key)
    print("Checking available models...")
    for model in client.models.list():
        print(f"Model ID: {model.name}, Display Name: {model.display_name}")
except Exception as e:
    print(f"Failed to list models: {e}")

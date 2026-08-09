import os
from dotenv import load_dotenv
from google import genai
import sys

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
print(f"Key: {key[:5]}...{key[-5:] if key else 'None'}")
print(f"Key Length: {len(key) if key else 0}")

try:
    client = genai.Client(api_key=key)
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Say hello'
    )
    print("Success with google-genai!")
    print(response.text)
except Exception as e:
    print(f"Failed with google-genai: {e}")

try:
    import google.generativeai as old_genai
    old_genai.configure(api_key=key)
    model = old_genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content('Say hello')
    print("Success with google-generativeai!")
    print(response.text)
except Exception as e:
    print(f"Failed with google-generativeai: {e}")

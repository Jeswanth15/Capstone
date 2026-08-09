import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

key = os.getenv("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=key)
    print("Testing gemini-2.0-flash...")
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Explain why gemini is awesome in one sentence.'
    )
    print("Success!")
    print(response.text)
except Exception as e:
    print(f"Failed: {e}")

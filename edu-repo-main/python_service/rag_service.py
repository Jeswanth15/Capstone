import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from pypdf import PdfReader
from pptx import Presentation
import uvicorn
import typing
from typing import List, Optional
import urllib.parse
import json
from ml_prediction import predict_performance, engine

app = FastAPI()

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BASE_DIR)
EDU_DIR = os.path.join(REPO_ROOT, "edu")
UPLOADS_DIR = os.path.join(EDU_DIR, "uploads", "syllabus")

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY or API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

def get_model():
    # Use 'gemini-flash-latest' which maps to 1.5-flash and usually has better free tier quota
    # We saw 2.0-flash giving 429 'limit: 0' errors
    print("Initializing Gemini model (using gemini-flash-latest)...")
    try:
        name = 'models/gemini-flash-latest'
        m = genai.GenerativeModel(name)
        return m, name
    except Exception as e:
        print(f"Error initializing model: {str(e)}")
        # Fallback to 2.5-flash as another option from the list
        return genai.GenerativeModel('models/gemini-2.5-flash'), 'models/gemini-2.5-flash'

model, active_model_name = get_model()
print(f"ACTIVE MODEL: {active_model_name}")

# ChromaDB Setup - Disable telemetry to avoid PostHog connection errors
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
client = chromadb.PersistentClient(
    path=CHROMA_PATH,
    settings=Settings(anonymized_telemetry=False)
)
collection = client.get_or_create_collection(name="module_materials")

class QuestionRequest(BaseModel):
    moduleName: str
    classSubjectId: str
    difficulty: str = "MEDIUM"
    teamSessionId: Optional[str] = None
    seed: Optional[str] = None

class StudyPlanRequest(BaseModel):
    userId: int
    classSubjectId: int
    moduleName: Optional[str] = None
    days: int = 7
    stats: str

def extract_text(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext == ".pdf":
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif ext in [".ppt", ".pptx"]:
        prs = Presentation(file_path)
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text += shape.text + "\n"
    return text

@app.post("/ingest")
async def ingest_file(file_path: str, moduleName: str, classSubjectId: str):
    print(f"Ingest request: path={file_path}, module={moduleName}, id={classSubjectId}")
    
    # Decode URL-encoded paths (e.g., %20 -> space)
    file_path = urllib.parse.unquote(file_path)
    
    # Extract filename if it's a web path
    filename = os.path.basename(file_path)
    
    # Target path in repo structure
    final_path = os.path.join(UPLOADS_DIR, filename)
    
    print(f"Resolved path: {final_path}")
    
    if not os.path.exists(final_path):
        print(f"ERROR: File not found at {final_path}")
        raise HTTPException(status_code=404, detail=f"File not found: {final_path}")

    try:
        text = extract_text(final_path)
        if not text.strip():
            print("WARNING: Extracted text is empty")
            return {"status": "ignored", "reason": "empty text"}
        
        # Store in Chroma
        collection.add(
            documents=[text],
            metadatas=[{"moduleName": moduleName, "classSubjectId": classSubjectId}],
            ids=[f"{classSubjectId}_{moduleName}_{filename}"]
        )
        print("Success: Document indexed")
        return {"status": "success"}
    except Exception as e:
        print(f"ERROR during ingestion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-study-plan")
async def generate_study_plan(request: StudyPlanRequest):
    print(f"Generating study plan for user {request.userId}, subject {request.classSubjectId}")
    
    module_info = f"Module: {request.moduleName}" if request.moduleName and request.moduleName != "General" else "Overall Subject"
    
    prompt = f"""
    Student Performance Data for {module_info}:
    {request.stats}
    
    Please generate a very brief, encouraging, and personalized AI Study Plan for the next {request.days} days. 
    Highlight their weak modules if they scored below 50% and encourage re-reading the module materials. 
    Highlight strong areas and provide actionable next steps.
    
    IMPORTANT: Keep it to 2-3 sentences.
    """
    
    try:
        print(f"Using model: {active_model_name} for study plan")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"ERROR during study plan generation: {str(e)}")
        # Try fallback if not already using it
        try:
            fallback_model = genai.GenerativeModel('models/gemini-2.0-flash')
            resp = fallback_model.generate_content(prompt)
            return resp.text.strip()
        except Exception as fe:
            print(f"Fallback also failed: {str(fe)}")
            raise HTTPException(status_code=500, detail=f"AI Generation Error: {str(e)}")

@app.post("/generate-questions")
async def generate_questions(request: QuestionRequest):
    # Query ChromaDB for relevant context
    results = collection.query(
        query_texts=[f"Generate questions for {request.moduleName}"],
        where={"$and": [{"moduleName": request.moduleName}, {"classSubjectId": request.classSubjectId}]},
        n_results=3
    )
    
    context = "\n".join(results['documents'][0]) if results['documents'] else ""
    
    # Look up the subject name for classSubjectId
    subject_name = "General"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            query = text("""
                SELECT s.name 
                FROM class_subjects cs 
                JOIN subjects s ON cs.subject_id = s.subject_id 
                WHERE cs.id = :class_subject_id
            """)
            res = conn.execute(query, {"class_subject_id": int(request.classSubjectId)})
            row = res.fetchone()
            if row:
                subject_name = row[0]
    except Exception as dbe:
        print(f"Error querying subject name in python service: {dbe}")

    session_seed_info = ""
    if request.teamSessionId:
        session_seed_info = f"\nTeam Session ID: {request.teamSessionId}"
    if request.seed:
        session_seed_info += f"\nGeneration Seed: {request.seed}"

    if not context:
        print(f"No ChromaDB context found for {request.moduleName}. Falling back to general generation for {subject_name}...")
        prompt = f"""
        Generate EXACTLY 10 multiple-choice questions (MCQs) for the subject '{subject_name}' on the module/topic '{request.moduleName}'.
        Difficulty: {request.difficulty}{session_seed_info}
        
        Output the response in STRICT JSON format (Array of EXACTLY 10 items):
        [
          {{
            "questionText": "...",
            "options": ["A", "B", "C", "D"],
            "correctOption": "...",
            "explanation": "...",
            "type": "MCQ",
            "difficulty": "{request.difficulty}"
          }}
        ]
        """
    else:
        prompt = f"""
        Context: {context}
        
        Generate EXACTLY 10 multiple-choice questions (MCQs) based ONLY on the context above.
        Difficulty: {request.difficulty}{session_seed_info}
        
        Output the response in STRICT JSON format (Array of EXACTLY 10 items):
        [
          {{
            "questionText": "...",
            "options": ["A", "B", "C", "D"],
            "correctOption": "...",
            "explanation": "...",
            "type": "MCQ",
            "difficulty": "{request.difficulty}"
          }}
        ]
        """

    full_prompt = prompt + "\n\nIMPORTANT: Output ONLY the JSON array containing EXACTLY 10 questions. Do not include markdown formatting like ```json."
    
    # Retry loop to guarantee exactly 10 questions
    for attempt in range(1, 4):
        try:
            print(f"Generating questions (Attempt {attempt}) using model: {active_model_name}")
            response = model.generate_content(
                full_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            text_resp = response.text.strip()
            
            if "```" in text_resp:
                if "```json" in text_resp:
                    text_resp = text_resp.split("```json")[1].split("```")[0].strip()
                else:
                    text_resp = text_resp.split("```")[1].split("```")[0].strip()
            
            parsed_json = json.loads(text_resp)
            if isinstance(parsed_json, list) and len(parsed_json) == 10:
                print(f"Success: Generated EXACTLY 10 questions for {request.moduleName} on attempt {attempt}")
                return parsed_json
            else:
                count = len(parsed_json) if isinstance(parsed_json, list) else 0
                print(f"Attempt {attempt}: AI returned {count} questions instead of 10. Retrying...")
        except Exception as e:
            print(f"Attempt {attempt} failed: {str(e)}")

    # Fallback to secondary model if primary model attempts failed
    try:
        fallback_name = 'models/gemini-flash-latest' if active_model_name != 'models/gemini-flash-latest' else 'models/gemini-pro-latest'
        print(f"Attempting fallback to {fallback_name}...")
        fallback_model = genai.GenerativeModel(fallback_name)
        resp = fallback_model.generate_content(
            full_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        text_fallback = resp.text.strip()
        if "```" in text_fallback:
            if "```json" in text_fallback:
                text_fallback = text_fallback.split("```json")[1].split("```")[0].strip()
            else:
                text_fallback = text_fallback.split("```")[1].split("```")[0].strip()
        parsed_fallback = json.loads(text_fallback)
        if isinstance(parsed_fallback, list) and len(parsed_fallback) == 10:
            return parsed_fallback
        elif isinstance(parsed_fallback, list) and len(parsed_fallback) > 0:
            # Trim or pad if needed as extreme fallback
            if len(parsed_fallback) > 10:
                return parsed_fallback[:10]
            return parsed_fallback
    except Exception as fe:
        print(f"Fallback also failed: {str(fe)}")
    
    raise HTTPException(status_code=500, detail="AI failed to generate exactly 10 questions.")

@app.get("/predict-performance/{student_id}")
async def get_performance(student_id: int):
    print(f"Prediction request for student {student_id}")
    try:
        return predict_performance(student_id)
    except Exception as e:
        import traceback
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"!!! ERROR during prediction for student {student_id}: {error_msg}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail={
            "error": "Prediction Logic Error",
            "message": str(e),
            "type": type(e).__name__
        })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
import uvicorn
import subprocess
import os
import re
from datetime import datetime, timedelta

# ================================
# Configure Gemini API
# ================================
genai.configure(api_key="AIzaSyBk0Q8pFNbAgl3KkZybrhqtD8M2ZmuF8e8")
model = genai.GenerativeModel("gemini-2.5-pro")

# ================================
# FastAPI App
# ================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage for /chat
conversation_history = {}

# ================================
# Helper function to clean Gemini reply
# ================================
def clean_reply(text: str) -> str:
    """Remove markdown symbols from Gemini reply."""
    if not text:
        return ""
    text = re.sub(r'[*_`~>#-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ================================
# Routes
# ================================
@app.get("/")
def root():
    return {"status": "ok", "message": "Chatbot backend running with Gemini (Green Lifestyle & Finance Tracker)!"}


@app.post("/chat")
async def chat(request: Request):
    try:
        body = await request.json()
        session_id = body.get("session_id", "default")
        user_message = body.get("message", "").strip()

        if not user_message:
            return JSONResponse({"error": "Message field is required"}, status_code=400)

        if session_id not in conversation_history:
            conversation_history[session_id] = []

        conversation_history[session_id].append({"role": "user", "content": user_message})

        context_messages = ""
        for msg in conversation_history[session_id][-6:]:
            prefix = "User:" if msg["role"] == "user" else "Assistant:"
            context_messages += f"{prefix} {msg['content']}\n"

        full_prompt = f"""
You are a sustainability and finance assistant for a Green Lifestyle & Finance Tracker application.

Your role is to help users plan their daily tasks, travel, purchases, and lifestyle choices by balancing carbon emissions and financial costs.

- Always calculate or estimate the carbon footprint and money impact of the user’s actions.
- Provide answers in a short, point-by-point format (numbered 1), 2), 3)...).
- Keep each point concise and clear.
- Do not include extra text, greetings, or markdown.
- If the query is not related to sustainability, carbon, or finance, gently guide the user back to these topics.

{context_messages}Assistant:
"""

        response = model.generate_content(full_prompt)
        reply = clean_reply(response.text)

        conversation_history[session_id].append({"role": "assistant", "content": reply})

        return {"user": user_message, "reply": reply}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/upload-statement")
async def upload_statement(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        result = subprocess.run(
            ["python", "statementocr.py"],
            input=file_bytes,
            capture_output=True,
            text=False
        )

        if result.returncode != 0:
            return JSONResponse(
                {"error": "Failed to process file", "details": result.stderr.decode("utf-8", errors="ignore")},
                status_code=500
            )

        return {
            "filename": file.filename,
            "output": result.stdout.decode("utf-8", errors="ignore").strip()
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/chat-statement")
async def chat_statement(request: Request):
    try:
        data = await request.json()
        question = data.get("question", "").strip()
        if not question:
            return JSONResponse({"error": "Question field is required"}, status_code=400)

        txt_path = "extracted_text.txt"
        if not os.path.exists(txt_path):
            return JSONResponse({"error": f"{txt_path} not found. Upload a statement first."}, status_code=400)

        with open(txt_path, "r", encoding="utf-8") as f:
            statement_text = f.read().strip()

        if not statement_text:
            return JSONResponse({"error": f"{txt_path} is empty"}, status_code=400)

        chat_session = model.start_chat(history=[])

        system_prompt = f"""
You are analyzing a user’s bank statement for a Green Lifestyle & Finance Tracker.

Here is the statement text:
{statement_text}

- Answer questions with concise, accurate points.
- Always format answers as numbered points (1), 2), 3)...).
- Highlight both spending patterns and estimated carbon impact.
- Provide short, actionable eco-friendly and cost-saving suggestions.
- If information is missing, say you cannot find it.
"""
        chat_session.send_message(system_prompt)
        response = chat_session.send_message(question)
        answer = clean_reply(response.text)

        return {"question": question, "answer": answer}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ================================
# Weekly summariser
# ================================
@app.post("/week-summariser")
async def week_summariser():
    txt_path = "extracted_text.txt"
    if not os.path.exists(txt_path):
        return JSONResponse({"error": f"{txt_path} not found. Upload a statement first."}, status_code=400)

    with open(txt_path, "r", encoding="utf-8") as f:
        statement_text = f.read().strip()

    if not statement_text:
        return JSONResponse({"error": f"{txt_path} is empty"}, status_code=400)

    prompt = f"""
You are a sustainability and finance assistant. The following is the user’s bank statement text:
{statement_text}

- Analyze expenses only for the current week.
- Highlight both money and possible carbon impact.
- Give concise output: exactly 3 short insights.
- Each insight must be structured and numbered like:
  1) ...
  2) ...
  3) ...
"""
    response = model.generate_content(prompt)
    return {"week_summary": clean_reply(response.text)}


# ================================
# Monthly summariser
# ================================
@app.post("/month-summariser")
async def month_summariser():
    txt_path = "extracted_text.txt"
    if not os.path.exists(txt_path):
        return JSONResponse({"error": f"{txt_path} not found. Upload a statement first."}, status_code=400)

    with open(txt_path, "r", encoding="utf-8") as f:
        statement_text = f.read().strip()

    if not statement_text:
        return JSONResponse({"error": f"{txt_path} is empty"}, status_code=400)

    prompt = f"""
You are a sustainability and finance assistant. The following is the user’s bank statement text:
{statement_text}

- Analyze expenses only for the current month.
- Highlight both money and possible carbon impact.
- Give concise output: exactly 3 short insights.
- Each insight must be structured and numbered like:
  1) ...
  2) ...
  3) ...
"""
    response = model.generate_content(prompt)
    return {"month_summary": clean_reply(response.text)}


# ================================
# Run server
# ================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
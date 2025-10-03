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
    return {"status": "ok", "message": "Chatbot backend running with Gemini (Financial Agent & Statement QA)!"}


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
You are a highly skilled financial assistant for a Finance Tracker application.
- Help users understand their income, expenses, savings, and investments.
- Provide short, concise, actionable advice.
- Maintain context of previous messages in the conversation.
- Always respond politely and clearly.
- If the query is not finance-related, gently redirect the user back to finance topics.
Respond in plain text, no greetings, no Markdown symbols, and keep answers brief.

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
You are analyzing a bank statement. Here is the statement text:

{statement_text}

- Answer user questions about transactions, amounts, balances, dates, 
  merchants, and categories.
- If the information is not explicitly in the statement, say you cannot find it.
- Be concise and accurate.
"""
        chat_session.send_message(system_prompt)
        response = chat_session.send_message(question)
        answer = clean_reply(response.text)

        return {"question": question, "answer": answer}

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)



# ================================
# New route: month-summariser
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

    # Updated Gemini prompt for weekly summary
    prompt = f"""
You are a finance assistant. The following is the bank statement text:
{statement_text}

- Analyze the statement only for the current week.
-give consise and short reply
- Return exactly 3 short insights (no more, no less).
- Each insight must be structured and numbered like:
  1) ...
  2) ...
  3) ...
- Do not include extra text, headers, or markdown.
"""
    response = model.generate_content(prompt)
    return {"week_summary": clean_reply(response.text)}


@app.post("/month-summariser")
async def month_summariser():
    txt_path = "extracted_text.txt"
    if not os.path.exists(txt_path):
        return JSONResponse({"error": f"{txt_path} not found. Upload a statement first."}, status_code=400)

    with open(txt_path, "r", encoding="utf-8") as f:
        statement_text = f.read().strip()

    if not statement_text:
        return JSONResponse({"error": f"{txt_path} is empty"}, status_code=400)

    # Updated Gemini prompt for monthly summary
    prompt = f"""
You are a finance assistant. The following is the bank statement text:
{statement_text}

- Analyze the statement only for the current month.
-give consise and short reply
- Return exactly 3 short insights (no more, no less).
- Each insight must be structured and numbered like:
  1) ...
  2) ...
  3) ...
- Do not include extra text, headers, or markdown.
"""
    response = model.generate_content(prompt)
    return {"month_summary": clean_reply(response.text)}



# ================================
# Run server
# ================================
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

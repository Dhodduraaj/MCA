@echo off
echo ===============================
echo 🚀 Starting Full Project Setup
echo ===============================

:: Start Frontend
echo Starting Frontend (Vite React)...
start cmd /k "cd client && npm run dev"

:: Start Backend (Node.js inside server/node)
echo Starting Backend (Node)...
start cmd /k "cd server\node && node index.js"

:: Start Python Service (inside server/python)
echo Starting Python Script...
start cmd /k "cd server\python && python main.py"

echo ===============================
echo ✅ All services launched!
echo ===============================
pause

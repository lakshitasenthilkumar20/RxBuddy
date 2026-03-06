@echo off
echo Starting RxBuddy Backend and Frontend...

:: Start Backend
start "RxBuddy Backend" cmd /k "cd Backend && if exist venv\Scripts\activate (venv\Scripts\activate && uvicorn app.main:app --reload) else (echo venv not found, trying global python... && python -m uvicorn app.main:app --reload)"

:: Start Frontend
start "RxBuddy Frontend" cmd /k "cd complete\complete && npm install && npm run dev"

echo Done. Check the new windows.

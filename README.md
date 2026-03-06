# RxBuddy Project

This project contains the backend and frontend for RxBuddy.

## Project Structure
- `Backend`: FastAPI Python application.
- `RxBuddy frontend`: React + Vite application.

## Getting Started

### Prerequisites
- Node.js
- Python

### 1. Setup Backend
Open a terminal and:
```bash
cd Backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload
```
The backend server runs at `http://localhost:8000`.
Docs available at `http://localhost:8000/docs`.

### 2. Setup Frontend
Open a new terminal and:
```bash
cd "RxBuddy frontend"
# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend runs at `http://localhost:5173`.

## Integration Details
- **CORS**: Enabled on Backend to allow `http://localhost:5173`.
- **Proxy**: Configured in `vite.config.ts` to forward API requests (e.g. `/auth`, `/users`, `/prescriptions`) to `http://localhost:8000`.

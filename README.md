<h1 align="center">💊 RxBuddy</h1>

<p align="center">
  <strong>Smart Prescription Digitaliser — Bridging Handwritten Prescriptions and Patient Safety</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/TrOCR-5C3EE8?style=for-the-badge&logo=huggingface&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

---

## 🚨 The Problem

Every day, millions of handwritten prescriptions travel between doctors, pharmacists, and patients — and every step is a potential point of failure.

| Problem | Real-World Impact |
|---|---|
| **Illegible handwriting** | Pharmacists misread drug names, dosages, or frequencies |
| **Allergy blind spots** | No automatic cross-check between prescribed drugs and known patient allergies |
| **Drug–drug interactions** | Multiple medications prescribed without interaction analysis |
| **Fragmented records** | Patient history, allergies, and prescriptions stored in disconnected silos |

> According to the WHO, medication errors affect 1 in 30 patients globally — and a significant portion stem from prescription misinterpretation.

**RxBuddy is built to solve all four problems in one unified platform.**

---

## ✅ The Solution

RxBuddy is a healthcare platform that converts handwritten prescriptions into structured digital data, performs real-time safety checks, and stores everything in a unified patient record system.

```
Handwritten Prescription
        ↓
   📷 Image Upload
        ↓
   🤖 TrOCR Engine  →  Extracts drug names, dosages, instructions
        ↓
   🔍 Safety Layer  →  Allergy check + Drug–drug interaction analysis
        ↓
   🗄️ MongoDB       →  Structured patient record stored securely
        ↓
   💻 React Dashboard  →  Clean, actionable output for pharmacists & doctors
```

---

## ✨ Key Features

- 📄 **Prescription Digitisation** — Upload a photo of any handwritten prescription; TrOCR extracts medication names, dosage, and frequency into structured data
- 🚨 **Allergy Detection** — Automatically flags if a prescribed medication conflicts with the patient's known allergies
- ⚠️ **Drug–Drug Interaction Analysis** — Detects dangerous combinations across multiple prescribed medications
- 🗂️ **Unified Patient Records** — All prescriptions, allergy history, and safety flags stored in one place via MongoDB
- 📊 **Clean Dashboard** — Intuitive React-based UI designed for speed and clarity in clinical environments

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **OCR Engine** | TrOCR (Microsoft) | Transformer-based handwriting recognition |
| **Backend** | FastAPI + Python | REST API, business logic, safety checks |
| **Database** | MongoDB | Flexible document store for patient records |
| **Frontend** | React + TypeScript + Tailwind CSS | Responsive, type-safe clinical UI |

---

## 👩‍💻 My Contributions

> Built during my internship at **Helyxon Healthcare Solutions** (Sep 2025 – Mar 2026)

- 🎨 **Frontend Development** — Built the complete React + TypeScript UI, including prescription upload flow, patient dashboard, and safety alert components using Tailwind CSS
- 🔗 **Frontend–Backend Integration** — Connected all React components to FastAPI endpoints, handling OCR response parsing, error states, and loading flows
- 📋 **Prescription Results View** — Designed the structured output display that converts raw OCR + NLP results into readable, clinician-friendly prescription cards
- 🚨 **Safety Alert UI** — Built the allergy and drug interaction warning components with appropriate visual urgency

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB instance (local or Atlas)

### 1. Backend Setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs available at `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd "RxBuddy frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔭 Future Scope

- 📱 Mobile app for point-of-care prescription scanning
- 🌐 Multi-language prescription support
- 🔔 Real-time pharmacist notification system
- 📈 Analytics dashboard for prescription trends and safety metrics

---

## 👥 Team

Built with ❤️ at **Helyxon Healthcare Solutions**

| Name | Role |
|---|---|
| Lakshita S | Frontend Development & Integration |
| [Samyuktha](https://github.com/Samyuktha13-06) | Backend Development & Integration |
| [Madhura Bashini](https://github.com/madhurabashinims) | OCR Model Finetuning |

---

## 📄 License

This project was developed as part of an internship at Helyxon Healthcare Solutions. For licensing enquiries, please contact the repository owner.

---

<p align="center">
  Made with 💊 to make prescriptions safer, one scan at a time.
</p>

## Integration Details
- **CORS**: Enabled on Backend to allow `http://localhost:5173`.
- **Proxy**: Configured in `vite.config.ts` to forward API requests (e.g. `/auth`, `/users`, `/prescriptions`) to `http://localhost:8000`.

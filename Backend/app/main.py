# app/main.py
from fastapi import FastAPI
from app.db import get_db
from app.routers import auth, users
from app.routers import prescriptions
from app.routers import medications, safety, interactions
from app.services.interactions import interaction_service
import os



app = FastAPI(title="Smart Prescription Digitalizer Backend")

from app.utils.security import hash_password
@app.on_event("startup")
async def startup_event():
    print(">>> STARTUP TEST: Testing hash_password...")
    try:
        h = hash_password("A" * 100)
        print(f">>> STARTUP TEST: Success! Hash length: {len(h)}")
    except Exception as e:
        print(f">>> STARTUP TEST: FAILED! {e}")

    # Load drug interactions database
    try:
        # Construct path relative to this file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(base_dir, 'data', 'db_drug_interactions.csv')
        print(f"Initializing drug interactions service with data from: {data_path}")
        interaction_service.load_data(data_path)
    except Exception as e:
        print(f"Failed to load interactions: {e}")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running successfully"}

@app.get("/health")
def health_check():
    return {"status": "Backend is running"}

@app.get("/db-check")
def db_check():
    try:
        db = get_db()
        return {"message": "Database connected"}
    except:
        return {"message": "Database connection failed"}


from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)

app.include_router(users.router)
app.include_router(prescriptions.router)
app.include_router(medications.router)
app.include_router(safety.router)
from app.routers import reports, intake

app.include_router(reports.router)
app.include_router(interactions.router)
app.include_router(intake.router)


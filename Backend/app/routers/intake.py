from datetime import date
from fastapi import APIRouter, Depends
from app.db import get_db
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/intake", tags=["Medication Intake"])

@router.post("/record")
def record_intake(medication_id: str, status: str, current_user=Depends(get_current_user)):
    db = get_db()

    record = {
        "medication_id": medication_id,
        "user_id": current_user["_id"],
        "date": date.today(),
        "status": status  # TAKEN / MISSED
    }

    db.intake_records.insert_one(record)

    return {"message": "Intake recorded"}

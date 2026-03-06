from fastapi import APIRouter, Depends
from app.db import get_db
from app.utils.dependencies import get_current_user
from app.services.analytics_service import (
    calculate_adherence,
    summarize_safety_alerts
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports & Analytics"]
)

@router.get("/user")
def get_user_report(current_user=Depends(get_current_user)):
    db = get_db()

    intake_records = list(db.intake_records.find(
        {"user_id": current_user["_id"]}
    ))

    alerts = list(db.safety_alerts.find(
        {"user_id": current_user["_id"]}
    ))

    adherence = calculate_adherence(intake_records)
    safety_summary = summarize_safety_alerts(alerts)

    return {
        "adherence_percentage": adherence,
        "total_doses": len(intake_records),
        "safety_alerts": safety_summary
    }

@router.get("/admin")
def get_system_report(current_user=Depends(get_current_user)):
    db = get_db()

    if current_user["role"] != "admin":
        return {"error": "Access denied"}

    return {
        "total_users": db.users.count_documents({}),
        "total_prescriptions": db.prescriptions.count_documents({}),
        "total_medications": db.medications.count_documents({}),
        "total_safety_alerts": db.safety_alerts.count_documents({})
    }

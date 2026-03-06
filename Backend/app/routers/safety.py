from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from typing import List, Dict

from app.db import get_db
from app.utils.dependencies import get_current_user
from app.services.safety_services import check_interactions, check_allergies

router = APIRouter(
    prefix="/safety",
    tags=["Safety"]
)

@router.post("/check/{prescription_id}")
def run_safety_checks(
    prescription_id: str,
    current_user=Depends(get_current_user)
):
    db = get_db()

    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        prescription_obj_id = ObjectId(prescription_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")

    prescription = db.prescriptions.find_one({
        "_id": prescription_obj_id,
        "user_id": user_id
    })

    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    medicines = prescription.get("medicines", [])
    user_allergies = current_user.get("allergies", [])

    if not medicines:
        raise HTTPException(status_code=400, detail="No medicines found for safety check")

    # Run checks
    interaction_alerts = check_interactions(medicines)
    allergy_alerts = check_allergies(medicines, user_allergies)
    
    alerts = interaction_alerts + allergy_alerts

    # Always clean up existing alerts for this prescription before saving new ones
    db.safety_alerts.delete_many({"prescription_id": prescription_obj_id})

    if alerts:
        for alert in alerts:
            alert["user_id"] = user_id
            alert["prescription_id"] = prescription_obj_id

        db.safety_alerts.insert_many(alerts)
        
        for alert in alerts:
            if "_id" in alert:
                alert["_id"] = str(alert["_id"])
            alert["user_id"] = str(alert["user_id"])
            alert["prescription_id"] = str(alert["prescription_id"])

    return {
        "message": "Safety check completed successfully",
        "alert_count": len(alerts),
        "alerts": alerts
    }


@router.post("/evaluate")
def evaluate_medications(medicines: List[Dict], current_user=Depends(get_current_user)):
    """Run safety rules on an arbitrary list of medicines."""
    user_allergies = current_user.get("allergies", [])
    
    interaction_alerts = check_interactions(medicines)
    allergy_alerts = check_allergies(medicines, user_allergies)
    
    return {"alerts": interaction_alerts + allergy_alerts}

@router.get("/my-allergy-risks")
def get_my_allergy_risks(current_user=Depends(get_current_user)):
    """Returns a list of all active allergy alerts for the current user's prescriptions."""
    db = get_db()
    alerts = list(db.safety_alerts.find({
        "user_id": current_user["_id"],
        "alert_type": "ALLERGY"
    }))
    
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
        alert["user_id"] = str(alert["user_id"])
        alert["prescription_id"] = str(alert["prescription_id"])
        
    return alerts

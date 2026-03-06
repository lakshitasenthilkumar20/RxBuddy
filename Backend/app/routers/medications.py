from fastapi import APIRouter, Depends
from app.db import get_db
from app.utils.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/medications", tags=["Medications"])

@router.post("/create-from-prescription/{prescription_id}")
def create_medications(prescription_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    prescription = db.prescriptions.find_one({
        "_id": ObjectId(prescription_id),
        "user_id": current_user["_id"]
    })

    medicines = prescription["medicines"]

    created = []
    for med in medicines:
        medication = {
            "prescription_id": str(prescription_id), # Ensure string
            "user_id": current_user["_id"],
            "name": med.get("name"),
            "dosage": med.get("dosage"),
            "frequency": med.get("frequency"),
            "duration_days": 5   # default / assumed
        }
        db.medications.insert_one(medication)
        # Convert for response
        medication["_id"] = str(medication["_id"])
        medication["user_id"] = str(medication["user_id"])
        created.append(medication)

    return {
        "message": "Medication schedule created",
        "count": len(created),
        "medications": created
    }

@router.get("/my")
def get_my_medications(current_user=Depends(get_current_user)):
    db = get_db()
    meds = list(db.medications.find({"user_id": current_user["_id"]}))
    for m in meds:
        m["_id"] = str(m["_id"])
        m["user_id"] = str(m["user_id"])
        if "prescription_id" in m:
            m["prescription_id"] = str(m["prescription_id"])
    return meds


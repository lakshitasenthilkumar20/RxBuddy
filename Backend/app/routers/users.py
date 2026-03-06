from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.utils.dependencies import get_current_user
from app.db import get_db
from app.utils.security import verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Users"])

class AllergyItem(BaseModel):
    id: str
    name: str
    severity: str
    reactionType: str
    notes: str = ""
    dateAdded: str

class AllergiesUpdate(BaseModel):
    allergies: List[AllergyItem]

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user.get("full_name", "User"),
        "email": current_user.get("email", ""),
        "role": current_user.get("role", "patient"),
        "allergies": current_user.get("allergies", [])
    }

@router.put("/allergies")
def update_allergies(data: AllergiesUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    # Convert Pydantic models to dicts for storage
    allergies_data = [a.dict() for a in data.allergies]
    db.users.update_one({"_id": current_user["_id"]}, {"$set": {"allergies": allergies_data}})
    
    # NEW: Recalculate safety risks for all this user's prescriptions
    from app.services.safety_services import recalculate_user_safety
    recalculate_user_safety(current_user["_id"], allergies_data)
    
    return {"message": "Allergies updated", "allergies": allergies_data}


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.put("/change-password")
def change_password(data: PasswordUpdate, current_user=Depends(get_current_user)):
    # 1. Verify old password
    if not verify_password(data.current_password, current_user.get("password", "")):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # 2. Update to new hashed password
    db = get_db()
    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(data.new_password)}}
    )
    
    return {"message": "Password changed successfully"}

@router.delete("/me")
def delete_account(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    # Cascade deletion of user-related data
    db.prescriptions.delete_many({"user_id": user_id})
    db.medications.delete_many({"user_id": user_id})
    db.intake.delete_many({"user_id": user_id})
    
    # Finally delete the user account
    result = db.users.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Account and all associated data deleted successfully"}

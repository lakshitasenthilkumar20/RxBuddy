from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from datetime import datetime, timezone
from app.db import get_db
from app.services.storage_service import save_file
from app.utils.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)

@router.post("/upload")
def upload_prescription(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(
            status_code=400,
            detail="Only image or PDF files are allowed"
        )

    file_path = save_file(file)

    db = get_db()
    prescription = {
        "user_email": current_user["email"],
        "user_id": current_user.get("_id"),
        "file_path": file_path,
        "uploaded_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc),
        "status": "Active"
    }

    db.prescriptions.insert_one(prescription)

    return {
        "message": "Prescription uploaded successfully",
        "file_path": file_path,
        "id": str(prescription["_id"])
    }

@router.post("/manual")
def add_manual_prescription(data: dict, current_user=Depends(get_current_user)):
    db = get_db()
    prescription = {
        "user_email": current_user["email"],
        "user_id": current_user.get("_id"),
        "name": data.get("name"),
        "date": data.get("date"),
        "doctor": data.get("doctor"),
        "medicines": data.get("medicines", []),
        "notes": data.get("notes"),
        "uploaded_at": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc),
        "status": "Active",
        "ocr_text": f"Manual Entry: {data.get('notes', '')}"
    }
    db.prescriptions.insert_one(prescription)
    
    # NEW: Recalculate safety risks
    from app.services.safety_services import recalculate_user_safety
    recalculate_user_safety(current_user["_id"], current_user.get("allergies", []))
    
    return {"message": "Manual prescription saved", "id": str(prescription["_id"])}



@router.get("/my")
def get_my_prescriptions(current_user=Depends(get_current_user)):
    db = get_db()
    # return prescriptions belonging to the requesting user
    prescriptions = list(
        db.prescriptions.find(
            {"user_id": current_user.get("_id")}
        )
    )
    # Convert ObjectIds to strings for JSON serialization
    for p in prescriptions:
        p["_id"] = str(p["_id"])
        if "user_id" in p:
            p["user_id"] = str(p["user_id"])
        
    return prescriptions




from app.services.ocr_service import process_prescription_ocr
from fastapi import HTTPException

@router.post("/{prescription_id}/process-ocr")
def process_ocr(prescription_id: str, current_user=Depends(get_current_user)):
    db = get_db()

    prescription = db.prescriptions.find_one({
        "_id": ObjectId(prescription_id),
        "user_id": current_user["_id"]
    })

    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Run real OCR
    ocr_text, medicines = process_prescription_ocr(prescription["file_path"])


    # Update prescription with OCR results
    db.prescriptions.update_one(
        {"_id": ObjectId(prescription_id)},
        {
            "$set": {
                "ocr_text": ocr_text,
                "medicines": medicines,
                "status": "Active"
            }
        }
    )

    # NEW: Recalculate safety risks
    from app.services.safety_services import recalculate_user_safety
    recalculate_user_safety(current_user["_id"], current_user.get("allergies", []))

    return {
        "message": "OCR processing completed",
        "medicines": medicines
    }


from app.services.ocr_service import extract_medicines_from_text

@router.put("/{prescription_id}")
def update_prescription(prescription_id: str, updates: dict, current_user=Depends(get_current_user)):
    db = get_db()
    
    set_data = {}
    
    # Check if OCR text is being updated
    ocr_text = updates.get("ocrText") or updates.get("ocr_text")
    provided_medicines = updates.get("medicines", [])
    
    if ocr_text:
        set_data["ocr_text"] = ocr_text
        
        # Extract medicines from the updated text
        extracted_from_text = extract_medicines_from_text(ocr_text)
        
        # Combine provided medicines (from UI tags) with extracted ones (from text)
        # Use a set to avoid duplicates based on medicine name
        final_medicines = {m["name"].upper(): m for m in extracted_from_text}
        
        # Add those provided from UI (they might have more details or be manually added)
        for m in provided_medicines:
            name = m.get("name", "").upper()
            if name:
                # If it's already there, keep the one from UI as it might have manual edits
                if name not in final_medicines:
                    final_medicines[name] = m
                    
        set_data["medicines"] = list(final_medicines.values())

    elif "medicines" in updates:
        set_data["medicines"] = provided_medicines
        
    if "status" in updates:
        # Standardize status format (e.g., "Active", "Inactive")
        status = updates["status"]
        if isinstance(status, str):
            status = status.capitalize()
        set_data["status"] = status
        
    if not set_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = db.prescriptions.update_one(
        {"_id": ObjectId(prescription_id), "user_id": current_user["_id"]},
        {"$set": set_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    # NEW: Recalculate safety risks
    from app.services.safety_services import recalculate_user_safety
    recalculate_user_safety(current_user["_id"], current_user.get("allergies", []))
        
    return {
        "message": "Prescription updated successfully",
        "medicines": set_data.get("medicines", provided_medicines)
    }


@router.delete("/{prescription_id}")
def delete_prescription(prescription_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    
    result = db.prescriptions.delete_one({
        "_id": ObjectId(prescription_id),
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    return {"message": "Prescription deleted successfully"}

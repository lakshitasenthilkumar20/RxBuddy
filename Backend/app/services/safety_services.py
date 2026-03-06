from app.services.interactions import interaction_service
from app.services.medication_data import check_medicine_allergy
from app.db import get_db

def check_allergies(medications, user_allergies):
    """
    Checks each medication against the user's allergy list.
    Uses a local synthetic dataset for ingredient lookup.
    """
    alerts = []
    if not user_allergies:
        return []
        
    for med in medications:
        med_name = med.get("name", "")
        if not med_name:
            continue
            
        alert = check_medicine_allergy(med_name, user_allergies)
        if alert:
            alerts.append(alert)
            
    return alerts

def check_interactions(medications):
    alerts = []
    med_names = [m.get("name", "") for m in medications if m.get("name")]
    if len(med_names) < 2:
        return []
    found_interactions = interaction_service.check_interactions(med_names)
    for interaction in found_interactions:
        alerts.append({
            "drug1": interaction['drug1'],
            "drug2": interaction['drug2'],
            "medication": f"{interaction['drug1']} + {interaction['drug2']}",
            "alert_type": "INTERACTION",
            "severity": "HIGH", 
            "description": interaction['description']
        })
    return alerts

def recalculate_user_safety(user_id, user_allergies):
    """
    Re-scans all prescriptions for a user and updates the safety_alerts collection.
    Useful when the user's allergy list changes.
    """
    db = get_db()
    
    # 1. Fetch all prescriptions for the user
    prescriptions = list(db.prescriptions.find({"user_id": user_id}))
    
    # 2. Clear old alerts for this user
    db.safety_alerts.delete_many({"user_id": user_id})
    
    # 3. For each prescription, run checks
    all_new_alerts = []
    for p in prescriptions:
        medicines = p.get("medicines", [])
        if not medicines:
            continue
            
        interaction_alerts = check_interactions(medicines)
        allergy_alerts = check_allergies(medicines, user_allergies)
        
        prescription_alerts = interaction_alerts + allergy_alerts
        for alert in prescription_alerts:
            alert["user_id"] = user_id
            alert["prescription_id"] = p["_id"]
            all_new_alerts.append(alert)
            
    # 4. Save new alerts
    if all_new_alerts:
        db.safety_alerts.insert_many(all_new_alerts)
        
    return len(all_new_alerts)

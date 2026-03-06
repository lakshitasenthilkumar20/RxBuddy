# Synthetic mapping of common medicines to their active ingredients.
# This serves as a local fallback to avoid external API calls while still providing allergy detection.

MEDICINE_INGREDIENTS = {
    "advil": ["ibuprofen"],
    "motrin": ["ibuprofen"],
    "tylenol": ["acetaminophen", "paracetamol"],
    "panadol": ["acetaminophen", "paracetamol"],
    "aspirin": ["acetylsalicylic acid"],
    "ecotrin": ["acetylsalicylic acid"],
    "benadryl": ["diphenhydramine"],
    "claritin": ["loratadine"],
    "zyrtec": ["cetirizine"],
    "allegra": ["fexofenadine"],
    "amoxicillin": ["amoxicillin", "penicillin class"],
    "augmentin": ["amoxicillin", "clavulanate"],
    "zithromax": ["azithromycin"],
    "lipitor": ["atorvastatin"],
    "zocor": ["simvastatin"],
    "crestor": ["rosuvastatin"],
    "nexium": ["esomeprazole"],
    "prilosec": ["omeprazole"],
    "vicodin": ["hydrocodone", "acetaminophen"],
    "percocet": ["oxycodone", "acetaminophen"],
    "xanax": ["alprazolam"],
    "valium": ["diazepam"],
    "ativan": ["lorazepam"],
    "metformin": ["metformin"],
    "glucophage": ["metformin"],
    "lisinopril": ["lisinopril"],
    "zestril": ["lisinopril"],
    "norvasc": ["amlodipine"],
    "synthroid": ["levothyroxine"],
    "ventolin": ["albuterol"],
    "proair": ["albuterol"],
    "singulair": ["montelukast"],
    "cymbalta": ["duloxetine"],
    "lexapro": ["escitalopram"],
    "zoloft": ["sertraline"],
    "prozac": ["fluoxetine"],
    "effexor": ["venlafaxine"],
    "wellbutrin": ["bupropion"],
}

def get_ingredients_locally(med_name: str):
    """Returns a list of ingredients for a given medicine name using the local synthetic dataset."""
    med_name_lower = med_name.lower().strip()
    return MEDICINE_INGREDIENTS.get(med_name_lower, [])

def check_medicine_allergy(med_name: str, user_allergies: list):
    """
    Checks if a medicine triggers any allergies in the user's list.
    Returns a dict with alert details if found, else None.
    """
    med_name_lower = med_name.lower().strip()
    user_allergies_lower = [a.get("name", "").lower().strip() if isinstance(a, dict) else str(a).lower().strip() for a in user_allergies]
    
    # 1. Direct Match (Medicine Name)
    for allergy in user_allergies_lower:
        if allergy and (allergy in med_name_lower or med_name_lower in allergy):
            return {
                "medication": med_name,
                "alert_type": "ALLERGY",
                "severity": "HIGH",
                "description": f"Direct Allergy Match: You are allergic to {allergy} (found in {med_name})"
            }
            
    # 2. Ingredient Match
    ingredients = get_ingredients_locally(med_name_lower)
    for ingredient in ingredients:
        for allergy in user_allergies_lower:
            if allergy and (allergy in ingredient or ingredient in allergy):
                return {
                    "medication": med_name,
                    "alert_type": "ALLERGY",
                    "severity": "HIGH",
                    "description": f"Ingredient Allergy: '{med_name}' contains '{ingredient}', which matches your allergy profile."
                }
                
    return None

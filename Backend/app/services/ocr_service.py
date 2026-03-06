import os
import sys

# Ensure the backend directory is in the path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from app.services.ocr_engine import MedicineOCR

# Root path where the checkpoints are located
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

# Initialize the OCR engine
try:
    # Use the root directory where config.json and model.safetensors are located
    extractor = MedicineOCR(model_path=PROJECT_ROOT)
except Exception as e:
    print(f"❌ Critical Error initializing OCR Engine: {e}")
    extractor = None

def process_prescription_ocr(file_path: str):
    """
    Main entry point for processing prescription OCR.
    """
    if not extractor:
        return "OCR service not initialized. Check if checkpoints are present.", []
    
    try:
        # Process the image
        results = extractor.process_image(file_path)
        
        # Format results for the backend
        medicines = []
        for med in results.get('details', []):
            medicines.append({
                "name": med.get('name'),
                "dosage": med.get('dosage'),
                "confidence": med.get('confidence'),
                "original_text": med.get('original')
            })
        
        # summary text
        if medicines:
            extracted_text = "Extracted Medicines: " + ", ".join([f"{m['name']} ({m['dosage'] or 'N/A'})" for m in medicines])
        else:
            extracted_text = "No medicines detected in the prescription."
            
        return extracted_text, medicines
        
    except Exception as e:
        print(f"❌ Error during OCR processing: {e}")
        return f"OCR processing failed: {str(e)}", []

import re

def extract_medicines_from_text(text: str):
    """
    Extract medicines from a raw text string using the engine's database.
    Useful when users manually edit the OCR text.
    """
    if not extractor or not text:
        return []
        
    # Standardize text and split into potential tokens
    # We use a simple regex to split by common separators
    potential_tokens = re.split(r'[,\n\t;]+', text)
    
    medicines = []
    seen = set()
    
    for token in potential_tokens:
        token = token.strip()
        if not token: continue
        
        # Check if this token (or parts of it) matches a medicine
        # The engine's is_medicine handles fuzzy matching
        med_match = extractor.is_medicine(token)
        if med_match and med_match not in seen:
            medicines.append({
                "name": med_match,
                "dosage": extractor.extract_dosage(token),
                "confidence": 100.0,
                "original_text": token
            })
            seen.add(med_match)
            
    return medicines

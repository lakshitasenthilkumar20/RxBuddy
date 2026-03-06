from pydantic import BaseModel
from datetime import datetime

class Prescription(BaseModel):
    user_email: str
    file_path: str
    uploaded_at: datetime
    status: str = "UPLOADED"

from typing import List, Optional

class OCRMedicine(BaseModel):
    name: str
    dosage: str
    frequency: str

class PrescriptionUpdate(BaseModel):
    ocr_text: str
    medicines: List[OCRMedicine]
    status: str

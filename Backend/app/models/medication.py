from pydantic import BaseModel
from typing import List
from datetime import date

class Medication(BaseModel):
    prescription_id: str
    name: str
    dosage: str
    frequency: str   # e.g., "Twice a day"
    duration_days: int

class IntakeRecord(BaseModel):
    medication_id: str
    date: date
    status: str      # TAKEN / MISSED

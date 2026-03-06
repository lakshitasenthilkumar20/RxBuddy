from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., max_length=70)
    confirm_password: str
    role: str = "user"
    allergies: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    allergies: List[Any] = []

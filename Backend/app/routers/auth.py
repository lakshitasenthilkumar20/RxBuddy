from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.db import get_db
from app.models.user import UserCreate
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserCreate):
    try:
        db = get_db()

        # 1. Password match check
        if user.password != user.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Passwords do not match"
            )

        # 2. Existing user check
        if db.users.find_one({"email": user.email}):
            raise HTTPException(
                status_code=400,
                detail="User already exists"
            )

        # 3. Insert user (DO NOT store confirm_password)
        new_user = {
            "full_name": user.full_name,
            "email": user.email,
            "password": hash_password(user.password),
            "role": user.role,
            "allergies": [a.lower() for a in user.allergies]
        }



        db.users.insert_one(new_user)

        return {"message": "Account created successfully"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("REGISTER ERROR:", e)   # 🔥 THIS WILL SHOW REAL ERROR
        raise HTTPException(
            status_code=500,
            detail=f"Internal Server Error: {str(e)}"
        )



@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()

    user = db.users.find_one({"email": form_data.username})

    # user must exist and provided password should match hashed version
    if not user or not verify_password(form_data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["email"]})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from schemas.models_db import User, VerificationCode, MedicalReport
from pydantic import BaseModel, Field, field_validator
from auth import get_password_hash, verify_password, create_access_token
from email_service import generate_otp, send_otp_email, send_welcome_email, send_delete_account_email
import random

router = APIRouter()

def cleanup_old_otps(db: Session):
    try:
        # Code expires in 10 mins. Deleting it when expires_at is 10 mins in the past
        # means it deletes codes exactly 20 minutes after they were created.
        db.query(VerificationCode).filter(
            VerificationCode.expires_at < datetime.utcnow() - timedelta(minutes=10)
        ).delete()
        db.commit()
    except Exception as e:
        print(f"Error cleaning up OTPs: {e}")

class BaseEmailRequest(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def email_to_lower(cls, v: str) -> str:
        return v.lower()

class AuthRequest(BaseEmailRequest):
    password: str

class SignupRequest(BaseEmailRequest):
    name: str
    password: str = Field(..., min_length=6)
    gender: str = "Prefer not to say"

class VerifyRequest(BaseEmailRequest):
    otp: str

class ResendRequest(BaseEmailRequest):
    pass

class ForgotPasswordRequest(BaseEmailRequest):
    pass

class VerifyResetOtpRequest(BaseEmailRequest):
    otp: str

class ResetPasswordRequest(BaseEmailRequest):
    otp: str
    new_password: str = Field(..., min_length=6)

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    cleanup_old_otps(db)
    user = db.query(User).filter(User.email == req.email).first()
    
    hashed_password = get_password_hash(req.password)
    
    if user:
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            user.name = req.name
            user.hashed_password = hashed_password
            user.gender = req.gender
            if not user.patient_id:
                user.patient_id = f"PT-{random.randint(100000, 999999)}"
            db.commit()
    else:
        patient_id = f"PT-{random.randint(100000, 999999)}"
        new_user = User(name=req.name, email=req.email, hashed_password=hashed_password, gender=req.gender, patient_id=patient_id)
        db.add(new_user)
        db.commit()
    
    # Send OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # clear old OTPs
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    code = VerificationCode(email=req.email, code=otp, expires_at=expires_at)
    db.add(code)
    db.commit()
    
    send_otp_email(req.email, otp)
    return {"message": "User created. OTP sent to email."}

@router.post("/signin")
def signin(req: AuthRequest, db: Session = Depends(get_db)):
    cleanup_old_otps(db)
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email is not registered")
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified. Please go to Sign Up to verify your email.")
        
    # Send OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # clear old OTPs
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    code = VerificationCode(email=req.email, code=otp, expires_at=expires_at)
    db.add(code)
    db.commit()
    
    send_otp_email(req.email, otp)
    return {"message": "OTP sent to email."}

@router.post("/verify")
def verify_otp(req: VerifyRequest, db: Session = Depends(get_db)):
    record = db.query(VerificationCode).filter(VerificationCode.email == req.email, VerificationCode.code == req.otp).first()
    
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    is_new_verification = False
    if user:
        if not user.is_verified:
            is_new_verification = True
        user.is_verified = True
        db.commit()
        
    # Delete OTP record
    db.delete(record)
    db.commit()
    
    if is_new_verification and user:
        send_welcome_email(user.email, user.name)
    
    access_token = create_access_token(data={"sub": req.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "email": req.email, 
        "name": user.name if user else "User", 
        "gender": user.gender if user else "Prefer not to say",
        "patientId": user.patient_id if user else None
    }

@router.post("/resend-otp")
def resend_otp(req: ResendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")
        
    # Send OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # clear old OTPs
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    code = VerificationCode(email=req.email, code=otp, expires_at=expires_at)
    db.add(code)
    db.commit()
    
    send_otp_email(req.email, otp)
    return {"message": "OTP resent to email."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified. Please go to Sign Up to create your account.")
        
    # Send OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # clear old OTPs
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    code = VerificationCode(email=req.email, code=otp, expires_at=expires_at)
    db.add(code)
    db.commit()
    
    send_otp_email(req.email, otp)
    return {"message": "If the email is registered, an OTP has been sent."}

@router.post("/verify-reset-otp")
def verify_reset_otp(req: VerifyResetOtpRequest, db: Session = Depends(get_db)):
    record = db.query(VerificationCode).filter(VerificationCode.email == req.email, VerificationCode.code == req.otp).first()
    
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    # We do NOT delete the OTP here, as it's needed for the actual reset step.
    return {"message": "OTP is valid."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(VerificationCode).filter(VerificationCode.email == req.email, VerificationCode.code == req.otp).first()
    
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(req.new_password)
    user.hashed_password = hashed_password
    
    # Delete OTP record
    db.delete(record)
    db.commit()
    
    return {"message": "Password has been successfully reset."}

@router.post("/request-delete-account")
def request_delete_account(req: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

        
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # clear old OTPs
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    code = VerificationCode(email=req.email, code=otp, expires_at=expires_at)
    db.add(code)
    db.commit()
    
    send_delete_account_email(req.email, user.name, otp)
    return {"message": "OTP sent to email for account deletion."}

@router.post("/verify-delete-account")
def verify_delete_account(req: VerifyRequest, db: Session = Depends(get_db)):
    record = db.query(VerificationCode).filter(VerificationCode.email == req.email, VerificationCode.code == req.otp).first()
    
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Delete associated medical reports if any
    db.query(MedicalReport).filter(MedicalReport.user_email == req.email).delete()
    
    # Delete OTP records
    db.query(VerificationCode).filter(VerificationCode.email == req.email).delete()
    
    # Delete User
    db.delete(user)
    db.commit()
    
    return {"message": "Account successfully deleted."}


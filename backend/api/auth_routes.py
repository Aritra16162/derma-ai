from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from schemas.models_db import User, VerificationCode
from pydantic import BaseModel, Field
from auth import get_password_hash, verify_password, create_access_token
from email_service import generate_otp, send_otp_email, send_welcome_email

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

class AuthRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str = Field(..., min_length=6)

class VerifyRequest(BaseModel):
    email: str
    otp: str

class ResendRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyResetOtpRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
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
            db.commit()
    else:
        new_user = User(name=req.name, email=req.email, hashed_password=hashed_password)
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
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
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
    return {"access_token": access_token, "token_type": "bearer", "email": req.email, "name": user.name if user else "User"}

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
        raise HTTPException(status_code=404, detail="No account found with this email address")
        
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

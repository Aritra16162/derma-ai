from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="User")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    condition_name = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    survey_data = Column(String, nullable=False) # Store JSON string
    image_data = Column(String, nullable=True) # Store base64 image
    gea_summary = Column(String, nullable=True)
    gea_details = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

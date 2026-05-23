"""
API routes — FastAPI router containing the classification endpoint.
"""

from pydantic import BaseModel
from typing import Optional
from pdf_generator import create_report_pdf
from email_service import send_pdf_email
import json
import os
from schemas.models_db import MedicalReport
from database import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends

from schemas.models import ClassifyRequest, ClassifyResponse
from ml.vision import preprocess_image, predict
from utils import map_triage_level

router = APIRouter()

class ValidateImageRequest(BaseModel):
    image: str

@router.post("/validate-image")
async def validate_image_endpoint(req: ValidateImageRequest):
    try:
        img_arr = preprocess_image(req.image)
        from ml.vision import is_valid_skin_image
        is_valid = is_valid_skin_image(img_arr)
        return {"valid": is_valid}
    except Exception as e:
        print(f"Error during validation: {e}")
        return {"valid": False, "error": str(e)}

@router.post("/classify", response_model=ClassifyResponse)
async def classify_endpoint(req: ClassifyRequest):
    """
    Accept a base64 image and survey data, run the ML model,
    calculate triage urgency, and return a structured response.
    """
    import ml.vision
    ml.vision.ensure_model_loaded()

    if ml.vision.model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Please ensure model.keras exists.",
        )

    try:
        img_arr = preprocess_image(req.image)
        
        from ml.vision import is_valid_skin_image
        if not is_valid_skin_image(img_arr):
            raise HTTPException(
                status_code=400,
                detail="INVALID_IMAGE_DETECTED",
            )
            
        predicted_class, confidence = predict(img_arr)

        # Combine ML prediction with survey answers for triage
        danger_level = map_triage_level(predicted_class, req.survey.dict())

        return ClassifyResponse(
            predicted_class=predicted_class,
            confidence=confidence,
            danger_level=danger_level,
        )
    except Exception as e:
        print(f"Error during classification: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during classification.",
        )

class ReportRequest(BaseModel):
    email: str
    triage_data: dict

@router.post("/send-report")
async def send_report_endpoint(req: ReportRequest):
    try:
        import uuid
        pdf_path = f"report_{req.email.split('@')[0]}_{uuid.uuid4().hex[:8]}.pdf"
        create_report_pdf(req.triage_data, pdf_path)
        
        send_pdf_email(req.email, pdf_path)
        
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            
        return {"message": "Report sent to email successfully."}
    except Exception as e:
        print(f"Error sending report: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to send report: {str(e)}")

class SaveReportRequest(BaseModel):
    email: str
    condition_name: str
    urgency: str
    survey_data: dict
    image_data: Optional[str] = None

@router.post("/reports")
def save_report(req: SaveReportRequest, db: Session = Depends(get_db)):
    report = MedicalReport(
        user_email=req.email,
        condition_name=req.condition_name,
        urgency=req.urgency,
        survey_data=json.dumps(req.survey_data),
        image_data=req.image_data
    )
    db.add(report)
    db.commit()
    return {"message": "Report saved"}

@router.get("/reports/{email}")
def get_reports(email: str, db: Session = Depends(get_db)):
    reports = db.query(MedicalReport).filter(MedicalReport.user_email == email).order_by(MedicalReport.date.desc()).all()
    result = []
    for r in reports:
        result.append({
            "id": f"REC-{r.id}",
            "date": r.date.isoformat() + "Z",
            "patientName": "User", # Managed by frontend
            "conditionName": r.condition_name,
            "urgency": r.urgency,
            "surveyData": json.loads(r.survey_data),
            "image_data": r.image_data
        })
    return result

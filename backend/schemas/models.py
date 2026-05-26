from pydantic import BaseModel


class SurveyData(BaseModel):
    """Pydantic model for the symptom survey questionnaire."""
    duration: str
    pain: str
    spreading: str
    history: str
    fever: str


class ClassifyRequest(BaseModel):
    """Incoming classification request containing a base64 image and survey answers."""
    image: str  # Base64-encoded image string
    survey: SurveyData
    previous_diagnosis: str | None = None


class ClassifyResponse(BaseModel):
    """Structured response returned after ML classification and triage."""
    predicted_class: str
    confidence: float
    danger_level: str
    gea_summary: str | None = None
    gea_details: str | None = None

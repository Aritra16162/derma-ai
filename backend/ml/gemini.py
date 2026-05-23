import os
import google.generativeai as genai
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

def get_gemini_api_key():
    load_dotenv(dotenv_path=env_path, override=True)
    return os.environ.get("GEMINI_API_KEY")

def get_gemini_model():
    key = get_gemini_api_key()
    if key:
        genai.configure(api_key=key)
    return genai.GenerativeModel('gemini-1.5-flash')

def _prepare_image(img_base64: str):
    if "base64," in img_base64:
        header, base64_data = img_base64.split("base64,")
        mime_type = header.split(":")[1].split(";")[0]
    else:
        base64_data = img_base64
        mime_type = "image/jpeg"
        
    return {
        "mime_type": mime_type,
        "data": base64_data
    }

def validate_image_with_gemini(img_base64: str) -> bool:
    """
    Asks Gemini if the image is a clear photo of human skin or a medical condition.
    Returns True if valid, False if it's an object/landscape/etc.
    """
    if not get_gemini_api_key():
        # Fallback to true if no key provided, so we don't break the app
        return True
        
    try:
        model = get_gemini_model()
        image_part = _prepare_image(img_base64)
        prompt = "Is this a clear, close-up photo of human skin or a medical skin condition? Answer ONLY 'YES' or 'NO'."
        
        response = model.generate_content([prompt, image_part])
        text = response.text.strip().upper()
        return "YES" in text
    except Exception as e:
        print(f"Gemini validation error: {e}")
        return True # Fallback if API fails

def get_advanced_insights(img_base64: str, survey_data: dict) -> tuple[str, str]:
    """
    Asks Gemini for a diagnosis based on image and survey.
    Returns (summary_word, details_paragraph).
    """
    if not get_gemini_api_key():
        return ("Unavailable", "Gemini API Key is missing. Advanced insights are unavailable.")
        
    try:
        model = get_gemini_model()
        image_part = _prepare_image(img_base64)
        prompt = f"""
Act as a dermatologist. Analyze the image and the following patient symptoms:
Duration: {survey_data.get('duration', 'Unknown')}
Pain: {survey_data.get('pain', 'Unknown')}
Spreading: {survey_data.get('spreading', 'Unknown')}
History: {survey_data.get('history', 'Unknown')}
Fever: {survey_data.get('fever', 'Unknown')}

Instructions:
1. First, provide a SINGLE WORD summary of the most likely condition (e.g., "Infection", "Melanoma", "Benign", "Rash"). Do not add any punctuation to this word.
2. Then, start a new paragraph exactly with the phrase "Given the uploaded photo its shows" and give a detailed analysis and advice.

Your response must be exactly two lines separated by a newline.
Line 1: [SINGLE WORD]
Line 2: Given the uploaded photo its shows...
"""
        
        response = model.generate_content([prompt, image_part])
        text = response.text.strip()
        
        parts = text.split('\n', 1)
        if len(parts) == 2:
            summary = parts[0].strip()
            details = parts[1].strip()
        else:
            summary = "Analysis"
            details = text
            
        return (summary, details)
    except Exception as e:
        print(f"Gemini insight error: {e}")
        return ("Error", "Failed to generate advanced insights.")

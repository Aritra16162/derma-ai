import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

def get_gemini_api_key():
    load_dotenv(dotenv_path=env_path, override=True)
    return os.environ.get("GEMINI_API_KEY")

def get_gemini_client():
    key = get_gemini_api_key()
    if key:
        return genai.Client(api_key=key)
    return None

def _prepare_image_part(img_base64: str):
    if "base64," in img_base64:
        header, base64_data = img_base64.split("base64,")
        mime_type = header.split(":")[1].split(";")[0]
    else:
        base64_data = img_base64
        mime_type = "image/jpeg"
        
    image_bytes = base64.b64decode(base64_data)
    return types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

def validate_image_with_gemini(img_base64: str) -> bool:
    """
    Asks Gemini if the image is a clear photo of human skin or a medical condition.
    Returns True if valid, False if it's an object/landscape/etc.
    """
    client = get_gemini_client()
    if not client:
        # Fallback to true if no key provided, so we don't break the app
        return True
        
    try:
        image_part = _prepare_image_part(img_base64)
        prompt = "Is this a clear, close-up photo of human skin or a medical skin condition? Answer ONLY 'YES' or 'NO'."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, image_part]
        )
        text = response.text.strip().upper()
        return "YES" in text
    except Exception as e:
        print(f"Gemini validation error: {e}")
        return True # Fallback if API fails

def get_advanced_insights(img_base64: str, survey_data: dict, predicted_class: str) -> tuple[str, str]:
    """
    Asks Gemini for a diagnosis based on image and survey.
    Returns (summary_word, details_paragraph).
    """
    client = get_gemini_client()
    if not client:
        return ("Unavailable", "failed to generate advanced AI insights . contact admin.")
        
    try:
        image_part = _prepare_image_part(img_base64)
        prompt = f"""
Act as a dermatologist. Analyze the clinical image.

The primary AI model predicted this condition as: {predicted_class}.

Instructions:
1. First, provide a SINGLE WORD summary of the most likely diagnosis (e.g., "Infection", "Erythema", "Benign", "Rash"). Do not add any punctuation to this word.
2. Then, start a new paragraph exactly with the phrase "Given the uploaded photo its shows". In this paragraph (max 4 sentences), you must do the following:
   - Think independently and use your high thinking capabilities to analyze the visual evidence in the photo.
   - You MUST provide ONLY ONE single most probable disease name as your diagnosis. Do not list multiple potential names or differentials.
   - You MUST wrap that single disease name in double asterisks so it can be highlighted (e.g., **Erythema Nodosum**).
   - You MUST mention and support the primary AI model's prediction ({predicted_class}), but smoothly transition to emphasize your own independent visual diagnosis as the more precise interpretation. For example: "While it supports the initial prediction of {predicted_class}, the visual presentation is more precisely suggestive of **Erythema Nodosum**..."
   - DO NOT give any negative or dismissive comments about the primary model's prediction. DO NOT explicitly quote or list patient symptoms, rely entirely on the visual features of the image.
   - DO NOT use first-person pronouns (do NOT say "I", "my AI", etc.); speak objectively.
   - Finally, you MUST conclude the paragraph with medical advice recommending a visit to a doctor for a formal evaluation and noting that appropriate medication may be helpful.

Your response must be exactly two lines separated by a newline.
Line 1: [SINGLE WORD AI DIAGNOSIS]
Line 2: Given the uploaded photo its shows...
"""
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, image_part]
        )
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
        return ("Error", "failed to generate advanced AI insights . contact admin.")

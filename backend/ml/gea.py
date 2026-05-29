import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

import time

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

def get_gea_api_keys():
    load_dotenv(dotenv_path=env_path, override=True)
    keys_str = os.environ.get("GEA_API_KEYS")
    if keys_str:
        return [k.strip() for k in keys_str.split(",") if k.strip()]
    single_key = os.environ.get("GEA_API_KEY")
    if single_key:
        return [k.strip() for k in single_key.split(",") if k.strip()]
    return []

# Global state for round-robin key rotation
_current_key_index = 0

def generate_content_with_fallback(prompt: str, image_part):
    global _current_key_index
    keys = get_gea_api_keys()
    if not keys:
        raise Exception("No API keys configured.")

    models_to_try = [
        os.environ.get('GEA_MODEL_NAME', 'gemini-2.5-flash'),
        'gemini-1.5-flash'  # Fallback model
    ]
    
    max_retries = 3
    base_wait = 1
    last_exception = None

    for attempt in range(max_retries):
        current_key = keys[_current_key_index]
        client = genai.Client(api_key=current_key)
        
        for model in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=[prompt, image_part]
                )
                return response
            except Exception as e:
                err_str = str(e).lower()
                last_exception = e
                print(f"Error with key index {_current_key_index} on model {model}: {e}")
                
                if any(x in err_str for x in ["429", "quota", "exhausted", "400", "invalid", "403"]):
                    print(f"API error or Quota hit (Error: {err_str[:30]}). Rotating API key.")
                    _current_key_index = (_current_key_index + 1) % len(keys)
                    break 
                
                if "404" in err_str or "not found" in err_str:
                    print(f"Model {model} not found or unsupported. Falling back to next model.")
                    continue
                    
                break 

        wait_time = base_wait * (2 ** attempt)
        if attempt < max_retries - 1:
            print(f"Waiting {wait_time}s before retry {attempt + 1}...")
            time.sleep(wait_time)

    raise Exception(f"Failed after {max_retries} attempts. Last error: {last_exception}")

def _prepare_image_part(img_base64: str):
    if "base64," in img_base64:
        header, base64_data = img_base64.split("base64,")
        mime_type = header.split(":")[1].split(";")[0]
    else:
        base64_data = img_base64
        mime_type = "image/jpeg"
        
    image_bytes = base64.b64decode(base64_data)
    return types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

def validate_image_with_gea(img_base64: str) -> bool:
    """
    Asks GeA if the image is a clear photo of human skin or a medical condition.
    Returns True if valid, False if it's an object/landscape/etc.
    """
    try:
        image_part = _prepare_image_part(img_base64)
        prompt = "Is this a clear, close-up photo of human skin or a medical skin condition? Answer ONLY 'YES' or 'NO'."
        
        response = generate_content_with_fallback(prompt, image_part)
        text = response.text.strip().upper()
        return "YES" in text
    except Exception as e:
        print(f"GeA validation error: {e}")
        return True # Fallback if API fails

def get_advanced_insights(img_base64: str, survey_data: dict, predicted_class: str, previous_diagnosis: str = None) -> tuple[str, str]:
    """
    Asks GeA for a diagnosis based on image and survey.
    Returns (summary_word, details_paragraph).
    """
    try:
        image_part = _prepare_image_part(img_base64)
        symptoms_str = f"""
Patient Reported Symptoms:
- Duration: {survey_data.get('duration', 'N/A')}
- Pain/Itchiness: {survey_data.get('pain', 'N/A')}
- Spreading: {survey_data.get('spreading', 'N/A')}
- Prior Occurrence: {survey_data.get('history', 'N/A')}
- Fever/Other Symptoms: {survey_data.get('fever', 'N/A')}
"""

        prompt = f"""
Act as a dermatologist. Analyze the clinical image.

The primary AI model predicted this condition as: {predicted_class}.
{symptoms_str}

Instructions:
1. First, provide a SINGLE WORD summary of the most likely diagnosis (e.g., "Infection", "Erythema", "Benign", "Rash"). Do not add any punctuation to this word.
2. Then, start a new paragraph exactly with the phrase "Given the uploaded photo its shows". In this paragraph (max 4 sentences), you must do the following:
   - Think independently and use your high thinking capabilities to analyze the visual evidence in the photo, taking into account the patient's symptoms.
   - You MUST provide ONLY ONE single most probable disease name as your diagnosis. Do not list multiple potential names or differentials.
   - You MUST wrap that single disease name in double asterisks so it can be highlighted (e.g., **Erythema Nodosum**).
   - You MUST mention and support the primary AI model's prediction ({predicted_class}), but smoothly transition to emphasize your own independent clinical diagnosis as the more precise interpretation.
   - DO NOT give any negative or dismissive comments about the primary model's prediction.
   - DO NOT explicitly quote or list the exact answers from the patient symptoms. Instead, factor them into your diagnosis by mentioning the "problems faced by the patient" (e.g., "Considering the visual presentation alongside the problems faced by the patient, this is suggestive of...").
   - DO NOT use first-person pronouns (do NOT say "I", "my AI", etc.); speak objectively.
   - Finally, you MUST conclude the paragraph with medical advice recommending a visit to a doctor for a formal evaluation and noting that appropriate medication may be helpful.

Your response must be exactly two lines separated by a newline.
Line 1: [SINGLE WORD AI DIAGNOSIS]
Line 2: Given the uploaded photo its shows...
"""
        
        if previous_diagnosis and previous_diagnosis not in ["Error", "Unavailable", "Analysis"]:
            prompt += f"\nNote: You previously diagnosed this case as {previous_diagnosis}. Please maintain clinical consistency with your previous diagnosis when generating this response.\n"
        
        response = generate_content_with_fallback(prompt, image_part)
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
        print(f"GeA advanced insights error: {e}")
        return ("Error", f"Failed to generate advanced AI insights. Contact admin. Error: {str(e)}")

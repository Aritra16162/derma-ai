import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=key)
    
    dummy_img = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    header, base64_data = dummy_img.split("base64,")
    mime_type = header.split(":")[1].split(";")[0]
    
    image_bytes = base64.b64decode(base64_data)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            "Describe this image.",
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        ]
    )
    print("Success:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()

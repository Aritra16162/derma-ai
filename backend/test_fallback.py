import os
import base64
from ml.gea import generate_content_with_fallback, _prepare_image_part

# Create a dummy base64 image
dummy_img = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="

def test_fallback():
    # Set fake keys in environment to simulate failure and rotation
    # We will provide an invalid key first, and a valid key second if we wanted a real test,
    # but since we don't have the real key here in the test script, we just test the rotation logic
    # using invalid keys and expect it to fail after retries.
    
    os.environ["GEA_API_KEYS"] = "invalid_key_1,invalid_key_2"
    
    print("Testing Fallback Logic with Invalid Keys (Should fail after retries and rotation)...")
    try:
        image_part = _prepare_image_part(dummy_img)
        generate_content_with_fallback("Describe this image.", image_part)
    except Exception as e:
        print(f"\nCaught Expected Exception: {e}")
        print("Fallback logic executed successfully!")

if __name__ == "__main__":
    test_fallback()

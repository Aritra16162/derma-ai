import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from ml.gea import get_advanced_insights

# A 1x1 transparent pixel base64 image
b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

try:
    summary, details = get_advanced_insights(b64, {}, "Test")
    print(f"Summary: {summary}")
    print(f"Details: {details}")
except Exception as e:
    print(f"Error: {e}")

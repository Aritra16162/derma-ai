import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    red_dominant = (r > g) & (r > b)
    not_black = (r > 15)
    not_gray = (r - g > 2)
    
    # Saturation constraint (max - min)
    # Using np.maximum and np.minimum
    max_val = np.maximum(np.maximum(r, g), b)
    min_val = np.minimum(np.minimum(r, g), b)
    saturation = max_val - min_val
    has_color = saturation > 15
    
    is_skin = red_dominant & not_black & not_gray & has_color
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('Pale Skin (240, 220, 210):', test(240, 220, 210))
print('Warm Glare (255, 250, 245):', test(255, 250, 245))
print('Warm Glare 2 (255, 245, 235):', test(255, 245, 235))

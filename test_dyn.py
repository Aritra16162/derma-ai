import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    red_dominant = (r > g) & (r > b)
    not_black = (r > 15)
    
    # Base difference requirement
    not_gray = (r - g > 2)
    
    # If the pixel is very bright (potential glare), require a stronger color difference
    # meaning it must be distinctly skin-colored, not just slightly tinted white light
    not_glare = ~((r > 220) & (r - g < 15))
    
    is_skin = red_dominant & not_black & not_gray & not_glare
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('Pale Skin (240, 220, 210):', test(240, 220, 210))
print('Warm Glare (255, 250, 245):', test(255, 250, 245))
print('Warm Glare 2 (255, 245, 235):', test(255, 245, 235))

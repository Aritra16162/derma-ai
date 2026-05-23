import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    g_safe = np.where(g == 0, 1, g)
    b_safe = np.where(b == 0, 1, b)
    
    r_g_ratio = r / g_safe
    r_b_ratio = r / b_safe
    
    not_black = (r > 15)
    
    is_skin = not_black & (r_g_ratio > 1.10) & (r_b_ratio > 1.20)
    
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('White Glare (255, 250, 245):', test(255, 250, 245))
print('Warm Glare (255, 230, 215):', test(255, 230, 215))
print('Yellowish Skin (200, 180, 140):', test(200, 180, 140))
print('Pale Skin (240, 220, 210):', test(240, 220, 210))

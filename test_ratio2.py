import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    g_safe = np.where(g == 0, 1, g)
    
    red_dominant = (r > g) & (r > b)
    not_black = (r > 15)
    
    r_g_ratio = r / g_safe
    
    is_skin = red_dominant & not_black & (r_g_ratio > 1.10)
    
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('Warm Glare (255, 240, 230):', test(255, 240, 230))
print('Slightly warm dark noise (17, 15, 15):', test(17, 15, 15))

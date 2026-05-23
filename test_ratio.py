import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    # Avoid division by zero
    g_safe = np.where(g == 0, 1, g)
    b_safe = np.where(b == 0, 1, b)
    
    red_dominant = (r > g) & (r > b)
    not_black = (r > 15)
    
    # Ratio checks
    r_g_ratio = r / g_safe
    
    is_skin = red_dominant & not_black & (r_g_ratio > 1.05) & (r_g_ratio < 2.5)
    
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('Warm Glare (255, 250, 240):', test(255, 250, 240))
print('Metal Gray (150, 150, 150):', test(150, 150, 150))
print('Dark Metal (20, 20, 20):', test(20, 20, 20))

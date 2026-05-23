import numpy as np

def test(R, G, B):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    red_dominant = (r > g) & (r > b)
    not_black = (r > 15)
    not_gray = (r - g > 2)
    
    is_skin = red_dominant & not_black & not_gray
    return np.mean(is_skin)

print('Very Dark Skin (25, 18, 15):', test(25, 18, 15))
print('Light Skin (220, 180, 160):', test(220, 180, 160))
print('Metal Gray (150, 150, 150):', test(150, 150, 150))
print('Dark Metal (20, 20, 20):', test(20, 20, 20))
print('Green Grass (40, 100, 40):', test(40, 100, 40))

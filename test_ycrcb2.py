import numpy as np

def test(R, G, B, name):
    r = np.full((10,10), R, dtype=np.float32)
    g = np.full((10,10), G, dtype=np.float32)
    b = np.full((10,10), B, dtype=np.float32)
    
    Y = 0.299 * r + 0.587 * g + 0.114 * b
    Cr = (r - Y) * 0.713 + 128
    Cb = (b - Y) * 0.564 + 128
    
    is_skin = (Y > 15) & (Cr > 133) & (Cr < 173) & (Cb > 77) & (Cb < 127)
    
    print(f"{name}: {np.mean(is_skin)}")

test(25, 18, 15, 'Very Dark Skin (25, 18, 15)')
test(220, 180, 160, 'Light Skin (220, 180, 160)')
test(240, 220, 210, 'Pale Skin (240, 220, 210)')
test(255, 250, 245, 'Warm Glare (255, 250, 245)')
test(180, 100, 50, 'Brown Wood (180, 100, 50)')
test(255, 150, 50, 'Sunset Orange (255, 150, 50)')

import numpy as np

# Light skin
skin = np.random.normal(200, 10, (300, 300, 3)).astype(np.float32)
# Add a dark mole in the center (size 50x50)
skin[125:175, 125:175] = np.random.normal(50, 5, (50, 50, 3)).astype(np.float32)

print("Skin with mole std:", np.std(skin))

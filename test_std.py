import numpy as np

# Simulate smooth skin (mean 150, std 10)
skin = np.random.normal(150, 10, (300, 300, 3)).astype(np.float32)

# Simulate sunset (half dark mountains mean 30, half bright sky mean 220)
sunset = np.concatenate([
    np.random.normal(30, 10, (150, 300, 3)),
    np.random.normal(220, 20, (150, 300, 3))
], axis=0).astype(np.float32)

print("Skin std:", np.std(skin))
print("Sunset std:", np.std(sunset))

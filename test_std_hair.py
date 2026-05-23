import numpy as np

# Simulate hairy arm (half dark hair, half light skin)
hairy = np.concatenate([
    np.random.normal(30, 10, (150, 300, 3)), # Hair
    np.random.normal(200, 10, (150, 300, 3)) # Skin
], axis=0).astype(np.float32)

print("Hairy arm std:", np.std(hairy))

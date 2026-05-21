import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import CategoricalFocalCrossentropy
from tensorflow.keras.regularizers import l2
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'archive')
IMAGES_DIR = os.path.join(DATA_DIR, 'HAM10000_images')
METADATA_PATH = os.path.join(DATA_DIR, 'HAM10000_metadata.csv')
if not os.path.exists(METADATA_PATH):
    METADATA_PATH = os.path.join(DATA_DIR, 'HAM10000_metadata') # Fallback for no extension

BATCH_SIZE = 16
IMG_SIZE = (300, 300)

def build_model(num_classes):
    base_model = EfficientNetB3(input_shape=(300, 300, 3), include_top=False, weights='imagenet')
    base_model.trainable = True  # Unfreeze for fine-tuning
    
    # Freeze the first 200 layers (EfficientNetB3 has ~380 layers)
    for layer in base_model.layers[:200]:
        layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    # Added L2 regularization to prevent the model from memorizing the data
    x = Dense(128, activation='relu', kernel_regularizer=l2(0.01))(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)
    # Lowered learning rate slightly for smoother training
    model.compile(optimizer=Adam(learning_rate=5e-5), loss=CategoricalFocalCrossentropy(alpha=0.25, gamma=2.0), metrics=['accuracy'])
    return model

def train():
    print("Loading metadata from:", METADATA_PATH)
    
    # Load metadata
    df = pd.read_csv(METADATA_PATH)
    
    # Append .jpg to image_id to match filenames in IMAGES_DIR
    df['filename'] = df['image_id'] + '.jpg'
    
    # Target column is 'dx' (the diagnosis label)
    # Split into train and validation
    train_df, val_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['dx'])
    
    print(f"Training samples: {len(train_df)}, Validation samples: {len(val_df)}")

    # Data Augmentation (No rescaling needed for EfficientNet, it handles 0-255 pixels natively)
    train_datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    val_datagen = ImageDataGenerator()

    train_generator = train_datagen.flow_from_dataframe(
        dataframe=train_df,
        directory=IMAGES_DIR,
        x_col='filename',
        y_col='dx',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    validation_generator = val_datagen.flow_from_dataframe(
        dataframe=val_df,
        directory=IMAGES_DIR,
        x_col='filename',
        y_col='dx',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )

    num_classes = len(train_generator.class_indices)
    print(f"Detected {num_classes} classes: {train_generator.class_indices}")

    # Compute class weights to handle imbalance
    classes = train_generator.classes
    class_weights = compute_class_weight('balanced', classes=np.unique(classes), y=classes)
    class_weight_dict = dict(enumerate(class_weights))
    print(f"Computed class weights: {class_weight_dict}")

    # Save class indices for inference
    class_indices_path = os.path.join(os.path.dirname(__file__), 'class_indices.json')
    with open(class_indices_path, 'w') as f:
        json.dump(train_generator.class_indices, f)

    model = build_model(num_classes)

    print("Starting training with Early Stopping...")
    epochs = 100
    model_path = os.path.join(os.path.dirname(__file__), 'model.keras')
    checkpoint = ModelCheckpoint(filepath=model_path, monitor='val_loss', save_best_only=True, verbose=1)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=1e-6)
    early_stop = EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True, verbose=1)
    
    model.fit(
        train_generator,
        epochs=epochs,
        validation_data=validation_generator,
        class_weight=class_weight_dict,
        callbacks=[checkpoint, reduce_lr, early_stop]
    )

    print(f"Training completed. The best model across all epochs was saved to {model_path}")

if __name__ == "__main__":
    train()

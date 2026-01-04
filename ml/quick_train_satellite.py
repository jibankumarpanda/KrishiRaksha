"""
Quick training script for satellite verification model with reduced dataset.
"""
import os
import sys
import numpy as np
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent))

from training.satellite_model.dataset_loader import SatelliteDatasetLoader
from tensorflow.keras import layers, callbacks
from tensorflow import keras

print("=" * 80)
print("🛰️  QUICK SATELLITE MODEL TRAINING (Reduced Dataset)")
print("=" * 80)

# Initialize dataset loader
print("\n📦 Creating synthetic dataset...")
loader = SatelliteDatasetLoader(image_size=(256, 256))

# Create smaller synthetic dataset to avoid memory issues
images, labels = loader.create_synthetic_dataset(num_samples=400)
print(f"✓ Created {len(images)} synthetic samples")

# Print class distribution
print("\n📊 Class Distribution:")
for class_idx, class_name in enumerate(loader.classes):
    count = np.sum(labels == class_idx)
    percentage = (count / len(labels)) * 100
    print(f"   {class_name}: {count} samples ({percentage:.1f}%)")

# Split dataset
print("\n✂️  Splitting dataset...")
X_train, y_train, X_val, y_val, X_test, y_test = loader.split_dataset(
    images, labels, train_ratio=0.7, val_ratio=0.15
)

print(f"   📊 Training set: {len(X_train)} samples")
print(f"   📊 Validation set: {len(X_val)} samples")
print(f"   📊 Test set: {len(X_test)} samples")

# Create model
print("\n🏗️  Creating CNN model...")

# Create simplified model inline
model = keras.Sequential([
    layers.Input(shape=(256, 256, 3)),
    layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),
    layers.Dropout(0.25),
    
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),
    layers.Dropout(0.25),
    
    layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(2, 2),
    layers.Dropout(0.25),
    
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(len(loader.classes), activation='softmax')
])

# Compile with compatible metrics for sparse labels
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Setup model directory
model_dir = os.path.join(os.path.dirname(__file__), 'models', 'satellite_verification')
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'satellite_verifier.h5')

print(f"\n💾 Model will be saved to: {model_path}")

# Define callbacks
callbacks_list = [
    callbacks.ModelCheckpoint(
        model_path,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
]

# Train model
print("\n" + "=" * 80)
print("🎯 STARTING TRAINING (5 epochs)")
print("=" * 80)

history = model.fit(
    X_train, y_train,
    batch_size=16,
    epochs=5,
    validation_data=(X_val, y_val),
    callbacks=callbacks_list,
    verbose=1
)

# Evaluate on test set
print("\n" + "=" * 80)
print("📊 EVALUATING ON TEST SET")
print("=" * 80)

test_results = model.evaluate(X_test, y_test, verbose=1)
test_loss = test_results[0]
test_accuracy = test_results[1]

print("\n" + "=" * 80)
print("✅ FINAL TEST RESULTS")
print("=" * 80)
print(f"   Test Loss:           {test_loss:.4f}")
print(f"   Test Accuracy:       {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
print("=" * 80)

# Save final model
print(f"\n💾 Saving model to {model_path}...")
model.save(model_path)
print(f"   ✓ Model saved successfully!")

# Save class labels
labels_path = os.path.join(model_dir, 'class_labels.txt')
with open(labels_path, 'w') as f:
    for class_name in loader.classes:
        f.write(f"{class_name}\n")
print(f"   ✓ Class labels saved to {labels_path}")

print("\n" + "=" * 80)
print("🎉 SATELLITE VERIFICATION MODEL TRAINING COMPLETED!")
print("=" * 80)
print(f"📁 Model saved: {model_path}")
print(f"🏷️  Classes: {', '.join(loader.classes)}")
print("=" * 80)

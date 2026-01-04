"""
Training script for satellite image verification model.
Trains a CNN model to classify satellite imagery for crop verification.
"""

import os
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.metrics import Accuracy, Precision, Recall, CategoricalAccuracy
from tensorflow.keras import layers, callbacks
import logging
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from training.satellite_model.dataset_loader import SatelliteDatasetLoader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)


def create_satellite_cnn_model(input_shape: tuple = (256, 256, 3), num_classes: int = 4) -> keras.Model:
    """
    Create CNN model for satellite image classification.
    
    Args:
        input_shape: Input image shape
        num_classes: Number of output classes
        
    Returns:
        Compiled Keras model
    """
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=input_shape),
        
        # First convolutional block
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Second convolutional block
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Third convolutional block
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Fourth convolutional block
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Global average pooling instead of flatten
        layers.GlobalAveragePooling2D(),
        
        # Dense layers
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        
        # Output layer (multi-class classification)
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=[
            'accuracy',
            CategoricalAccuracy(name='cat_accuracy'),
            Precision(name='precision'),
            Recall(name='recall')
        ]
    )
    
    return model


def train_satellite_model(data_dir: str = None, epochs: int = 30, batch_size: int = 16):
    """
    Train the satellite image verification model.
    
    Args:
        data_dir: Directory containing training data (class subdirectories)
        epochs: Number of training epochs
        batch_size: Batch size for training
    """
    print("=" * 80)
    print("🛰️  STARTING SATELLITE IMAGE VERIFICATION MODEL TRAINING")
    print("=" * 80)
    logger.info("Starting satellite model training...")
    
    # Initialize dataset loader
    print("\n📦 Initializing satellite dataset loader...")
    loader = SatelliteDatasetLoader(image_size=(256, 256))
    
    # Load dataset
    print("\n📂 Loading satellite dataset...")
    images = []
    labels = []
    
    if data_dir and os.path.exists(data_dir):
        print(f"   Loading images from: {data_dir}")
        logger.info(f"Loading images from {data_dir}")
        
        for class_name in loader.classes:
            class_dir = os.path.join(data_dir, class_name)
            class_label = loader.class_to_label[class_name]
            
            if os.path.exists(class_dir):
                class_images, class_labels = loader.load_images_from_directory(class_dir, class_label)
                images.extend(class_images)
                labels.extend(class_labels)
                print(f"   ✓ Loaded {len(class_images)} {class_name} images")
            else:
                print(f"   ⚠ Directory {class_dir} not found, skipping...")
        
        if len(images) == 0:
            print("   ⚠ No images found, creating synthetic dataset...")
            logger.warning("No images found, creating synthetic dataset")
            images, labels = loader.create_synthetic_dataset(num_samples=2000)
    else:
        print("   ⚠ Data directory not found, creating synthetic dataset...")
        logger.warning("Data directory not found, creating synthetic dataset")
        images, labels = loader.create_synthetic_dataset(num_samples=2000)
    
    images = np.array(images)
    labels = np.array(labels)
    
    print(f"   ✓ Total dataset size: {len(images)} satellite images")
    
    # Print class distribution
    print("\n📊 Class Distribution:")
    for class_idx, class_name in enumerate(loader.classes):
        count = np.sum(labels == class_idx)
        percentage = (count / len(labels)) * 100
        print(f"   {class_name}: {count} samples ({percentage:.1f}%)")
    
    # Shuffle data
    print("\n🔀 Shuffling dataset...")
    indices = np.random.permutation(len(images))
    images = images[indices]
    labels = labels[indices]
    
    # Split dataset
    print("\n✂️  Splitting dataset...")
    X_train, y_train, X_val, y_val, X_test, y_test = loader.split_dataset(
        images, labels, train_ratio=0.7, val_ratio=0.15
    )
    
    print(f"   📊 Training set: {len(X_train)} samples")
    print(f"   📊 Validation set: {len(X_val)} samples")
    print(f"   📊 Test set: {len(X_test)} samples")
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Validation set: {len(X_val)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Create model
    print("\n🏗️  Creating Satellite CNN model architecture...")
    model = create_satellite_cnn_model(num_classes=len(loader.classes))
    print("\n📋 Model Architecture:")
    model.summary()
    
    # Define callbacks
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                            'models', 'satellite_verification')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'satellite_verifier.h5')
    print(f"\n💾 Model will be saved to: {model_path}")
    
    callbacks_list = [
        callbacks.ModelCheckpoint(
            model_path,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        callbacks.EarlyStopping(
            monitor='val_loss',
            patience=15,
            restore_best_weights=True,
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=8,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Train model
    print("\n" + "=" * 80)
    print("🎯 STARTING TRAINING")
    print("=" * 80)
    print(f"   Epochs: {epochs}")
    print(f"   Batch size: {batch_size}")
    print(f"   Training samples: {len(X_train)}")
    print(f"   Validation samples: {len(X_val)}")
    print(f"   Classes: {loader.classes}")
    print("=" * 80 + "\n")
    logger.info("Starting training...")
    
    history = model.fit(
        X_train, y_train,
        batch_size=batch_size,
        epochs=epochs,
        validation_data=(X_val, y_val),
        callbacks=callbacks_list,
        verbose=1
    )
    
    # Evaluate on test set
    print("\n" + "=" * 80)
    print("📊 EVALUATING ON TEST SET")
    print("=" * 80)
    logger.info("Evaluating on test set...")
    
    test_results = model.evaluate(X_test, y_test, verbose=1)
    test_loss = test_results[0]
    test_accuracy = test_results[1]
    test_cat_accuracy = test_results[2]
    test_precision = test_results[3]
    test_recall = test_results[4]
    
    print("\n" + "=" * 80)
    print("✅ FINAL TEST RESULTS")
    print("=" * 80)
    print(f"   Test Loss:           {test_loss:.4f}")
    print(f"   Test Accuracy:       {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print(f"   Test Cat Accuracy:   {test_cat_accuracy:.4f} ({test_cat_accuracy*100:.2f}%)")
    print(f"   Test Precision:      {test_precision:.4f} ({test_precision*100:.2f}%)")
    print(f"   Test Recall:         {test_recall:.4f} ({test_recall*100:.2f}%)")
    print("=" * 80)
    logger.info(f"Test Accuracy: {test_accuracy:.4f}")
    logger.info(f"Test Precision: {test_precision:.4f}")
    logger.info(f"Test Recall: {test_recall:.4f}")
    
    # Save final model
    print(f"\n💾 Saving model to {model_path}...")
    model.save(model_path)
    print(f"   ✓ Model saved successfully!")
    logger.info(f"Model saved to {model_path}")
    
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
    print("=" * 80 + "\n")
    
    return model, history


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train satellite image verification model')
    parser.add_argument('--data_dir', type=str, default=None,
                       help='Directory containing training images (class subdirectories)')
    parser.add_argument('--epochs', type=int, default=30,
                       help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=16,
                       help='Batch size for training')
    
    args = parser.parse_args()
    
    train_satellite_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size
    )

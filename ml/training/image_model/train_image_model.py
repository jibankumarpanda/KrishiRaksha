"""
Training script for image damage classification model.
Trains a CNN model to classify crop damage in images.
"""

import os
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.metrics import Accuracy, Precision, Recall
from tensorflow.keras import layers, callbacks
import logging
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from training.image_model.dataset_loader import ImageDatasetLoader

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)


def create_cnn_model(input_shape: tuple = (128,128, 3)) -> keras.Model:
    """
    Create CNN model for damage classification.
    
    Args:
        input_shape: Input image shape
        
    Returns:
        Compiled Keras model
    """
    model = keras.Sequential([
        # First convolutional block
        layers.Conv2D(16, (3, 3), activation='relu', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Second convolutional block
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Third convolutional block
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Fourth convolutional block
        layers.Conv2D(16, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D(2, 2),
        layers.Dropout(0.25),
        
        # Flatten and dense layers
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        
        # Output layer (binary classification)
        layers.Dense(1, activation='sigmoid')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=[
        Accuracy(name="accuracy"),
        Precision(name="precision"),
        Recall(name="recall")
    ]
    )
    
    return model


def train_model(data_dir: str = None, epochs: int = 15, batch_size: int = 8):
    """
    Train the image classification model.
    
    Args:
        data_dir: Directory containing training data (damaged/ and healthy/ subdirectories)
        epochs: Number of training epochs
        batch_size: Batch size for training
    """
    print("=" * 80)
    print("🚀 STARTING IMAGE DAMAGE CLASSIFICATION MODEL TRAINING")
    print("=" * 80)
    logger.info("Starting image model training...")
    
    # Initialize dataset loader
    print("\n📦 Initializing dataset loader...")
    loader = ImageDatasetLoader(image_size=(128, 128))
    
    # Load dataset
    print("\n📂 Loading dataset...")
    if data_dir and os.path.exists(data_dir):
        print(f"   Loading images from: {data_dir}")
        logger.info(f"Loading images from {data_dir}")
        
        damaged_dir = os.path.join(data_dir, 'damaged')
        healthy_dir = os.path.join(data_dir, 'healthy')
        
        # Load damaged images (label = 1)
        damaged_images, damaged_labels = loader.load_images_from_directory(damaged_dir, label=1)
        print(f"   ✓ Loaded {len(damaged_images)} damaged images")
        
        # Load healthy images (label = 0)
        healthy_images, healthy_labels = loader.load_images_from_directory(healthy_dir, label=0)
        print(f"   ✓ Loaded {len(healthy_images)} healthy images")
        
        # Combine datasets
        if len(damaged_images) > 0 and len(healthy_images) > 0:
            images = np.concatenate([damaged_images, healthy_images], axis=0)
            labels = np.concatenate([damaged_labels, healthy_labels], axis=0)
        elif len(damaged_images) > 0:
            images, labels = damaged_images, damaged_labels
        elif len(healthy_images) > 0:
            images, labels = healthy_images, healthy_labels
        else:
            print("   ⚠ No images found, creating synthetic dataset...")
            logger.warning("No images found, creating synthetic dataset")
            images, labels = loader.create_synthetic_dataset(num_samples=1000)
    else:
        print("   ⚠ Data directory not found, creating synthetic dataset...")
        logger.warning("Data directory not found, creating synthetic dataset")
        images, labels = loader.create_synthetic_dataset(num_samples=1000)
    
    print(f"   ✓ Total dataset size: {len(images)} images")
    
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
    
    print(f"   📊 Training set: {len(X_train)} samples ({len(X_train[y_train==1])} damaged, {len(X_train[y_train==0])} healthy)")
    print(f"   📊 Validation set: {len(X_val)} samples ({len(X_val[y_val==1])} damaged, {len(X_val[y_val==0])} healthy)")
    print(f"   📊 Test set: {len(X_test)} samples ({len(X_test[y_test==1])} damaged, {len(X_test[y_test==0])} healthy)")
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Validation set: {len(X_val)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Create model
    print("\n🏗️  Creating CNN model architecture...")
    model = create_cnn_model()
    print("\n📋 Model Architecture:")
    model.summary()
    
    # Define callbacks
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                            'models', 'image_verification')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'damage_classifier.h5')
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
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
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
    test_loss, test_accuracy, test_precision, test_recall = model.evaluate(
        X_test, y_test, verbose=1
    )
    
    print("\n" + "=" * 80)
    print("✅ FINAL TEST RESULTS")
    print("=" * 80)
    print(f"   Test Loss:      {test_loss:.4f}")
    print(f"   Test Accuracy:  {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print(f"   Test Precision: {test_precision:.4f} ({test_precision*100:.2f}%)")
    print(f"   Test Recall:    {test_recall:.4f} ({test_recall*100:.2f}%)")
    print("=" * 80)
    logger.info(f"Test Accuracy: {test_accuracy:.4f}")
    logger.info(f"Test Precision: {test_precision:.4f}")
    logger.info(f"Test Recall: {test_recall:.4f}")
    
    # Save final model
    print(f"\n💾 Saving model to {model_path}...")
    model.save(model_path)
    print(f"   ✓ Model saved successfully!")
    logger.info(f"Model saved to {model_path}")
    
    print("\n" + "=" * 80)
    print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 80 + "\n")
    
    return model, history


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train image damage classification model')
    parser.add_argument('--data_dir', type=str, default=None,
                       help='Directory containing training images (damaged/ and healthy/ subdirectories)')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32,
                       help='Batch size for training')
    
    args = parser.parse_args()
    
    train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
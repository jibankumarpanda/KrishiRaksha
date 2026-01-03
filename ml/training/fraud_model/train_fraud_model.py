"""
Training script for fraud detection model.
Trains IsolationForest model to detect fraudulent insurance claims.
"""

import os
import sys
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import logging
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from training.fraud_model.anomaly_features import AnomalyFeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set random seed
np.random.seed(42)


def train_model(data_file: str = None, contamination: float = 0.1, num_samples: int = 1000):
    """
    Train the fraud detection model.
    
    Args:
        data_file: Path to CSV file with training data
        contamination: Expected proportion of anomalies (0-1)
        num_samples: Number of synthetic samples if no data file provided
    """
    print("=" * 80)
    print("🚀 STARTING FRAUD DETECTION MODEL TRAINING")
    print("=" * 80)
    logger.info("Starting fraud detection model training...")
    
    # Initialize feature engineer
    print("\n📦 Initializing feature engineer...")
    feature_engineer = AnomalyFeatureEngineer()
    
    # Load or create dataset
    print("\n📂 Loading dataset...")
    if data_file and os.path.exists(data_file):
        print(f"   Loading data from: {data_file}")
        logger.info(f"Loading data from {data_file}")
        df = pd.read_csv(data_file)
    else:
        print(f"   ⚠ Data file not found, creating synthetic dataset with {num_samples} samples...")
        logger.warning("Data file not found, creating synthetic dataset")
        df = feature_engineer.create_synthetic_dataset(
            num_samples=num_samples,
            fraud_ratio=contamination
        )
    
    print(f"   ✓ Dataset size: {len(df)} samples")
    logger.info(f"Dataset size: {len(df)} samples")
    
    # Create features
    print("\n🔧 Creating features...")
    X = []
    y = []
    
    for _, row in df.iterrows():
        features = feature_engineer.create_features(row)
        X.append(features)
        y.append(row.get('is_fraud', 0))  # 0 = normal, 1 = fraud
    
    X = np.array(X)
    y = np.array(y)
    
    fraud_count = np.sum(y)
    fraud_percentage = (fraud_count / len(y)) * 100
    print(f"   ✓ Feature shape: {X.shape}")
    print(f"   ✓ Fraud cases: {fraud_count} ({fraud_percentage:.1f}%)")
    print(f"   ✓ Normal cases: {len(y) - fraud_count} ({100 - fraud_percentage:.1f}%)")
    logger.info(f"Feature shape: {X.shape}")
    logger.info(f"Fraud cases: {fraud_count} ({fraud_percentage:.1f}%)")
    
    # Split dataset
    print("\n✂️  Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
    )
    
    print(f"   📊 Training set: {len(X_train)} samples ({np.sum(y_train)} fraud, {len(y_train) - np.sum(y_train)} normal)")
    print(f"   📊 Validation set: {len(X_val)} samples ({np.sum(y_val)} fraud, {len(y_val) - np.sum(y_val)} normal)")
    print(f"   📊 Test set: {len(X_test)} samples ({np.sum(y_test)} fraud, {len(y_test) - np.sum(y_test)} normal)")
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Validation set: {len(X_val)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Scale features
    print("\n📏 Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    print("   ✓ Features scaled")
    
    # Create and train IsolationForest model
    print("\n" + "=" * 80)
    print("🎯 STARTING MODEL TRAINING")
    print("=" * 80)
    print("   Model: IsolationForest")
    print(f"   Contamination: {contamination} ({contamination*100:.1f}%)")
    print("   Parameters:")
    print("     - n_estimators: 200")
    print("     - max_samples: auto")
    logger.info("Training IsolationForest model...")
    model = IsolationForest(
        contamination=contamination,
        n_estimators=200,
        max_samples='auto',
        random_state=42,
        n_jobs=-1
    )
    
    # Train on training set (IsolationForest is unsupervised, but we use labels for evaluation)
    print("\n   Training in progress...")
    model.fit(X_train_scaled)
    print("   ✓ Training completed")
    
    # Evaluate model
    print("\n" + "=" * 80)
    print("📊 EVALUATING MODEL")
    print("=" * 80)
    logger.info("Evaluating model...")
    
    # Predictions (IsolationForest: -1 = anomaly/fraud, 1 = normal)
    y_train_pred = model.predict(X_train_scaled)
    y_train_pred_binary = (y_train_pred == -1).astype(int)
    
    y_val_pred = model.predict(X_val_scaled)
    y_val_pred_binary = (y_val_pred == -1).astype(int)
    
    y_test_pred = model.predict(X_test_scaled)
    y_test_pred_binary = (y_test_pred == -1).astype(int)
    
    # Training set metrics
    print("\n   Training Set Metrics:")
    print(classification_report(y_train, y_train_pred_binary, target_names=['Normal', 'Fraud']))
    cm_train = confusion_matrix(y_train, y_train_pred_binary)
    print(f"   Confusion Matrix:\n{cm_train}")
    logger.info("\nTraining Set Metrics:")
    logger.info(classification_report(y_train, y_train_pred_binary, target_names=['Normal', 'Fraud']))
    logger.info(f"Confusion Matrix:\n{cm_train}")
    
    # Validation set metrics
    print("\n   Validation Set Metrics:")
    print(classification_report(y_val, y_val_pred_binary, target_names=['Normal', 'Fraud']))
    cm_val = confusion_matrix(y_val, y_val_pred_binary)
    print(f"   Confusion Matrix:\n{cm_val}")
    logger.info("\nValidation Set Metrics:")
    logger.info(classification_report(y_val, y_val_pred_binary, target_names=['Normal', 'Fraud']))
    logger.info(f"Confusion Matrix:\n{cm_val}")
    
    # Test set metrics
    print("\n   Test Set Metrics:")
    print(classification_report(y_test, y_test_pred_binary, target_names=['Normal', 'Fraud']))
    cm_test = confusion_matrix(y_test, y_test_pred_binary)
    print(f"   Confusion Matrix:\n{cm_test}")
    logger.info("\nTest Set Metrics:")
    logger.info(classification_report(y_test, y_test_pred_binary, target_names=['Normal', 'Fraud']))
    logger.info(f"Confusion Matrix:\n{cm_test}")
    
    # Save model and scaler
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                             'models', 'fraud_detection')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'fraud_model.pkl')
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    
    print("\n💾 Saving model and scaler...")
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"   ✓ Model saved to: {model_path}")
    logger.info(f"Model saved to {model_path}")
    
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"   ✓ Scaler saved to: {scaler_path}")
    logger.info(f"Scaler saved to {scaler_path}")
    
    print("\n" + "=" * 80)
    print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 80 + "\n")
    
    return model, scaler


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train fraud detection model')
    parser.add_argument('--data_file', type=str, default=None,
                       help='Path to CSV file with training data')
    parser.add_argument('--contamination', type=float, default=0.1,
                       help='Expected proportion of anomalies (0-1)')
    parser.add_argument('--num_samples', type=int, default=1000,
                       help='Number of synthetic samples if no data file')
    
    args = parser.parse_args()
    
    train_model(
        data_file=args.data_file,
        contamination=args.contamination,
        num_samples=args.num_samples
    )
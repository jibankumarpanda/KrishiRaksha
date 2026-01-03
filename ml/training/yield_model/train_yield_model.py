"""
Training script for yield prediction model.
Trains RandomForest or XGBoost model to predict crop yield.
"""

import os
import sys
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import logging
from pathlib import Path

# Try to import XGBoost
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# Add parent directories to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from training.yield_model.feature_engineering import FeatureEngineer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set random seed
np.random.seed(42)


def train_model(data_file: str = None, use_xgboost: bool = True, num_samples: int = 1000):
    """
    Train the yield prediction model.
    
    Args:
        data_file: Path to CSV file with training data
        use_xgboost: Whether to use XGBoost (True) or RandomForest (False)
        num_samples: Number of synthetic samples if no data file provided
    """
    print("=" * 80)
    print("🚀 STARTING YIELD PREDICTION MODEL TRAINING")
    print("=" * 80)
    logger.info("Starting yield prediction model training...")
    
    # Initialize feature engineer
    print("\n📦 Initializing feature engineer...")
    feature_engineer = FeatureEngineer()
    
    # Load or create dataset
    print("\n📂 Loading dataset...")
    if data_file and os.path.exists(data_file):
        print(f"   Loading data from: {data_file}")
        logger.info(f"Loading data from {data_file}")
        df = pd.read_csv(data_file)
    else:
        print(f"   ⚠ Data file not found, creating synthetic dataset with {num_samples} samples...")
        logger.warning("Data file not found, creating synthetic dataset")
        df = feature_engineer.create_synthetic_dataset(num_samples=num_samples)
    
    print(f"   ✓ Dataset size: {len(df)} samples")
    logger.info(f"Dataset size: {len(df)} samples")
    
    # Create features
    print("\n🔧 Creating features...")
    X = []
    y = []
    
    for _, row in df.iterrows():
        features = feature_engineer.create_features(row)
        X.append(features)
        y.append(row['yield'])
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"   ✓ Feature shape: {X.shape}")
    print(f"   ✓ Target shape: {y.shape}")
    print(f"   ✓ Yield range: {y.min():.2f} - {y.max():.2f} quintals")
    logger.info(f"Feature shape: {X.shape}")
    logger.info(f"Target shape: {y.shape}")
    
    # Split dataset
    print("\n✂️  Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42
    )
    
    print(f"   📊 Training set: {len(X_train)} samples")
    print(f"   📊 Validation set: {len(X_val)} samples")
    print(f"   📊 Test set: {len(X_test)} samples")
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
    
    # Create and train model
    print("\n" + "=" * 80)
    print("🎯 STARTING MODEL TRAINING")
    print("=" * 80)
    if use_xgboost and XGBOOST_AVAILABLE:
        print("   Model: XGBoost Regressor")
        print("   Parameters:")
        print("     - n_estimators: 200")
        print("     - max_depth: 8")
        print("     - learning_rate: 0.1")
        logger.info("Training XGBoost model...")
        model = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
        
        print("\n   Training in progress...")
        model.fit(
            X_train_scaled, y_train,
            eval_set=[(X_val_scaled, y_val)],
            early_stopping_rounds=20,
            verbose=True
        )
    else:
        model_name = "RandomForest" if not XGBOOST_AVAILABLE else "RandomForest (XGBoost not available)"
        print(f"   Model: {model_name} Regressor")
        print("   Parameters:")
        print("     - n_estimators: 200")
        print("     - max_depth: 15")
        logger.info("Training RandomForest model...")
        model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        print("\n   Training in progress...")
        model.fit(X_train_scaled, y_train)
        print("   ✓ Training completed")
    
    # Evaluate model
    print("\n" + "=" * 80)
    print("📊 EVALUATING MODEL")
    print("=" * 80)
    logger.info("Evaluating model...")
    
    # Training set
    print("\n   Training Set:")
    y_train_pred = model.predict(X_train_scaled)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    print(f"     RMSE: {train_rmse:.2f} quintals")
    print(f"     MAE:  {train_mae:.2f} quintals")
    print(f"     R²:   {train_r2:.4f}")
    logger.info(f"Training - RMSE: {train_rmse:.2f}, MAE: {train_mae:.2f}, R²: {train_r2:.4f}")
    
    # Validation set
    print("\n   Validation Set:")
    y_val_pred = model.predict(X_val_scaled)
    val_rmse = np.sqrt(mean_squared_error(y_val, y_val_pred))
    val_mae = mean_absolute_error(y_val, y_val_pred)
    val_r2 = r2_score(y_val, y_val_pred)
    print(f"     RMSE: {val_rmse:.2f} quintals")
    print(f"     MAE:  {val_mae:.2f} quintals")
    print(f"     R²:   {val_r2:.4f}")
    logger.info(f"Validation - RMSE: {val_rmse:.2f}, MAE: {val_mae:.2f}, R²: {val_r2:.4f}")
    
    # Test set
    print("\n   Test Set:")
    y_test_pred = model.predict(X_test_scaled)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    print(f"     RMSE: {test_rmse:.2f} quintals")
    print(f"     MAE:  {test_mae:.2f} quintals")
    print(f"     R²:   {test_r2:.4f}")
    logger.info(f"Test - RMSE: {test_rmse:.2f}, MAE: {test_mae:.2f}, R²: {test_r2:.4f}")
    
    # Save model and scaler
    model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                             'models', 'yield_prediction')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'yield_model.pkl')
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
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        print("\n" + "=" * 80)
        print("📈 FEATURE IMPORTANCES")
        print("=" * 80)
        importances = model.feature_importances_
        feature_names = [
            'crop_type', 'land_size', 'days_since_sowing', 'soil_type',
            'irrigation_type', 'fertilizer', 'temperature', 'rainfall',
            'humidity', 'wind_speed', 'sunshine_hours', 'kharif', 'rabi'
        ]
        
        print("\n   Top features:")
        sorted_features = sorted(zip(feature_names, importances), 
                                key=lambda x: x[1], reverse=True)
        for i, (name, importance) in enumerate(sorted_features, 1):
            bar = "█" * int(importance * 50)
            print(f"   {i:2d}. {name:20s} {importance:.4f} {bar}")
        
        logger.info("\nFeature Importances:")
        for name, importance in sorted_features:
            logger.info(f"  {name}: {importance:.4f}")
    
    print("\n" + "=" * 80)
    print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 80 + "\n")
    
    return model, scaler


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train yield prediction model')
    parser.add_argument('--data_file', type=str, default=None,
                       help='Path to CSV file with training data')
    parser.add_argument('--use_xgboost', action='store_true', default=True,
                       help='Use XGBoost (default) or RandomForest')
    parser.add_argument('--num_samples', type=int, default=1000,
                       help='Number of synthetic samples if no data file')
    
    args = parser.parse_args()
    
    train_model(
        data_file=args.data_file,
        use_xgboost=args.use_xgboost,
        num_samples=args.num_samples
    )
"""
Test script for satellite verification inference.
Creates test images and runs predictions.
"""
import os
import sys
import numpy as np
import cv2
from pathlib import Path

# Add parent directories to path
sys.path.append(str(Path(__file__).parent))

from inference.satellite_verification import SatelliteVerifier

print("=" * 80)
print("🛰️  TESTING SATELLITE VERIFICATION INFERENCE")
print("=" * 80)

# Initialize verifier
print("\n📦 Initializing SatelliteVerifier...")
verifier = SatelliteVerifier()

# Load model
model_path = os.path.join(os.path.dirname(__file__), 
                          'models', 'satellite_verification', 'satellite_verifier.h5')

if not os.path.exists(model_path):
    print(f"❌ Model not found at {model_path}")
    print("Please train the model first!")
    sys.exit(1)

print(f"📂 Loading model from: {model_path}")
verifier.load_model(model_path)
print("✅ Model loaded successfully!")

# Create test directory
test_dir = os.path.join(os.path.dirname(__file__), 'test_images')
os.makedirs(test_dir, exist_ok=True)

print(f"\n🖼️  Creating test satellite images in: {test_dir}")

# Create synthetic test images for each class
test_images = {}

# 1. Healthy crop image (green)
print("   Creating healthy crop image...")
healthy_img = np.random.rand(256, 256, 3) * 0.3
healthy_img[:, :, 1] = np.minimum(healthy_img[:, :, 1] + 0.5, 1.0)  # Boost green
healthy_img[:, :, 0] *= 0.6  # Reduce red
healthy_img[:, :, 2] *= 0.6  # Reduce blue
healthy_img = (healthy_img * 255).astype(np.uint8)
healthy_path = os.path.join(test_dir, 'healthy_crop.jpg')
cv2.imwrite(healthy_path, cv2.cvtColor(healthy_img, cv2.COLOR_RGB2BGR))
test_images['healthy'] = healthy_path

# 2. Damaged crop image (brown/yellow)
print("   Creating damaged crop image...")
damaged_img = np.random.rand(256, 256, 3) * 0.4
damaged_img[:, :, 0] = np.minimum(damaged_img[:, :, 0] + 0.4, 1.0)  # Boost red
damaged_img[:, :, 1] = np.minimum(damaged_img[:, :, 1] + 0.3, 1.0)  # Some yellow
damaged_img[:, :, 2] *= 0.5  # Reduce blue
damaged_img = (damaged_img * 255).astype(np.uint8)
damaged_path = os.path.join(test_dir, 'damaged_crop.jpg')
cv2.imwrite(damaged_path, cv2.cvtColor(damaged_img, cv2.COLOR_RGB2BGR))
test_images['damaged'] = damaged_path

# 3. Cloud cover image (white/gray)
print("   Creating cloud cover image...")
cloud_img = np.random.rand(256, 256, 3) * 0.2 + 0.7  # Light gray/white
cloud_img = (cloud_img * 255).astype(np.uint8)
cloud_path = os.path.join(test_dir, 'cloud_cover.jpg')
cv2.imwrite(cloud_path, cv2.cvtColor(cloud_img, cv2.COLOR_RGB2BGR))
test_images['cloud_cover'] = cloud_path

# 4. No crop image (brown soil)
print("   Creating no crop image...")
no_crop_img = np.random.rand(256, 256, 3) * 0.3
no_crop_img[:, :, 0] = np.minimum(no_crop_img[:, :, 0] + 0.3, 1.0)  # Brownish
no_crop_img[:, :, 1] *= 0.7
no_crop_img[:, :, 2] *= 0.5
no_crop_img = (no_crop_img * 255).astype(np.uint8)
no_crop_path = os.path.join(test_dir, 'no_crop.jpg')
cv2.imwrite(no_crop_path, cv2.cvtColor(no_crop_img, cv2.COLOR_RGB2BGR))
test_images['no_crop'] = no_crop_path

print(f"✅ Created {len(test_images)} test images")

# Run predictions on all test images
print("\n" + "=" * 80)
print("🔍 RUNNING PREDICTIONS")
print("=" * 80)

for expected_class, image_path in test_images.items():
    print(f"\n📸 Testing: {os.path.basename(image_path)}")
    print(f"   Expected class: {expected_class}")
    
    # Run verification
    result = verifier.verify_crop_health(image_path, confidence_threshold=0.5)
    
    if result['status'] == 'success':
        print(f"   ✅ Predicted class: {result['predicted_class']}")
        print(f"   📊 Confidence: {result['confidence']:.2%}")
        print(f"   🔍 Verification status: {result['verification_status']}")
        print(f"   💡 Recommendation: {result['recommendation']}")
        
        # Show all class probabilities
        print(f"   📈 Class probabilities:")
        for cls, prob in result['class_probabilities'].items():
            bar = "█" * int(prob * 20)
            print(f"      {cls:15s}: {prob:.2%} {bar}")
        
        # Check if prediction matches expected
        if result['predicted_class'] == expected_class:
            print(f"   ✅ CORRECT PREDICTION!")
        else:
            print(f"   ⚠️  Prediction differs from expected")
    else:
        print(f"   ❌ Error: {result.get('error', 'Unknown error')}")

print("\n" + "=" * 80)
print("🎉 SATELLITE VERIFICATION TEST COMPLETED!")
print("=" * 80)
print(f"📁 Test images saved in: {test_dir}")
print(f"📁 Model location: {model_path}")
print("=" * 80)

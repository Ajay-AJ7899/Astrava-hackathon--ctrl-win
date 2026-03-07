import os
from PIL import Image
from ai_engine import analyze_xray, analyze_ct, analyze_mri, analyze_severity_medsiglip

# A simple benchmarking script to test the accuracy of the MedScan AI pipeline
# Provide a folder structure like:
# dataset/
#   xray/
#     pneumonia/
#       patient1.jpg
#       patient2.jpg
#     normal/
#       patient3.jpg

def benchmark_xray(data_dir: str):
    """
    Benchmarks the X-Ray model accuracy on a local dataset.
    Expects two subfolders in data_dir: 'pneumonia' and 'normal'.
    """
    print(f"\n--- Benchmarking X-Ray (Pneumonia Detection) ---")
    correct = 0
    total = 0
    
    # Test Pneumonia (Expected Output: High Score > 0.5)
    pneumonia_dir = os.path.join(data_dir, "pneumonia")
    if os.path.exists(pneumonia_dir):
        for file in os.listdir(pneumonia_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                total += 1
                filepath = os.path.join(pneumonia_dir, file)
                score = analyze_xray(filepath)
                if score >= 0.5:
                    correct += 1
                print(f"PNEUMONIA - {file}: {score:.2f} confidence -> {'Pass' if score >= 0.5 else 'Fail'}")

    # Test Normal (Expected Output: Low Score < 0.5)
    normal_dir = os.path.join(data_dir, "normal")
    if os.path.exists(normal_dir):
        for file in os.listdir(normal_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                total += 1
                filepath = os.path.join(normal_dir, file)
                score = analyze_xray(filepath)
                if score < 0.5:
                    correct += 1
                print(f"NORMAL - {file}: {score:.2f} confidence -> {'Pass' if score < 0.5 else 'Fail'}")

    if total > 0:
        accuracy = (correct / total) * 100
        print(f"X-Ray Accuracy: {correct}/{total} ({accuracy:.2f}%)")
    else:
        print("No test data found. Please add images to dataset/xray/pneumonia and dataset/xray/normal")

def evaluate_severity(filepath: str):
    """Prints the raw MedSigLIP severity score for manual inspection."""
    res = analyze_severity_medsiglip(filepath)
    print(f"  MedSigLIP Severity: {res['severity_score']}/10 -> {res['critical_keywords'][0]}")

if __name__ == "__main__":
    print("MedScan AI Local Validation Suite")
    
    # Ensure test directories exist
    os.makedirs("dataset/xray/pneumonia", exist_ok=True)
    os.makedirs("dataset/xray/normal", exist_ok=True)
    
    benchmark_xray("dataset/xray")
    
    print("\nNote: To benchmark CT and MRI, you can extend this script following the blueprint above!")

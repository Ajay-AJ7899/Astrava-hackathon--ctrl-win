from transformers import pipeline, AutoProcessor, AutoModel
from PIL import Image
import os
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"

# 1. Load the pre-trained Medical Image Model (Downloads automatically the first time)
print("Loading X-Ray Model...")
image_classifier = pipeline("image-classification", model="nickmuchi/vit-finetuned-chest-xray-pneumonia", device=0 if device == "cuda" else -1)

# 2. Load the Swin Transformer model fine-tuned for lung cancer CT scans
print("Loading Swin CT Model (lung cancer classifier)...")
ct_classifier = pipeline("image-classification", model="oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans", device=0 if device == "cuda" else -1)

# 3. Load the ViT model fine-tuned for Brain MRI tumor classification
print("Loading MRI Brain Tumor Model...")
mri_classifier = pipeline("image-classification", model="DunnBC22/vit-base-patch16-224-in21k_brain_tumor_diagnosis", device=0 if device == "cuda" else -1)

# 4. Load MedSigLIP for image-based severity scoring
print("Loading MedSigLIP severity model (google/medsiglip-448)...")
medsiglip_processor = AutoProcessor.from_pretrained("google/medsiglip-448")
medsiglip_model = AutoModel.from_pretrained("google/medsiglip-448").to(device)
medsiglip_model.eval()

# Severity scale prompts: index 0-9 = healthy → critical
# Severity scale prompts: index 0-9 = healthy → critical
XRAY_PROMPTS = [
    "no findings, normal chest radiograph, healthy lungs",                        # 0
    "minimal atelectasis, trace pleural effusion, no acute disease",               # 1
    "mild cardiomegaly, mild interstitial markings, minor abnormality",            # 2
    "patchy opacity, mild consolidation, early pneumonia",                         # 3
    "lobar consolidation, moderate pleural effusion, pulmonary edema",             # 4
    "bilateral infiltrates, multifocal pneumonia, significant lung disease",       # 5
    "large pleural effusion, severe consolidation, diffuse opacities",             # 6
    "severe pulmonary edema, respiratory failure, extensive bilateral disease",    # 7
    "tension pneumothorax, massive hemorrhage, critical lung collapse",            # 8
    "acute respiratory distress syndrome, complete lung whiteout, imminent death", # 9
]

CT_PROMPTS = [
    "normal lung parenchyma, no nodules, healthy scan",                            # 0
    "tiny benign calcification, subcentimeter pulmonary nodule",                   # 1
    "small non-solid nodule, mild ground glass opacity",                           # 2
    "growing solid pulmonary nodule, suspicious morphology",                       # 3
    "spiculated lung mass, high suspicion for malignancy",                         # 4
    "large malignant lung mass with pleural tagging",                              # 5
    "advanced lung carcinoma with hilar lymphadenopathy",                          # 6
    "large invasive lung cancer with mediastinal invasion",                        # 7
    "metastatic lung cancer with multiple pulmonary lesions",                      # 8
    "widespread aggressive lung metastasis, late stage critical disease",          # 9
]

MRI_PROMPTS = [
    "normal brain mri, healthy tissue, no acute abnormality",                      # 0
    "minimal age-related white matter changes, no mass",                           # 1
    "small benign lesion, tiny meningioma, causing no mass effect",                # 2
    "small low-grade glioma, suspicious for tumor",                                # 3
    "moderate brain tumor, low-grade glioma with mild edema",                      # 4
    "significant brain mass, meningioma with surrounding edema",                   # 5
    "large brain tumor causing mass effect, suspicious for glioblastoma",          # 6
    "aggressive high-grade glioma, significant midline shift",                     # 7
    "massive malignant brain tumor, severe intracranial pressure",                 # 8
    "critical glioblastoma multiforme, catastrophic herniation, life threatening", # 9
]

# Temperature for sharpening predictions — lower = more decisive (try 0.2–0.5)
MEDSIGLIP_TEMPERATURE = 0.3


def analyze_xray(image_path: str):
    """Takes an image path and returns the anomaly score (0.0 to 1.0)"""
    img = Image.open(image_path).convert("RGB")
    results = image_classifier(img)
    for res in results:
        if res['label'] == 'PNEUMONIA':
            return res['score']
    return 0.0

def analyze_ct(image_path: str) -> float:
    """Takes a CT scan image and returns cancer anomaly score (0.0 to 1.0).
    
    Uses oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans.
    Labels: cancer-positive (label contains 'Y') or cancer-negative (label contains 'X').
    """
    img = Image.open(image_path).convert("RGB")
    results = ct_classifier(img)
    
    # results = [{'label': 'LABEL_1 (Y - cancer)', 'score': 0.89}, ...]
    for item in results:
        label = item['label'].upper()
        if 'Y' in label or 'LABEL_1' in label or 'POSITIVE' in label or 'CANCER' in label:
            return round(item['score'], 4)
    
    return round(results[0]['score'], 4)

def analyze_mri(image_path: str) -> float:
    """Takes a Brain MRI image and returns tumor anomaly score (0.0 to 1.0).
    
    Uses DunnBC22/vit-base-patch16-224-in21k_brain_tumor_diagnosis.
    Labels: glioma, meningioma, pituitary, notumor
    Returns sum of all tumor class scores (excludes 'notumor' and 'normal').
    """
    img = Image.open(image_path).convert("RGB")
    results = mri_classifier(img)
    print(f"MRI Raw Results: {results}")

    anomaly_score = 0.0
    for res in results:
        label = str(res['label']).lower()
        if "notumor" not in label and "normal" not in label:
            anomaly_score += res['score']

    return round(anomaly_score, 4)

def analyze_severity_medsiglip(image_path: str, scan_type: str = "xray") -> dict:
    """Uses MedSigLIP (google/medsiglip-448) to score medical image severity.
    
    Uses clinical prompts + temperature sharpening to spread scores across 1–10.
    """
    img = Image.open(image_path).convert("RGB").resize((448, 448))

    # Select the right vocabulary for the body part
    if scan_type.lower() == "ct":
        prompts = CT_PROMPTS
    elif scan_type.lower() == "mri":
        prompts = MRI_PROMPTS
    else:
        prompts = XRAY_PROMPTS

    inputs = medsiglip_processor(
        text=prompts,
        images=[img],
        padding="max_length",
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = medsiglip_model(**inputs)

    logits = outputs.logits_per_image[0]  # shape [10]

    # Apply temperature sharpening — makes confident predictions more extreme
    sharpened = logits / MEDSIGLIP_TEMPERATURE
    probs = torch.softmax(sharpened, dim=0)  # shape [10]

    # Primary: argmax (most likely severity level)
    top_idx = int(probs.argmax())
    # Secondary: weighted mean for a smoother score
    weighted = sum(i * probs[i].item() for i in range(10))

    # Blend both: 70% argmax, 30% weighted mean
    blended = 0.7 * top_idx + 0.3 * weighted
    severity_score = min(max(round(blended) + 1, 1), 10)  # 1–10 scale

    top_label = prompts[top_idx]
    keywords = [top_label]
    if severity_score >= 7:
        keywords.insert(0, "⚠️ HIGH SEVERITY — Immediate review required")

    print(f"MedSigLIP probs: {[round(p.item(), 3) for p in probs]}")
    print(f"Top idx: {top_idx}, weighted: {weighted:.2f}, severity: {severity_score}")

    return {"severity_score": severity_score, "critical_keywords": keywords}



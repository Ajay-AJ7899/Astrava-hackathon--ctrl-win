# MEDSCAN AI — API Reference

## Base URL

```
http://localhost:8000
```

> The backend must be running locally with `venv\Scripts\uvicorn main:app --reload`

---

## Endpoints

### `POST /api/pneumonia-xray`

Runs AI triage analysis on a patient's chest X-ray using a ViT model fine-tuned for pneumonia detection.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `patient_name` | `string` | ✅ | Full name of the patient |
| `lab_notes` | `string` | ✅ | Clinical notes, lab results, symptoms |
| `xray_file` | `file` | ✅ | X-ray image (JPEG or PNG) |

**Example (JavaScript fetch)**

```js
const formData = new FormData();
formData.append("patient_name", "John Doe");
formData.append("lab_notes", "O2 sat 88%, severe chest pain, high WBC.");
formData.append("xray_file", fileInput.files[0]);

const response = await fetch("http://localhost:8000/api/pneumonia-xray", {
  method: "POST",
  body: formData
});

const data = await response.json();
```

**Response** — `application/json`

```json
{
  "patient": "John Doe",
  "image_anomaly_confidence": 85.32,
  "lab_severity": 8,
  "critical_flags": ["O2 88%", "severe chest pain", "high WBC"],
  "final_priority_score": 0.832,
  "status": "Ready for Radiologist"
}
```

| Field | Type | Description |
|---|---|---|
| `patient` | `string` | Patient name echoed back |
| `image_anomaly_confidence` | `float` | Pneumonia/anomaly confidence (0–100%) |
| `lab_severity` | `int` | Severity from 0–10 (10 = critical) |
| `critical_flags` | `string[]` | Key clinical red flags identified |
| `final_priority_score` | `float` | Combined priority (0.0–1.0) |
| `status` | `string` | Triage status string |

**Priority Formula**
```
final_priority = (0.6 × image_score) + (0.4 × lab_severity / 10)
```

---

## CORS

All origins are allowed (`*`). No special headers needed from the frontend.

---

## Local Dependencies

| Service | Port | How to start |
|---|---|---|
| FastAPI backend | `8000` | `venv\Scripts\uvicorn main:app --reload` |
| Ollama (LLM) | `11434` | `ollama serve` *(must run alongside FastAPI)* |

> **Note:** Ollama with `llama3.2` handles the lab note analysis locally — no external API keys required.

---

### `POST /api/ct-scan`

Runs lung cancer detection on a CT scan image using the Swin Transformer model.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `patient_name` | `string` | ✅ | Full name of the patient |
| `lab_notes` | `string` | ✅ | Clinical notes or symptoms |
| `ct_file` | `file` | ✅ | CT scan image (JPEG or PNG) |

**Response** — `application/json`

```json
{
  "patient": "John Doe",
  "scan_type": "CT",
  "image_anomaly_confidence": 71.5,
  "lab_severity": 7,
  "critical_flags": ["lesion detected", "O2 88%"],
  "final_priority_score": 0.709,
  "status": "Ready for Radiologist"
}
```

> Uses [`oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans`](https://huggingface.co/oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans) — a Swin Transformer fine-tuned on ~11,000 National Lung Screening Trial CT scans. Returns the cancer-positive confidence score. Test accuracy: **88.5%**.

---

### `POST /api/brain-mri`

Runs brain tumor classification on an MRI scan image.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `patient_name` | `string` | ✅ | Full name of the patient |
| `lab_notes` | `string` | ✅ | Clinical notes or symptoms |
| `mri_file` | `file` | ✅ | Brain MRI image (JPEG or PNG) |

**Response** — `application/json`

```json
{
  "patient": "John Doe",
  "scan_type": "Brain MRI",
  "image_anomaly_confidence": 91.2,
  "lab_severity": 8,
  "critical_flags": ["seizures", "headache", "vision loss"],
  "final_priority_score": 0.867,
  "status": "Ready for Radiologist"
}
```

> Uses [`DunnBC22/vit-base-patch16-224-in21k_brain_tumor_diagnosis`](https://huggingface.co/DunnBC22/vit-base-patch16-224-in21k_brain_tumor_diagnosis) — ViT fine-tuned for brain tumor classification. Labels: `glioma`, `meningioma`, `pituitary`, `notumor`. Returns the sum of all tumor class confidence scores.

---

### `GET /api/metrics`

Returns real-time usage telemetry, performance metrics, and a log of recent requests. Used by the `admin.html` dashboard.

**Response** — `application/json`

```json
{
  "total_requests": 42,
  "server_start": "2026-03-07T02:30:15.123",
  "endpoints": [
    {
      "endpoint": "/api/pneumonia-xray",
      "requests": 25,
      "errors": 0,
      "avg_ms": 1245.2,
      "success_rate": 100.0
    }
  ],
  "recent": [
    {
      "time": "02:35:10",
      "endpoint": "/api/ct-scan",
      "status": "success",
      "ms": 1850.5
    }
  ]
}
```

> **Admin Dashboard:** Open `admin.html` in your browser to view a live, auto-refreshing dashboard of these metrics including charts and live logs.

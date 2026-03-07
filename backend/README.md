# MedScan AI

MedScan AI is a powerful medical imaging analysis platform that leverages visual language models (VLMs) and advanced AI pipelines to triage and analyze patient scans (X-Ray, CT, and MRI). It features a robust FastAPI backend for AI processing and a beautiful, real-time frontend dashboard for interacting with the system and monitoring metrics.

## Features
- **AI-Powered Diagnostics**: Automatically analyze X-rays, CT scans, and MRIs using State-of-the-Art models (ViT, Swin, MedSigLIP).
- **Severity Scoring**: Generate critical flags, lab severity scores, and prioritize patients directly from medical imagery and lab notes.
- **REST API**: Fully-featured backend designed with FastAPI.
- **Real-Time Telemetry Dashboard**: Monitor API metrics, endpoint health, and live MongoDB connections via a dynamic frontend visualization.

## Architecture & AI Models
MedScan AI uses the `transformers` library to run several State-of-the-Art visual language models (VLMs). These models are **automatically downloaded** from HuggingFace to your computer the first time you run the backend server. No manual model installation is required!

The engine utilizes:
- **X-Ray Pneumonia Detection**: `nickmuchi/vit-finetuned-chest-xray-pneumonia` (ViT fine-tuned)
- **CT Scan Lung Cancer**: `oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans` (Swin Transformer)
- **Brain MRI Tumor**: `DunnBC22/vit-base-patch16-224-in21k_brain_tumor_diagnosis` (ViT Base)
- **Severity Scoring**: `google/medsiglip-448` (MedSigLIP by Google)

*Note: Depending on your internet speed, the first boot may take several minutes as these model weights (several gigabytes) are downloaded into your local HuggingFace cache.*

## Prerequisites

Before installing the project, ensure you have the following installed on your system:
- **Python 3.10+**
- **MongoDB** (Local instance running on port `27017` or a configured external URI)
- **Git** (Optional, for cloning)

## Installation Guide

Follow these steps to get the MedScan AI project running on your local machine.

### 1. Clone or Download the Repository
If using Git, clone the project to your local machine:
```bash
git clone <your-repository-url>
cd medscanv2
```

### 2. Set Up a Virtual Environment (Highly Recommended)
Creating a virtual environment ensures that the project dependencies do not conflict with other Python projects on your system.

**For Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**For macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Once your virtual environment is activated, install all required Python packages using the generated `requirements.txt` file.

```bash
pip install -r requirements.txt
```
*(Note: Ensure you are installing the required AI models correctly as defined in the `ai_engine.py` architecture, e.g., the Gemini and Groq integrations).*

### 4. Database Setup (MongoDB)
The backend expects an active MongoDB instance to track metrics and data.
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service. 
3. The app is configured to connect to `mongodb://127.0.0.1:27017/` by default.

### 5. Running the Application

**Start the FastAPI Backend:**
Run the backend server using `uvicorn`. The `--reload` flag allows the server to automatically restart when code changes.

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API will now be accessible at `http://127.0.0.1:8000`.

**Open the Frontend:**
The frontend consists of static HTML files. To view the app, simple open them in your web browser:
1. `index.html`: The main upload portal for submitting patient scans.
2. `admin.html`: The telemetry dashboard for monitoring real-time API performance and database health.

*You can open these directly via your file explorer or by setting up a lightweight HTTP server (e.g., `python -m http.server 3000`).*

## API Documentation
Detailed API documentation and endpoint definitions can be found in the `API_DOCS.md` file included in the repository. You can also view the interactive Swagger UI by navigating to:
`http://127.0.0.1:8000/docs`

---
*Created as a comprehensive diagnostic AI tool.*

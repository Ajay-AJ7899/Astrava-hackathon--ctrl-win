# Arogya AI

Arogya AI is an AI-powered Radiology Triage & Diagnostic Intelligence Platform. It streamlines hospital workflows by automatically analyzing patient scans (X-rays, CT Scans, Brain MRIs), combining image anomalies with clinical lab notes, and presenting a prioritized worklist to radiologists.

## 🚀 Basic Workflow

1. **Patient Intake:** Doctors register patients and attach clinical notes and lab records via the Hospital Staff Portal.
2. **Scan Upload:** Technologists select pending patients and upload their diagnostic scans (X-ray, CT, MRI).
3. **AI Analysis (FastAPI Backend):** 
   - Scans are processed by specialized ML models (e.g., Pneumonia X-ray, CT Scan, Brain MRI endpoints).
   - The AI correlates visual image anomalies with clinical lab severity to generate `critical_flags`, an `image_score`, and a `final_priority_score`.
4. **Radiologist Triage:** Radiologists receive an automatically sorted smart worklist. They review the AI's explanation (heatmap, image findings, lab correlation).
5. **Approval & Feedback:** Radiologists approve the AI prediction or reject it with corrected priorities (feeding back into the model).
6. **Doctor Results:** Doctors review the finalized reports, sorted by urgency.
7. **Patient Portal:** Patients can log in using their ID to track their scan status, view AI predictions, and access final reports.

## 💻 Tech Stack

### Frontend (`/frontend`)
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI, Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router

### Database & Node Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose for schemas: `Patient`, `DoneReport`)
- **Features:** Patient state tracking, archived report storage.

### AI Engine (`/backend`)
- **Framework:** FastAPI (Python)
- **Computer Vision & NLP:** PyTorch / OpenCV (MedSigLIP and classification models)
- **Endpoints:**
  - `POST /api/pneumonia-xray`
  - `POST /api/ct-scan`  
  - `POST /api/brain-mri`
- **Features:** Multi-modal analysis parsing lab notes and generating combined severity scores.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB instance running locally (port 27017)

### Running the Full Stack

This project is configured with a root `package.json` to concurrently start the Node/React components.

1. **Install dependencies for both frontend and node server:**
   ```bash
   npm run install:all
   ```

2. **Start the Frontend and Node API:**
   ```bash
   npm run dev
   ```
   *Frontend gracefully runs on localhost:8080*

3. **Start the Python AI Backend:**
   Open a new terminal, navigate to the `backend` folder, and run:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

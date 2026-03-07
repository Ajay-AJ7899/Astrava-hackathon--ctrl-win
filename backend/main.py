from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ai_engine import analyze_xray, analyze_ct, analyze_mri, analyze_severity_medsiglip
import shutil
import os
import time
from collections import defaultdict, deque
from datetime import datetime
from pymongo import MongoClient

# ── In-memory metrics store ───────────────────────────────────────────────────
metrics = {
    "total_requests": 0,
    "endpoint_counts": defaultdict(int),
    "endpoint_errors": defaultdict(int),
    "endpoint_total_ms": defaultdict(float),
    "recent_requests": deque(maxlen=50),   # last 50 requests
    "server_start": datetime.now().isoformat(),
}

app = FastAPI()

# ── MongoDB Connection ────────────────────────────────────────────────────────
try:
    mongo_client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
    # Trigger a server request to check connection
    mongo_client.server_info()
    db = mongo_client["medscan_db"]
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    mongo_client = None

# Allow your local HTML file to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def track_requests(request: Request, call_next):
    if request.url.path.startswith("/api/") and request.url.path != "/api/metrics":
        start = time.time()
        endpoint = request.url.path
        status = "success"
        try:
            response = await call_next(request)
            if response.status_code >= 400:
                status = "error"
                metrics["endpoint_errors"][endpoint] += 1
        except Exception:
            status = "error"
            metrics["endpoint_errors"][endpoint] += 1
            raise
        finally:
            elapsed_ms = round((time.time() - start) * 1000, 1)
            metrics["total_requests"] += 1
            metrics["endpoint_counts"][endpoint] += 1
            metrics["endpoint_total_ms"][endpoint] += elapsed_ms
            metrics["recent_requests"].appendleft({
                "time": datetime.now().strftime("%H:%M:%S"),
                "endpoint": endpoint,
                "status": status,
                "ms": elapsed_ms
            })
        return response
    return await call_next(request)

@app.get("/api/metrics")
async def get_metrics():
    endpoints = list(metrics["endpoint_counts"].keys())
    stats = []
    for ep in endpoints:
        count = metrics["endpoint_counts"][ep]
        errors = metrics["endpoint_errors"][ep]
        avg_ms = round(metrics["endpoint_total_ms"][ep] / count, 1) if count else 0
        stats.append({
            "endpoint": ep,
            "requests": count,
            "errors": errors,
            "avg_ms": avg_ms,
            "success_rate": round((count - errors) / count * 100, 1) if count else 100
        })
    # Check MongoDB status
    mongo_status = "Disconnected"
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            mongo_status = "Connected"
        except Exception:
            mongo_status = "Disconnected"

    return JSONResponse({
        "total_requests": metrics["total_requests"],
        "server_start": metrics["server_start"],
        "endpoints": stats,
        "recent": list(metrics["recent_requests"]),
        "mongodb_status": mongo_status
    })

# Create a temp folder for uploaded scans
os.makedirs("temp_uploads", exist_ok=True)

@app.post("/api/pneumonia-xray")
async def triage_patient(
    patient_name: str = Form(...),
    lab_notes: str = Form(...),
    xray_file: UploadFile = File(...)
):
    file_path = f"temp_uploads/{xray_file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(xray_file.file, buffer)

    image_score = analyze_xray(file_path)
    severity = analyze_severity_medsiglip(file_path, "xray")  # Uses XRAY_PROMPTS

    normalized_severity = severity["severity_score"] / 10.0
    final_priority = (0.6 * image_score) + (0.4 * normalized_severity)

    return {
        "patient": patient_name,
        "scan_type": "X-Ray",
        "image_anomaly_confidence": round(image_score * 100, 2),
        "lab_severity": severity["severity_score"],
        "critical_flags": severity["critical_keywords"],
        "final_priority_score": round(final_priority, 3),
        "status": "Ready for Radiologist"
    }

@app.post("/api/ct-scan")
async def ct_scan(
    patient_name: str = Form(...),
    lab_notes: str = Form(...),
    ct_file: UploadFile = File(...)
):
    file_path = f"temp_uploads/{ct_file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(ct_file.file, buffer)

    image_score = analyze_ct(file_path)
    severity = analyze_severity_medsiglip(file_path, "ct")  # Uses CT_PROMPTS

    normalized_severity = severity["severity_score"] / 10.0
    final_priority = (0.6 * image_score) + (0.4 * normalized_severity)

    return {
        "patient": patient_name,
        "scan_type": "CT",
        "image_anomaly_confidence": round(image_score * 100, 2),
        "lab_severity": severity["severity_score"],
        "critical_flags": severity["critical_keywords"],
        "final_priority_score": round(final_priority, 3),
        "status": "Ready for Radiologist"
    }

@app.post("/api/brain-mri")
async def brain_mri(
    patient_name: str = Form(...),
    lab_notes: str = Form(...),
    mri_file: UploadFile = File(...)
):
    file_path = f"temp_uploads/{mri_file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(mri_file.file, buffer)

    image_score = analyze_mri(file_path)
    severity = analyze_severity_medsiglip(file_path, "mri")  # Uses MRI_PROMPTS

    normalized_severity = severity["severity_score"] / 10.0
    final_priority = (0.6 * image_score) + (0.4 * normalized_severity)

    return {
        "patient": patient_name,
        "scan_type": "Brain MRI",
        "image_anomaly_confidence": round(image_score * 100, 2),
        "lab_severity": severity["severity_score"],
        "critical_flags": severity["critical_keywords"],
        "final_priority_score": round(final_priority, 3),
        "status": "Ready for Radiologist"
    }

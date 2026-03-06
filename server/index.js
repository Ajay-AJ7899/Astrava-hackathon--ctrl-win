import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Patient from "./models/Patient.js";
import DoneReport from "./models/DoneReport.js";

// ─── Config ──────────────────────────────────────────────────────────────────
const MONGO_URI = "mongodb://192.168.137.1:27017/astrava";
const PORT = 3001;

// ─── Connect ─────────────────────────────────────────────────────────────────
mongoose
    .connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB connected → ${MONGO_URI}`))
    .catch((err) => { console.error("❌ MongoDB connection failed:", err.message); process.exit(1); });

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState }));

// ════════════════════════════════════════════════════════════════════════════
//  PATIENTS  (active worklist — status: Awaiting Scan | Ready for Read)
// ════════════════════════════════════════════════════════════════════════════

// GET all active patients
app.get("/api/patients", async (_req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 }).lean();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single patient
app.get("/api/patients/:id", async (req, res) => {
    try {
        const patient = await Patient.findOne({ id: req.params.id }).lean();
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create patient
app.post("/api/patients", async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient.toObject());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH update patient fields
app.patch("/api/patients/:id", async (req, res) => {
    try {
        const updated = await Patient.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true, runValidators: true }
        ).lean();
        if (!updated) return res.status(404).json({ error: "Patient not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET labs for a patient
app.get("/api/patients/:id/labs", async (req, res) => {
    try {
        const patient = await Patient.findOne({ id: req.params.id }, "labRecords").lean();
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient.labRecords || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST append lab records
app.post("/api/patients/:id/labs", async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records) || records.length === 0)
            return res.status(400).json({ error: "records array is required" });
        const updated = await Patient.findOneAndUpdate(
            { id: req.params.id },
            { $push: { labRecords: { $each: records } } },
            { new: true }
        ).lean();
        if (!updated) return res.status(404).json({ error: "Patient not found" });
        res.json(updated.labRecords);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ════════════════════════════════════════════════════════════════════════════
//  DONE REPORTS  (archived after radiologist submits verdict)
//  Collection: done_reports — separate from patients so worklist stays clean
// ════════════════════════════════════════════════════════════════════════════

// GET all done reports — sorted by completedAt desc
app.get("/api/done-reports", async (_req, res) => {
    try {
        const reports = await DoneReport.find().sort({ completedAt: -1 }).lean();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a done report (called by frontend on radiologist submit)
// Also removes the patient from the active patients collection
app.post("/api/done-reports", async (req, res) => {
    try {
        const report = new DoneReport(req.body);
        await report.save();

        // Archive: remove from active patients so they don't clog the worklist
        if (req.body.patientId) {
            await Patient.findOneAndDelete({ id: req.body.patientId });
        }

        res.status(201).json(report.toObject());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET single done report by patientId
app.get("/api/done-reports/:patientId", async (req, res) => {
    try {
        const report = await DoneReport.findOne({ patientId: req.params.patientId }).lean();
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Astrava API server running on http://localhost:${PORT}`);
    console.log(`   Patients  → GET/POST/PATCH http://localhost:${PORT}/api/patients`);
    console.log(`   Reports   → GET/POST       http://localhost:${PORT}/api/done-reports`);
});

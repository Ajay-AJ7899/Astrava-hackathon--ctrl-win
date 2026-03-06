import mongoose from "mongoose";

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const LabRecordSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        test: { type: String, required: true },
        result: { type: String, required: true },
        flag: { type: String, enum: ["normal", "abnormal", "critical"], default: "normal" },
    },
    { _id: false }
);

const AIReasoningSchema = new mongoose.Schema(
    {
        imageFindings: [String],
        labFindings: [String],
        clinicalCorrelation: String,
        recommendation: String,
        confidence: Number,
    },
    { _id: false }
);

// ─── Main Patient Schema ─────────────────────────────────────────────────────

const PatientSchema = new mongoose.Schema(
    {
        // Patient identity
        id: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },

        // Workflow status
        status: {
            type: String,
            enum: ["Awaiting Scan", "Ready for Read", "Completed", "Rejected"],
            default: "Awaiting Scan",
        },

        // Clinical info
        chiefComplaint: { type: String, default: "" },
        clinicalNotes: { type: String, default: "" },
        clinicalTrialNotes: { type: String, default: "" },
        labRecords: { type: [LabRecordSchema], default: [] },

        // Scan
        scanType: { type: String, enum: ["xray", "ct", "mri"], default: null },
        scanImage: { type: String, default: null },   // base64 or URL
        heatmapImage: { type: String, default: null },

        // AI scores
        imageRisk: { type: Number, default: null },
        labRisk: { type: Number, default: null },
        urgencyScore: { type: Number, default: null },
        priority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL", null], default: null },
        aiReasoning: { type: AIReasoningSchema, default: null },

        // Radiologist feedback
        radiologistImpression: { type: String, default: null },
        feedbackAction: { type: String, enum: ["approve", "reject", null], default: null },
        feedbackNotes: { type: String, default: null },
        correctedPriority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL", null], default: null },

        // Timestamps
        createdAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
    },
    {
        collection: "patients",
        timestamps: false, // we manage createdAt manually to mirror frontend store
    }
);

export default mongoose.model("Patient", PatientSchema);

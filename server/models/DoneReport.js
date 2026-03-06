import mongoose from "mongoose";

/**
 * DoneReport — a completed/rejected radiology case.
 * Written here once the radiologist submits feedback.
 * Kept SEPARATE from `patients` so active worklist stays clean.
 */
const DoneReportSchema = new mongoose.Schema(
    {
        // Original patient identifiers
        patientId: { type: String, required: true, index: true },
        patientName: { type: String, required: true },
        patientAge: { type: Number },

        // Clinical context
        chiefComplaint: String,
        clinicalNotes: String,
        clinicalTrialNotes: String,
        labRecords: [
            {
                date: String,
                test: String,
                result: String,
                flag: { type: String, enum: ["normal", "abnormal", "critical"] },
                _id: false,
            },
        ],

        // Scan
        scanType: { type: String, enum: ["xray", "ct", "mri"] },
        scanImage: String,

        // AI scores
        imageRisk: Number,
        labRisk: Number,
        urgencyScore: Number,
        priority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL"] },
        aiReasoning: {
            imageFindings: [String],
            labFindings: [String],
            clinicalCorrelation: String,
            recommendation: String,
            confidence: Number,
            _id: false,
        },

        // Radiologist verdict
        radiologistAction: { type: String, enum: ["approve", "reject"], required: true },
        radiologistNotes: { type: String, default: "" },
        radiologistImpression: String,
        correctedPriority: { type: String, enum: ["CRITICAL", "HIGH", "NORMAL"] },

        // Timestamps
        caseCreatedAt: Date,
        completedAt: { type: Date, default: Date.now },
    },
    {
        collection: "done_reports",
        timestamps: false,
    }
);

export default mongoose.model("DoneReport", DoneReportSchema);

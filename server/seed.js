/**
 * Seed script — inserts demo patients into MongoDB if the collection is empty.
 * Run: node server/seed.js
 */
import mongoose from "mongoose";
import Patient from "./models/Patient.js";

const MONGO_URI = "mongodb://192.168.137.1:27017/astrava";

const seedPatients = [
    {
        id: "PAT-001",
        name: "Rajesh Kumar",
        age: 58,
        status: "Completed",
        chiefComplaint: "Persistent cough with chest pain",
        clinicalNotes:
            "Patient presents with 3-week history of productive cough, mild hemoptysis. History of smoking 20 pack-years. Referred for chest X-ray.",
        labRecords: [
            { date: "2026-03-01", test: "WBC Count", result: "14,200/μL", flag: "abnormal" },
            { date: "2026-03-01", test: "CRP", result: "48 mg/L", flag: "critical" },
            { date: "2026-03-01", test: "O2 Saturation", result: "91%", flag: "abnormal" },
            { date: "2026-03-01", test: "Hemoglobin", result: "13.2 g/dL", flag: "normal" },
        ],
        scanType: "xray",
        imageRisk: 78, labRisk: 72, urgencyScore: 85, priority: "CRITICAL",
        aiReasoning: {
            imageFindings: ["Bilateral opacities in lower lobes", "Mild perihilar haziness"],
            labFindings: ["Elevated CRP & WBC correlate with active infection"],
            clinicalCorrelation: "Cross-referencing imaging (78%) with labs (72%).",
            recommendation: "IMMEDIATE clinical intervention recommended.",
            confidence: 87.3,
        },
        radiologistImpression: "Confirmed bilateral consolidation. Start empiric antibiotics.",
        feedbackAction: "approve",
        feedbackNotes: "AI accurate. Patient admitted for pneumonia.",
        createdAt: new Date("2026-03-01"),
        completedAt: new Date("2026-03-02"),
    },
    {
        id: "PAT-002",
        name: "Priya Sharma",
        age: 34,
        status: "Ready for Read",
        chiefComplaint: "Shortness of breath on exertion",
        clinicalNotes: "Young female, 2-week dyspnea. No smoking. X-ray to rule out cardiomegaly.",
        labRecords: [
            { date: "2026-03-03", test: "BNP", result: "320 pg/mL", flag: "abnormal" },
            { date: "2026-03-03", test: "Troponin", result: "0.02 ng/mL", flag: "normal" },
        ],
        scanType: "xray",
        imageRisk: 52, labRisk: 45, urgencyScore: 58, priority: "HIGH",
        aiReasoning: {
            imageFindings: ["Cardiomegaly with pulmonary vascular congestion"],
            labFindings: ["Mildly elevated BNP suggesting early pathology"],
            clinicalCorrelation: "Imaging 52% + labs 45% combined assessment.",
            recommendation: "Priority follow-up within 48 hours.",
            confidence: 79.1,
        },
        createdAt: new Date("2026-03-03"),
    },
    {
        id: "PAT-003",
        name: "Amit Patel",
        age: 45,
        status: "Awaiting Scan",
        chiefComplaint: "Routine check-up, mild back pain",
        clinicalNotes: "Annual physical exam. Occasional lower back pain. No other symptoms.",
        labRecords: [
            { date: "2026-03-05", test: "CBC", result: "Normal", flag: "normal" },
            { date: "2026-03-05", test: "ESR", result: "12 mm/hr", flag: "normal" },
        ],
        createdAt: new Date("2026-03-05"),
    },
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    const count = await Patient.countDocuments();
    if (count > 0) {
        console.log(`Collection already has ${count} patients — skipping seed.`);
    } else {
        await Patient.insertMany(seedPatients);
        console.log(`Seeded ${seedPatients.length} demo patients.`);
    }

    await mongoose.disconnect();
    console.log("Done.");
}

seed().catch((err) => { console.error(err); process.exit(1); });

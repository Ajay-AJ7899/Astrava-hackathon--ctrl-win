// Simple in-memory store for hackathon demo
export interface LabRecord {
  date: string;
  test: string;
  result: string;
  flag?: "normal" | "abnormal" | "critical";
}

export interface AIReasoning {
  imageFindings: string[];
  labFindings: string[];
  clinicalCorrelation: string;
  recommendation: string;
  confidence: number;
}

export interface FeedbackEntry {
  patientId: string;
  timestamp: Date;
  radiologistAction: "approve" | "reject";
  radiologistNotes: string;
  originalPriority: string;
  originalReasoning: AIReasoning;
  correctedPriority?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  status: "Awaiting Scan" | "Ready for Read" | "Completed" | "Rejected";
  chiefComplaint: string;
  clinicalNotes: string;
  labRecords: LabRecord[];
  scanImage?: string;
  heatmapImage?: string;
  imageRisk?: number;
  labRisk?: number;
  urgencyScore?: number;
  priority?: "CRITICAL" | "HIGH" | "NORMAL";
  aiReasoning?: AIReasoning;
  radiologistImpression?: string;
  feedbackAction?: "approve" | "reject";
  feedbackNotes?: string;
  correctedPriority?: "CRITICAL" | "HIGH" | "NORMAL";
  createdAt: Date;
  completedAt?: Date;
}

const labDatabase: Record<string, LabRecord[]> = {};

export function addLabRecords(patientId: string, records: LabRecord[]) {
  labDatabase[patientId] = [...(labDatabase[patientId] || []), ...records];
}

const reasoningTemplates = {
  imageFindings: {
    high: [
      "Bilateral opacities detected in lower lobes consistent with consolidation",
      "Significant pleural effusion identified on the right hemithorax",
      "Cardiomegaly with pulmonary vascular congestion pattern",
      "Ground-glass opacities with peripheral distribution suggestive of inflammatory process",
    ],
    moderate: [
      "Mild perihilar haziness suggesting early infiltrate",
      "Subtle linear atelectasis in left lower lobe",
      "Minor costophrenic blunting, possible small effusion",
    ],
    low: [
      "Clear lung fields bilaterally with no acute abnormality",
      "Normal cardiac silhouette and mediastinal contours",
      "No focal consolidation, pneumothorax, or pleural effusion",
    ],
  },
  labCorrelations: {
    critical: [
      "Markedly elevated inflammatory markers (CRP, WBC) correlate with imaging findings of active infection",
      "Critically low O2 saturation aligns with extensive pulmonary involvement seen on imaging",
      "Elevated D-Dimer with imaging findings raises concern for pulmonary embolism",
      "Combined cardiac biomarker elevation (Troponin, BNP) with cardiomegaly suggests acute cardiac decompensation",
    ],
    moderate: [
      "Mildly elevated markers may indicate early-stage pathology requiring monitoring",
      "Lab values show borderline abnormalities correlating with subtle imaging findings",
    ],
    normal: [
      "Lab values within normal limits, consistent with absence of significant pathology on imaging",
      "No laboratory evidence of acute inflammatory or infectious process",
    ],
  },
  recommendations: {
    CRITICAL: [
      "IMMEDIATE clinical intervention recommended. Consider ICU admission and urgent specialist consult.",
      "STAT follow-up imaging recommended within 24 hours. Alert attending physician immediately.",
      "Emergency department escalation advised. Begin empiric treatment pending definitive diagnosis.",
    ],
    HIGH: [
      "Priority follow-up within 48 hours recommended. Close clinical monitoring advised.",
      "Consider additional cross-sectional imaging (CT) for further characterization.",
      "Schedule follow-up labs and repeat imaging within 3 days.",
    ],
    NORMAL: [
      "Routine follow-up as clinically indicated. No urgent action required.",
      "Standard care pathway. Re-image if symptoms persist or worsen.",
    ],
  },
};

let feedbackLog: FeedbackEntry[] = [];
let modelAccuracy = { total: 0, correct: 0, falsePositives: 0, falseNegatives: 0 };

// Seed patients for demo
const seedPatients: Patient[] = [
  {
    id: "PAT-001",
    name: "Rajesh Kumar",
    age: 58,
    status: "Completed",
    chiefComplaint: "Persistent cough with chest pain",
    clinicalNotes: "Patient presents with 3-week history of productive cough, mild hemoptysis. History of smoking 20 pack-years. Referred for chest X-ray.",
    labRecords: [
      { date: "2026-03-01", test: "WBC Count", result: "14,200/μL", flag: "abnormal" },
      { date: "2026-03-01", test: "CRP", result: "48 mg/L", flag: "critical" },
      { date: "2026-03-01", test: "O2 Saturation", result: "91%", flag: "abnormal" },
      { date: "2026-03-01", test: "Hemoglobin", result: "13.2 g/dL", flag: "normal" },
    ],
    imageRisk: 78,
    labRisk: 72,
    urgencyScore: 85,
    priority: "CRITICAL",
    aiReasoning: {
      imageFindings: [
        "Bilateral opacities detected in lower lobes consistent with consolidation",
        "Mild perihilar haziness suggesting early infiltrate",
      ],
      labFindings: [
        "Markedly elevated inflammatory markers (CRP, WBC) correlate with imaging findings of active infection",
      ],
      clinicalCorrelation: "Cross-referencing imaging (78% risk) with laboratory data (72% risk) yields a combined urgency assessment. Initial prediction — no prior feedback data available for this pattern.",
      recommendation: "IMMEDIATE clinical intervention recommended. Consider ICU admission and urgent specialist consult.",
      confidence: 87.3,
    },
    radiologistImpression: "Confirmed bilateral lower lobe consolidation. Recommend CT for further evaluation. Start empiric antibiotics.",
    feedbackAction: "approve",
    feedbackNotes: "AI assessment accurate. Patient admitted for pneumonia management.",
    createdAt: new Date("2026-03-01"),
    completedAt: new Date("2026-03-02"),
  },
  {
    id: "PAT-002",
    name: "Priya Sharma",
    age: 34,
    status: "Ready for Read",
    chiefComplaint: "Shortness of breath on exertion",
    clinicalNotes: "Young female with 2-week history of dyspnea. No smoking history. Chest X-ray ordered to rule out cardiomegaly.",
    labRecords: [
      { date: "2026-03-03", test: "BNP", result: "320 pg/mL", flag: "abnormal" },
      { date: "2026-03-03", test: "Troponin", result: "0.02 ng/mL", flag: "normal" },
    ],
    imageRisk: 52,
    labRisk: 45,
    urgencyScore: 58,
    priority: "HIGH",
    aiReasoning: {
      imageFindings: ["Cardiomegaly with pulmonary vascular congestion pattern"],
      labFindings: ["Mildly elevated markers may indicate early-stage pathology requiring monitoring"],
      clinicalCorrelation: "Cross-referencing imaging (52% risk) with laboratory data (45% risk) yields a combined urgency assessment.",
      recommendation: "Priority follow-up within 48 hours recommended. Close clinical monitoring advised.",
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
    clinicalNotes: "Annual physical exam. Patient reports occasional lower back pain. No other symptoms.",
    labRecords: [
      { date: "2026-03-05", test: "CBC", result: "Normal", flag: "normal" },
      { date: "2026-03-05", test: "ESR", result: "12 mm/hr", flag: "normal" },
    ],
    createdAt: new Date("2026-03-05"),
  },
];

// Use a frozen snapshot reference that only changes on mutation
let patients: Patient[] = [...seedPatients];
let patientsSnapshot: readonly Patient[] = Object.freeze([...patients]);
let listeners: (() => void)[] = [];

function notify() {
  // Create a new frozen snapshot so useSyncExternalStore sees the change
  patientsSnapshot = Object.freeze([...patients]);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// Returns a stable reference — only changes when notify() is called
export function getPatients(): readonly Patient[] {
  return patientsSnapshot;
}

export function getLabRecords(patientId: string): LabRecord[] {
  const fromDb = labDatabase[patientId] || [];
  const patient = patients.find((p) => p.id === patientId);
  const fromPatient = patient?.labRecords || [];
  // Merge both sources, deduplicate by test+date
  const seen = new Set<string>();
  const merged: LabRecord[] = [];
  for (const rec of [...fromPatient, ...fromDb]) {
    const key = `${rec.test}|${rec.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(rec);
    }
  }
  return merged;
}

let counter = 3; // Start after seed patients

export function generatePatientId(): string {
  counter++;
  return `PAT-${String(counter).padStart(3, "0")}`;
}

export function addPatient(patient: Patient) {
  patients = [patient, ...patients];
  notify();
}

export function updatePatient(id: string, updates: Partial<Patient>) {
  patients = patients.map((p) => (p.id === id ? { ...p, ...updates } : p));
  notify();
}

export function getPatientsByStatus(status: Patient["status"]) {
  return patients.filter((p) => p.status === status);
}

export function generateAIReasoning(
  patient: Patient,
  imageRisk: number,
  labRisk: number,
  priority: "CRITICAL" | "HIGH" | "NORMAL"
): AIReasoning {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const feedbackAdjustment = getFeedbackAdjustment();

  const imageLevel = imageRisk >= 70 ? "high" : imageRisk >= 40 ? "moderate" : "low";

  const imageFindings = imageLevel === "high"
    ? [pick(reasoningTemplates.imageFindings.high), pick(reasoningTemplates.imageFindings.moderate)]
    : imageLevel === "moderate"
    ? [pick(reasoningTemplates.imageFindings.moderate)]
    : [pick(reasoningTemplates.imageFindings.low)];

  const labFindings: string[] = [];
  if (patient.labRecords.some((l) => l.flag === "critical")) {
    labFindings.push(pick(reasoningTemplates.labCorrelations.critical));
  }
  if (patient.labRecords.some((l) => l.flag === "abnormal")) {
    labFindings.push(pick(reasoningTemplates.labCorrelations.moderate));
  }
  if (labFindings.length === 0) {
    labFindings.push(pick(reasoningTemplates.labCorrelations.normal));
  }

  const clinicalCorrelation = `Cross-referencing imaging (${imageRisk}% risk) with laboratory data (${labRisk}% risk) yields a combined urgency assessment. ${
    feedbackAdjustment > 0
      ? `Model confidence adjusted by ${feedbackAdjustment.toFixed(1)}% based on ${feedbackLog.length} previous radiologist feedback entries (RAG-enhanced).`
      : "Initial prediction — no prior feedback data available for this pattern."
  }`;

  const recommendation = pick(reasoningTemplates.recommendations[priority]);

  return {
    imageFindings,
    labFindings,
    clinicalCorrelation,
    recommendation,
    confidence: Math.min(98, 70 + feedbackAdjustment + Math.random() * 15),
  };
}

export function submitFeedback(
  patientId: string,
  action: "approve" | "reject",
  notes: string,
  correctedPriority?: "CRITICAL" | "HIGH" | "NORMAL"
) {
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  const entry: FeedbackEntry = {
    patientId,
    timestamp: new Date(),
    radiologistAction: action,
    radiologistNotes: notes,
    originalPriority: patient.priority || "NORMAL",
    originalReasoning: patient.aiReasoning!,
    correctedPriority: correctedPriority || undefined,
  };

  feedbackLog = [...feedbackLog, entry];
  modelAccuracy.total++;
  if (action === "approve") {
    modelAccuracy.correct++;
  } else {
    if (correctedPriority && correctedPriority < (patient.priority || "NORMAL")) {
      modelAccuracy.falsePositives++;
    } else {
      modelAccuracy.falseNegatives++;
    }
  }

  updatePatient(patientId, {
    status: action === "approve" ? "Completed" : "Rejected",
    feedbackAction: action,
    feedbackNotes: notes,
    correctedPriority: correctedPriority || undefined,
    radiologistImpression: notes,
    completedAt: new Date(),
  });
}

export function getFeedbackLog() {
  return [...feedbackLog];
}

export function getModelAccuracy() {
  return { ...modelAccuracy };
}

function getFeedbackAdjustment(): number {
  if (feedbackLog.length === 0) return 0;
  const correctRate = modelAccuracy.correct / modelAccuracy.total;
  return correctRate * 10;
}

export function getCompletedForDoctor(): Patient[] {
  return patients
    .filter((p) => p.status === "Completed" || p.status === "Rejected")
    .sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));
}

// Counter starts after seed data


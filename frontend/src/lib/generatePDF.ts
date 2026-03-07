import type { Patient } from "@/store/patientStore";

export function generatePatientPDF(patient: Patient) {
  const priorityLabel = patient.feedbackAction === "reject"
    ? patient.correctedPriority || patient.priority || "N/A"
    : patient.priority || "N/A";

  const lines: string[] = [];
  const w = 595; // A4 width in points
  let y = 60;

  // PDF header
  lines.push("%PDF-1.4");
  
  // Build content as simple text-based PDF
  const textLines: string[] = [];

  textLines.push(`AROGYA AI - DIAGNOSTIC REPORT`);
  textLines.push(``);
  textLines.push(`Patient: ${patient.name}`);
  textLines.push(`ID: ${patient.id}    Age: ${patient.age}`);
  textLines.push(`Chief Complaint: ${patient.chiefComplaint}`);
  textLines.push(`Status: ${patient.status}`);
  textLines.push(`Priority: ${priorityLabel}`);
  textLines.push(``);
  textLines.push(`--- CLINICAL NOTES ---`);
  textLines.push(patient.clinicalNotes || "N/A");
  textLines.push(``);

  if (patient.labRecords.length > 0) {
    textLines.push(`--- LAB RESULTS ---`);
    patient.labRecords.forEach((lab) => {
      textLines.push(`${lab.test}: ${lab.result} [${lab.flag || "normal"}]`);
    });
    textLines.push(``);
  }

  if (patient.aiReasoning) {
    textLines.push(`--- AI ANALYSIS ---`);
    textLines.push(`Confidence: ${patient.aiReasoning.confidence.toFixed(1)}%`);
    textLines.push(``);
    textLines.push(`Image Findings:`);
    patient.aiReasoning.imageFindings.forEach((f) => textLines.push(`  - ${f}`));
    textLines.push(``);
    textLines.push(`Lab Findings:`);
    patient.aiReasoning.labFindings.forEach((f) => textLines.push(`  - ${f}`));
    textLines.push(``);
    textLines.push(`Clinical Correlation:`);
    textLines.push(patient.aiReasoning.clinicalCorrelation);
    textLines.push(``);
    textLines.push(`Recommendation:`);
    textLines.push(patient.aiReasoning.recommendation);
    textLines.push(``);
  }

  if (patient.radiologistImpression) {
    textLines.push(`--- RADIOLOGIST IMPRESSION ---`);
    textLines.push(patient.radiologistImpression);
    textLines.push(``);
  }

  if (patient.urgencyScore !== undefined) {
    textLines.push(`Urgency Score: ${patient.urgencyScore}`);
    textLines.push(`Image Risk: ${patient.imageRisk ?? "N/A"}%`);
    textLines.push(`Lab Risk: ${patient.labRisk ?? "N/A"}%`);
    textLines.push(``);
  }

  textLines.push(`Report generated: ${new Date().toLocaleString()}`);
  textLines.push(`This is an AI-assisted report. Not for clinical use without physician review.`);

  // Build PDF stream content
  const streamLines: string[] = [];
  streamLines.push("BT");
  streamLines.push("/F1 11 Tf");
  
  // Title
  streamLines.push(`1 0 0 1 50 780 Tm`);
  streamLines.push("/F1 16 Tf");
  streamLines.push(`(AROGYA AI - DIAGNOSTIC REPORT) Tj`);
  streamLines.push("/F1 10 Tf");

  y = 755;
  for (let i = 1; i < textLines.length; i++) {
    if (y < 50) break; // stop at page bottom
    const line = textLines[i]
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .substring(0, 90); // truncate long lines
    streamLines.push(`1 0 0 1 50 ${y} Tm`);
    if (line.startsWith("---")) {
      streamLines.push("/F1 12 Tf");
      streamLines.push(`(${line}) Tj`);
      streamLines.push("/F1 10 Tf");
    } else {
      streamLines.push(`(${line}) Tj`);
    }
    y -= 15;
  }
  streamLines.push("ET");

  const stream = streamLines.join("\n");

  // Minimal valid PDF structure
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj

4 0 obj
<< /Length ${stream.length} >>
stream
${stream}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000${(317 + stream.length).toString().padStart(4, "0")} 00000 n 

trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;

  // Download
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${patient.id}-report.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

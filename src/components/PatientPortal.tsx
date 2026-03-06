import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Search, Activity, Clock, CheckCircle, AlertTriangle,
  FileText, FlaskConical, Brain, Shield, ArrowLeft, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/store/patientStore";
import { generatePatientPDF } from "@/lib/generatePDF";
import humanBodyImg from "@/assets/human-body.png";

const PatientPortal = () => {
  const [patientId, setPatientId] = useState("");
  const [loggedInPatient, setLoggedInPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const allPatients = usePatients();

  const handleLogin = () => {
    const id = patientId.trim().toUpperCase();
    const found = allPatients.find((p) => p.id === id);
    if (found) {
      setLoggedInPatient(found);
      setError("");
    } else {
      setError("Patient ID not found. Please check and try again.");
    }
  };

  const handleLogout = () => {
    setLoggedInPatient(null);
    setPatientId("");
    setError("");
  };

  // Login screen
  if (!loggedInPatient) {
    return (
      <div className="min-h-[calc(100vh-3rem)] gradient-mesh flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[hsl(var(--neon-green))]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[hsl(var(--neon-cyan))]/10 blur-3xl" />

          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-[hsl(var(--neon-green))]/10 border border-[hsl(var(--neon-green))]/20 flex items-center justify-center mx-auto mb-6"
              animate={{ boxShadow: ["0 0 20px hsl(150 100% 50% / 0.1)", "0 0 40px hsl(150 100% 50% / 0.2)", "0 0 20px hsl(150 100% 50% / 0.1)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <User className="w-10 h-10 text-[hsl(var(--neon-green))]" />
            </motion.div>

            <h2 className="text-2xl font-heading font-bold mb-2">Patient Portal</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Enter your Patient ID to view your scan status and results
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. PAT-001"
                  value={patientId}
                  onChange={(e) => { setPatientId(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-10 bg-muted/50 border-border h-12 text-center text-lg tracking-widest font-mono"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-destructive text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-[hsl(var(--neon-green))] text-[hsl(var(--background))] hover:bg-[hsl(var(--neon-green))]/90 font-semibold text-base"
              >
                View My Records
              </Button>
            </div>

            <p className="text-muted-foreground/50 text-xs mt-6">
              Demo IDs: PAT-001, PAT-002, PAT-003
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Patient dashboard
  const p = loggedInPatient;
  // Re-fetch to get latest status
  const latest = allPatients.find((pt) => pt.id === p.id) || p;

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    "Awaiting Scan": { icon: Clock, color: "var(--neon-orange)", label: "Awaiting Scan" },
    "Ready for Read": { icon: Activity, color: "var(--neon-cyan)", label: "Under Review" },
    "Completed": { icon: CheckCircle, color: "var(--neon-green)", label: "Results Ready" },
    "Rejected": { icon: AlertTriangle, color: "var(--neon-magenta)", label: "Needs Follow-up" },
  };

  const status = statusConfig[latest.status] || statusConfig["Awaiting Scan"];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-[calc(100vh-3rem)] gradient-mesh p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-[hsl(var(--neon-green))]" />
              Welcome, {latest.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {latest.id} • Age {latest.age}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(latest.status === "Completed" || latest.status === "Rejected") && (
              <Button
                size="sm"
                onClick={() => generatePatientPDF(latest)}
                className="bg-[hsl(var(--neon-green))] text-[hsl(var(--background))] hover:bg-[hsl(var(--neon-green))]/90"
              >
                <Download className="w-4 h-4 mr-1" /> Download PDF
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 flex items-center gap-4"
          style={{ borderColor: `hsl(${status.color})`, borderWidth: 1 }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: `hsl(${status.color} / 0.1)` }}
          >
            <StatusIcon className="w-7 h-7" style={{ color: `hsl(${status.color})` }} />
          </div>
          <div>
            <p className="text-lg font-heading font-semibold" style={{ color: `hsl(${status.color})` }}>
              {status.label}
            </p>
            <p className="text-muted-foreground text-sm">
              {latest.status === "Awaiting Scan" && "Your scan has been ordered and is pending completion."}
              {latest.status === "Ready for Read" && "Your scan is being reviewed by a radiologist."}
              {latest.status === "Completed" && "Your results are ready. Please review below."}
              {latest.status === "Rejected" && "The AI assessment was corrected. Your doctor will follow up."}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clinical Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
              Clinical Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Chief Complaint:</span>
                <p className="mt-1">{latest.chiefComplaint}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Clinical Notes:</span>
                <p className="mt-1">{latest.clinicalNotes}</p>
              </div>
            </div>
          </motion.div>

          {/* Body Scan Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <h3 className="font-heading font-semibold flex items-center gap-2 mb-4 self-start">
              <Shield className="w-4 h-4 text-[hsl(var(--neon-violet))]" />
              Scan Region
            </h3>
            <div className="relative w-48 h-72 flex items-center justify-center">
              <img
                src={humanBodyImg}
                alt="Human body anatomy scan"
                className="w-full h-full object-contain rounded-lg opacity-80"
              />
              {/* Scan line animation */}
              {latest.status === "Ready for Read" && (
                <motion.div
                  className="absolute left-0 right-0 h-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan)), transparent)" }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
          </motion.div>

          {/* Lab Records */}
          {latest.labRecords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[hsl(var(--neon-orange))]" />
                Lab Results
              </h3>
              <div className="space-y-2">
                {latest.labRecords.map((lab, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <span>{lab.test}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{lab.result}</span>
                      {lab.flag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lab.flag === "critical" ? "bg-destructive/10 text-destructive" :
                          lab.flag === "abnormal" ? "bg-[hsl(var(--neon-orange))]/10 text-[hsl(var(--neon-orange))]" :
                          "bg-[hsl(var(--neon-green))]/10 text-[hsl(var(--neon-green))]"
                        }`}>
                          {lab.flag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Results (only if completed) */}
          {(latest.status === "Completed" || latest.status === "Rejected") && latest.aiReasoning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-[hsl(var(--neon-magenta))]" />
                Diagnostic Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Recommendation:</span>
                  <p className="mt-1">{latest.aiReasoning.recommendation}</p>
                </div>
                {latest.radiologistImpression && (
                  <div>
                    <span className="text-muted-foreground">Radiologist Notes:</span>
                    <p className="mt-1">{latest.radiologistImpression}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;

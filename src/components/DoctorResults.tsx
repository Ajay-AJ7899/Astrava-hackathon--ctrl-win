import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope, User, AlertTriangle, CheckCircle, XCircle,
  Brain, ThumbsUp, ThumbsDown, TrendingUp, Clock, Shield, Eye, Bell
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { getModelAccuracy, getFeedbackLog, type Patient } from "@/store/patientStore";
import PrioritySidebar from "./PrioritySidebar";
import { toast } from "sonner";

const DoctorResults = () => {
  const allPatients = usePatients();
  const completed = allPatients
    .filter((p) => p.status === "Completed" || p.status === "Rejected")
    .sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));
  const accuracy = getModelAccuracy();
  const feedbackLog = getFeedbackLog();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Track previously seen IDs to detect new critical arrivals
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    completed.forEach((p) => {
      if (!seenIds.current.has(p.id)) {
        seenIds.current.add(p.id);
        if (p.priority === "CRITICAL") {
          toast.error(`🚨 CRITICAL case arrived: ${p.name} (${p.id}) — Urgency ${p.urgencyScore}%`, {
            duration: 8000,
            icon: <Bell className="w-5 h-5 text-destructive" />,
          });
        } else if (p.priority === "HIGH") {
          toast.warning(`⚠️ HIGH priority result: ${p.name} (${p.id}) — Urgency ${p.urgencyScore}%`, {
            duration: 5000,
          });
        }
      }
    });
  }, [completed]);

  const selected = selectedId ? completed.find((p) => p.id === selectedId) : null;

  const getPriorityBadge = (priority?: string) => {
    if (priority === "CRITICAL")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-bold">
          <XCircle className="w-3 h-3" /> CRITICAL
        </span>
      );
    if (priority === "HIGH")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-orange))]/20 text-[hsl(var(--neon-orange))] text-xs font-bold">
          <AlertTriangle className="w-3 h-3" /> HIGH
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/20 text-[hsl(var(--neon-green))] text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> NORMAL
      </span>
    );
  };

  return (
    <div className="min-h-screen gradient-mesh p-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-[hsl(var(--neon-cyan))]" />
            <span>Doctor's Results Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-prioritized patient results • Sorted by urgency score
          </p>
        </motion.div>

        {/* Model Stats Bar */}
        {feedbackLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4 mb-6 flex items-center gap-6 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[hsl(var(--neon-violet))]" />
              <span className="text-sm font-heading font-semibold">AI Model Performance</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--neon-green))]" />
                <span className="text-muted-foreground">Accuracy:</span>
                <span className="font-bold text-[hsl(var(--neon-green))]">
                  {accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                <span className="text-muted-foreground">Approved:</span>
                <span className="font-bold text-[hsl(var(--neon-cyan))]">{accuracy.correct}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">Rejected:</span>
                <span className="font-bold text-destructive">{accuracy.falsePositives + accuracy.falseNegatives}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Main results list */}
          <div className="col-span-8">
            {completed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-12 text-center"
              >
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="text-xl font-heading font-semibold mb-2">No Results Yet</h2>
                <p className="text-muted-foreground text-sm">
                  Completed radiology reports will appear here, sorted by AI-assigned urgency.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {completed.map((patient, i) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => setSelectedId(patient.id)}
                    className={`glass rounded-2xl p-5 cursor-pointer transition-all ${
                      patient.priority === "CRITICAL" ? "priority-critical" :
                      patient.priority === "HIGH" ? "priority-high" : ""
                    } ${selectedId === patient.id ? "ring-1 ring-[hsl(var(--neon-cyan))]/50" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-heading font-semibold">{patient.name}</h3>
                            {getPriorityBadge(patient.feedbackAction === "reject" ? patient.correctedPriority : patient.priority)}
                            {patient.feedbackAction === "reject" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-orange))]/10 border border-[hsl(var(--neon-orange))]/20 text-[hsl(var(--neon-orange))] text-xs">
                                <ThumbsDown className="w-3 h-3" /> Prediction Corrected
                              </span>
                            )}
                            {patient.feedbackAction === "approve" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/10 border border-[hsl(var(--neon-green))]/20 text-[hsl(var(--neon-green))] text-xs">
                                <ThumbsUp className="w-3 h-3" /> AI Confirmed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{patient.id} • Age {patient.age} • {patient.chiefComplaint}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">IMG</p>
                          <p className="text-lg font-heading font-bold text-[hsl(var(--neon-cyan))]">{patient.imageRisk}%</p>
                        </div>
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">LAB</p>
                          <p className="text-lg font-heading font-bold text-[hsl(var(--neon-violet))]">{patient.labRisk}%</p>
                        </div>
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">SCORE</p>
                          <p className={`text-lg font-heading font-bold ${
                            patient.priority === "CRITICAL" ? "text-destructive" :
                            patient.priority === "HIGH" ? "text-[hsl(var(--neon-orange))]" : "text-[hsl(var(--neon-green))]"
                          }`}>{patient.urgencyScore}%</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {patient.aiReasoning && (
                      <div className="glass rounded-xl p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-[hsl(var(--neon-violet))]" />
                          <span className="text-sm font-heading font-semibold">AI Reasoning</span>
                          <span className="text-xs glass rounded-full px-2 py-0.5 ml-auto">
                            Confidence: {patient.aiReasoning.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Image Findings
                            </p>
                            <ul className="space-y-1">
                              {patient.aiReasoning.imageFindings.map((f, j) => (
                                <li key={j} className="flex items-start gap-1">
                                  <span className="text-[hsl(var(--neon-cyan))]">•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Lab Correlation
                            </p>
                            <ul className="space-y-1">
                              {patient.aiReasoning.labFindings.map((f, j) => (
                                <li key={j} className="flex items-start gap-1">
                                  <span className="text-[hsl(var(--neon-violet))]">•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className={`mt-3 rounded-lg p-2 text-xs ${
                          patient.priority === "CRITICAL" ? "priority-critical" :
                          patient.priority === "HIGH" ? "priority-high" : "priority-normal"
                        }`}>
                          <p className="font-medium">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {patient.aiReasoning.recommendation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Radiologist Impression */}
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Radiologist Report</p>
                      <p className="text-sm">{patient.radiologistImpression || "No impression provided."}</p>
                      {patient.feedbackAction === "reject" && patient.correctedPriority && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-[hsl(var(--neon-orange))]">
                          <AlertTriangle className="w-3 h-3" />
                          Priority corrected from {patient.priority} → {patient.correctedPriority}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Sidebar */}
          <div className="col-span-4 sticky top-16 h-[calc(100vh-140px)]">
            <PrioritySidebar
              patients={completed}
              title="Priority Queue"
              selectedId={selectedId}
              onSelect={(p) => setSelectedId(p.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorResults;

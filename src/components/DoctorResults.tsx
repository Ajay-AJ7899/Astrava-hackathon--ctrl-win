import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope, User, AlertTriangle, CheckCircle, XCircle,
  Brain, ThumbsUp, ThumbsDown, TrendingUp, Clock, Shield, Eye, Bell, RefreshCw
} from "lucide-react";
import { getModelAccuracy, getFeedbackLog, getDoneReports, type DoneReport } from "@/store/patientStore";
import PrioritySidebar from "./PrioritySidebar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DoctorResults = () => {
  const [reports, setReports] = useState<DoneReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const accuracy = getModelAccuracy();
  const feedbackLog = getFeedbackLog();

  // Load done reports from MongoDB
  const fetchReports = async () => {
    setLoading(true);
    const data = await getDoneReports();
    setReports(data.sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0)));
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // Poll every 15s so new reports appear without a manual refresh
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  // Track previously seen IDs to detect new critical arrivals
  const seenIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    reports.forEach((r) => {
      if (!seenIds.current.has(r.patientId)) {
        seenIds.current.add(r.patientId);
        if (r.priority === "CRITICAL") {
          toast.error(`🚨 CRITICAL report: ${r.patientName} — Urgency ${r.urgencyScore}%`, {
            duration: 8000,
            icon: <Bell className="w-5 h-5 text-destructive" />,
          });
        } else if (r.priority === "HIGH") {
          toast.warning(`⚠️ HIGH priority report: ${r.patientName} — Urgency ${r.urgencyScore}%`, {
            duration: 5000,
          });
        }
      }
    });
  }, [reports]);

  const selected = selectedId ? reports.find((r) => r.patientId === selectedId) : null;

  // Map DoneReport → shape PrioritySidebar expects (uses Patient-like fields)
  const sidebarPatients = reports.map((r) => ({
    id: r.patientId,
    name: r.patientName,
    age: r.patientAge || 0,
    status: "Completed" as const,
    chiefComplaint: r.chiefComplaint || "",
    clinicalNotes: r.clinicalNotes || "",
    labRecords: r.labRecords || [],
    urgencyScore: r.urgencyScore,
    priority: r.priority,
    feedbackAction: r.radiologistAction,
    correctedPriority: r.correctedPriority,
    imageRisk: r.imageRisk,
    labRisk: r.labRisk,
    aiReasoning: r.aiReasoning,
    scanImage: undefined,
    heatmapImage: undefined,
    createdAt: r.caseCreatedAt || new Date(),
  }));

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-[hsl(var(--neon-cyan))]" />
                <span>Doctor's Results Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Completed radiology reports from <span className="font-mono text-neon-cyan text-xs">done_reports</span> collection • Sorted by urgency
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
              className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
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
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-12 text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-neon-cyan animate-spin" />
                <p className="text-muted-foreground">Loading reports from database…</p>
              </motion.div>
            ) : reports.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="text-xl font-heading font-semibold mb-2">No Reports Yet</h2>
                <p className="text-muted-foreground text-sm">
                  Completed radiology reports will appear here once the radiologist submits feedback.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {reports.map((r, i) => (
                  <motion.div
                    key={r.patientId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => setSelectedId(r.patientId)}
                    className={`glass rounded-2xl p-5 cursor-pointer transition-all ${r.priority === "CRITICAL" ? "priority-critical" :
                      r.priority === "HIGH" ? "priority-high" : ""
                      } ${selectedId === r.patientId ? "ring-1 ring-[hsl(var(--neon-cyan))]/50" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-heading font-semibold">{r.patientName}</h3>
                            {getPriorityBadge(r.radiologistAction === "reject" ? r.correctedPriority : r.priority)}
                            {r.radiologistAction === "reject" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-orange))]/10 border border-[hsl(var(--neon-orange))]/20 text-[hsl(var(--neon-orange))] text-xs">
                                <ThumbsDown className="w-3 h-3" /> Prediction Corrected
                              </span>
                            )}
                            {r.radiologistAction === "approve" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/10 border border-[hsl(var(--neon-green))]/20 text-[hsl(var(--neon-green))] text-xs">
                                <ThumbsUp className="w-3 h-3" /> AI Confirmed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {r.patientId} • Age {r.patientAge} • {r.chiefComplaint}
                          </p>
                          {r.completedAt && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                              Completed {new Date(r.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">IMG</p>
                          <p className="text-lg font-heading font-bold text-[hsl(var(--neon-cyan))]">{r.imageRisk ?? "—"}%</p>
                        </div>
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">LAB</p>
                          <p className="text-lg font-heading font-bold text-[hsl(var(--neon-violet))]">{r.labRisk ?? "—"}%</p>
                        </div>
                        <div className="glass rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">SCORE</p>
                          <p className={`text-lg font-heading font-bold ${r.priority === "CRITICAL" ? "text-destructive" :
                            r.priority === "HIGH" ? "text-[hsl(var(--neon-orange))]" : "text-[hsl(var(--neon-green))]"
                            }`}>{r.urgencyScore ?? "—"}%</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {r.aiReasoning && (
                      <div className="glass rounded-xl p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-[hsl(var(--neon-violet))]" />
                          <span className="text-sm font-heading font-semibold">AI Reasoning</span>
                          <span className="text-xs glass rounded-full px-2 py-0.5 ml-auto">
                            Confidence: {r.aiReasoning.confidence?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Image Findings
                            </p>
                            <ul className="space-y-1">
                              {r.aiReasoning.imageFindings?.map((f, j) => (
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
                              {r.aiReasoning.labFindings?.map((f, j) => (
                                <li key={j} className="flex items-start gap-1">
                                  <span className="text-[hsl(var(--neon-violet))]">•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className={`mt-3 rounded-lg p-2 text-xs ${r.priority === "CRITICAL" ? "priority-critical" :
                          r.priority === "HIGH" ? "priority-high" : "priority-normal"
                          }`}>
                          <p className="font-medium">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {r.aiReasoning.recommendation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scan Image */}
                    {r.scanImage && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          Technician Scan
                          {r.scanType && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${r.scanType === "xray" ? "bg-neon-violet/20 text-neon-violet" :
                                r.scanType === "ct" ? "bg-neon-cyan/20 text-neon-cyan" :
                                  "bg-neon-green/20 text-neon-green"
                              }`}>
                              {r.scanType === "xray" ? "X-RAY" : r.scanType === "ct" ? "CT" : "MRI"}
                            </span>
                          )}
                        </p>
                        <div className={`rounded-xl overflow-hidden border border-border/30 transition-all duration-300 ${selectedId === r.patientId ? "max-h-96" : "max-h-40"
                          }`}>
                          <img
                            src={r.scanImage}
                            alt={`Scan for ${r.patientName}`}
                            className="w-full object-contain bg-black/40"
                            style={{ maxHeight: selectedId === r.patientId ? "24rem" : "10rem" }}
                          />
                        </div>
                        {selectedId !== r.patientId && (
                          <p className="text-[10px] text-muted-foreground/50 text-center mt-1">Click card to expand</p>
                        )}
                      </div>
                    )}

                    {/* Radiologist Report */}
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Radiologist Report</p>
                      <p className="text-sm">{r.radiologistImpression || r.radiologistNotes || "No impression provided."}</p>
                      {r.radiologistAction === "reject" && r.correctedPriority && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-[hsl(var(--neon-orange))]">
                          <AlertTriangle className="w-3 h-3" />
                          Priority corrected from {r.priority} → {r.correctedPriority}
                        </div>
                      )}
                      {r.clinicalTrialNotes && (
                        <p className="mt-2 text-xs text-muted-foreground border-t border-border/40 pt-2">
                          📋 Trial Notes: {r.clinicalTrialNotes}
                        </p>
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
              patients={sidebarPatients}
              title="Completed Queue"
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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle,
  Send, User, Activity, Layers, FileText, Shield, ThumbsUp, ThumbsDown,
  Brain, TrendingUp, MessageSquare, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePatientsByStatus } from "@/hooks/usePatients";
import { submitFeedback, getModelAccuracy, getFeedbackLog, type Patient } from "@/store/patientStore";
import { toast } from "sonner";

const RadiologistDashboard = () => {
  const readyPatients = usePatientsByStatus("Ready for Read");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [impression, setImpression] = useState("");
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const [correctedPriority, setCorrectedPriority] = useState<"CRITICAL" | "HIGH" | "NORMAL">("NORMAL");
  const [rejectReason, setRejectReason] = useState("");

  const sorted = [...readyPatients].sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));
  const selected = sorted.find((p) => p.id === selectedId) || sorted[0] || null;
  const accuracy = getModelAccuracy();
  const feedbackCount = getFeedbackLog().length;

  const handleApprove = () => {
    if (!selected) return;
    submitFeedback(selected.id, "approve", impression || "Findings confirmed. Report approved.");
    toast.success(`✅ Report approved for ${selected.name}. Sent to Doctor's queue.`);
    setImpression("");
    setSelectedId(null);
    setShowFeedbackPanel(false);
  };

  const handleReject = () => {
    if (!selected) return;
    if (!rejectReason) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    submitFeedback(selected.id, "reject", rejectReason, correctedPriority);
    toast.warning(`⚠️ Prediction rejected for ${selected.name}. Feedback stored for model improvement.`);
    setRejectReason("");
    setCorrectedPriority("NORMAL");
    setSelectedId(null);
    setShowFeedbackPanel(false);
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === "CRITICAL")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-bold animate-pulse-neon">
          <XCircle className="w-3 h-3" /> CRITICAL
        </span>
      );
    if (priority === "HIGH")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-orange/20 text-neon-orange text-xs font-bold">
          <AlertTriangle className="w-3 h-3" /> HIGH
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> NORMAL
      </span>
    );
  };

  const highlightDangerousKeywords = (text: string) => {
    const keywords = [
      "88%", "O2 Sat", "critical", "shortness of breath", "chest pain",
      "fever", "elevated", "dyspnea", "PE", "D-Dimer", "Troponin",
      "smoking", "hypertension", "diabetes", "102°F"
    ];
    let result = text;
    keywords.forEach((kw) => {
      const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      result = result.replace(regex, `<mark class="bg-destructive/20 text-destructive font-semibold px-1 rounded">$1</mark>`);
    });
    return result;
  };

  if (readyPatients.length === 0) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center max-w-md"
        >
          <ScanSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-heading font-semibold mb-2">No Cases Pending</h2>
          <p className="text-muted-foreground text-sm mb-6">
            All scans have been reviewed. New cases will appear here after the technologist processes them.
          </p>
          {feedbackCount > 0 && (
            <div className="glass rounded-xl p-4 text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Brain className="w-3 h-3" /> Model Learning Stats
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-heading font-bold text-neon-cyan">{feedbackCount}</p>
                  <p className="text-xs text-muted-foreground">Feedback</p>
                </div>
                <div>
                  <p className="text-lg font-heading font-bold text-neon-green">
                    {accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div>
                  <p className="text-lg font-heading font-bold text-neon-orange">{accuracy.falsePositives}</p>
                  <p className="text-xs text-muted-foreground">FP Rate</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh p-4">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <ScanSearch className="w-8 h-8 text-neon-magenta" />
              <span>Radiologist Triage Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">AI-prioritized worklist • {readyPatients.length} case{readyPatients.length !== 1 ? "s" : ""} pending</p>
          </div>
          {/* Model accuracy badge */}
          {feedbackCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl px-4 py-2 flex items-center gap-3"
            >
              <Brain className="w-4 h-4 text-neon-violet" />
              <div className="text-xs">
                <span className="text-muted-foreground">Model Accuracy: </span>
                <span className="font-bold text-neon-green">
                  {accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-xs">
                <span className="text-muted-foreground">Feedback: </span>
                <span className="font-bold text-neon-cyan">{feedbackCount}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-neon-violet animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs text-neon-violet">RAG Active</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
          {/* LEFT: Smart Worklist */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-3 glass rounded-2xl p-4 overflow-y-auto"
          >
            <h2 className="text-sm font-heading font-semibold flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              Smart Worklist
            </h2>
            <div className="space-y-2">
              {sorted.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); setImpression(""); setShowHeatmap(false); setShowFeedbackPanel(false); }}
                  className={`w-full text-left rounded-xl p-3 transition-all duration-200 ${selected?.id === p.id
                    ? "glass-strong border-neon-magenta/50 neon-glow-magenta"
                    : "glass hover:border-border/60"
                    } ${p.priority === "CRITICAL"
                      ? "priority-critical"
                      : p.priority === "HIGH"
                        ? "priority-high"
                        : ""
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">{p.name}</span>
                    {getPriorityBadge(p.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.id} • Age {p.age}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-mono text-neon-cyan">IMG: {p.imageRisk}%</span>
                    <span className="font-mono text-neon-violet">LAB: {p.labRisk}%</span>
                    <span className="font-mono font-bold text-foreground">→ {p.urgencyScore}%</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* CENTER: Diagnostic Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-5 glass rounded-2xl p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-heading font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                Diagnostic Viewer
              </h2>
              {selected?.scanImage && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {showHeatmap ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                    AI Heatmap
                  </span>
                  <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden relative">
              {selected?.scanImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={selected.scanImage} alt="X-ray scan" className="max-w-full max-h-full object-contain" />
                  <AnimatePresence>
                    {showHeatmap && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="absolute inset-0"
                          style={{
                            background: `
                              radial-gradient(ellipse 40% 30% at 55% 45%, hsla(0, 100%, 50%, 0.4) 0%, transparent 70%),
                              radial-gradient(ellipse 25% 20% at 40% 55%, hsla(30, 100%, 50%, 0.3) 0%, transparent 70%),
                              radial-gradient(ellipse 30% 25% at 60% 35%, hsla(60, 100%, 50%, 0.2) 0%, transparent 70%)
                            `,
                            mixBlendMode: "screen",
                          }}
                        />
                        <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-destructive" />
                          <div className="w-3 h-3 rounded-full bg-neon-orange" />
                          <div className="w-3 h-3 rounded-full bg-neon-green" />
                          <span className="text-muted-foreground ml-1">Activation Map</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a case to view the scan</p>
                </div>
              )}
            </div>

            {/* AI Reasoning Panel */}
            {selected?.aiReasoning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-heading font-semibold flex items-center gap-2 text-neon-violet">
                    <Brain className="w-4 h-4" />
                    AI Reasoning & Explanation
                  </h3>
                  <span className="text-xs glass rounded-full px-2 py-0.5">
                    Confidence: <span className="font-bold text-neon-cyan">{selected.aiReasoning.confidence.toFixed(1)}%</span>
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Image Findings (from API critical_flags)
                    </p>
                    <ul className="space-y-1">
                      {[...selected.aiReasoning.imageFindings, ...selected.aiReasoning.labFindings].map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-neon-cyan mt-0.5">•</span>
                          <span>{f.replace(/^[⚑▲⚠]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass rounded-lg p-2">
                    <p className="text-muted-foreground uppercase tracking-wider mb-1">Clinical Correlation</p>
                    <p className="text-foreground/80">{selected.aiReasoning.clinicalCorrelation}</p>
                  </div>

                  <div className={`rounded-lg p-2 ${selected.priority === "CRITICAL" ? "priority-critical" :
                      selected.priority === "HIGH" ? "priority-high" : "priority-normal"
                    }`}>
                    <p className="text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                    <p className="font-medium">{selected.aiReasoning.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT: Clinical Context + Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-4 flex flex-col gap-4 overflow-y-auto"
          >
            {/* AI Score */}
            {selected && (
              <div className="glass rounded-2xl p-4">
                <h2 className="text-sm font-heading font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider mb-4">
                  <Shield className="w-4 h-4" />
                  Combined AI Score
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Image Risk</p>
                    <p className="text-2xl font-heading font-bold text-neon-cyan">{selected.imageRisk}%</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Lab Risk</p>
                    <p className="text-2xl font-heading font-bold text-neon-violet">{selected.labRisk}%</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <p className={`text-2xl font-heading font-bold ${selected.priority === "CRITICAL" ? "text-destructive" :
                      selected.priority === "HIGH" ? "text-neon-orange" : "text-neon-green"
                      }`}>
                      {selected.urgencyScore}%
                    </p>
                  </div>
                </div>
                {getPriorityBadge(selected.priority)}
              </div>
            )}

            {/* Clinical Notes */}
            {selected && (
              <div className="glass rounded-2xl p-4 flex-1 overflow-y-auto">
                <h2 className="text-sm font-heading font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider mb-3">
                  <FileText className="w-4 h-4" />
                  Clinical Context
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selected.name}</span>
                    <span className="text-muted-foreground">• {selected.id} • Age {selected.age}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Doctor's Notes</p>
                    <div
                      className="text-sm leading-relaxed glass rounded-lg p-3"
                      dangerouslySetInnerHTML={{ __html: highlightDangerousKeywords(selected.clinicalNotes) }}
                    />
                  </div>
                  {selected.labRecords.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Lab Results</p>
                      <div className="space-y-1">
                        {selected.labRecords.map((rec, i) => (
                          <div key={i} className={`flex items-center justify-between text-xs rounded-lg p-2 ${rec.flag === "critical" ? "priority-critical" : rec.flag === "abnormal" ? "priority-high" : "glass"
                            }`}>
                            <span className="font-medium">{rec.test}</span>
                            <span className="font-mono">{rec.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Area with Feedback */}
            {selected && (
              <div className="glass rounded-2xl p-4">
                {!showFeedbackPanel ? (
                  <>
                    <Textarea
                      value={impression}
                      onChange={(e) => setImpression(e.target.value)}
                      placeholder="Radiologist impression..."
                      rows={2}
                      className="bg-muted/30 border-border/50 focus:border-neon-magenta/50 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        className="flex-1 bg-gradient-to-r from-neon-green/80 to-neon-cyan/80 text-primary-foreground hover:opacity-90 font-semibold"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve & Send
                      </Button>
                      <Button
                        onClick={() => setShowFeedbackPanel(true)}
                        variant="outline"
                        className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject Prediction
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-heading font-semibold flex items-center gap-2 text-destructive">
                        <MessageSquare className="w-4 h-4" />
                        Feedback Loop — False Prediction Report
                      </h3>
                      <button onClick={() => setShowFeedbackPanel(false)} className="text-xs text-muted-foreground hover:text-foreground">
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      Your feedback will be stored and used to improve future AI predictions via RAG-enhanced learning.
                    </p>

                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">What should the correct priority be?</label>
                      <div className="flex gap-2">
                        {(["CRITICAL", "HIGH", "NORMAL"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setCorrectedPriority(p)}
                            className={`flex-1 text-xs py-2 rounded-lg border transition-all ${correctedPriority === p
                              ? p === "CRITICAL" ? "border-destructive bg-destructive/10 text-destructive font-bold"
                                : p === "HIGH" ? "border-neon-orange bg-neon-orange/10 text-neon-orange font-bold"
                                  : "border-neon-green bg-neon-green/10 text-neon-green font-bold"
                              : "border-border/50 text-muted-foreground hover:border-border"
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why the AI prediction was incorrect..."
                      rows={3}
                      className="bg-muted/30 border-border/50 focus:border-destructive/50 resize-none mb-3"
                    />

                    <Button
                      onClick={handleReject}
                      className="w-full bg-gradient-to-r from-destructive to-neon-orange text-foreground hover:opacity-90 font-semibold"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Submit Feedback & Improve Model
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RadiologistDashboard;

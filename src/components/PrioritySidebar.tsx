import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, User, Activity, Flame } from "lucide-react";
import { type Patient } from "@/store/patientStore";

interface PrioritySidebarProps {
  patients: readonly Patient[];
  title: string;
  onSelect?: (patient: Patient) => void;
  selectedId?: string | null;
}

const PrioritySidebar = ({ patients, title, onSelect, selectedId }: PrioritySidebarProps) => {
  const sorted = [...patients].sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));

  const criticalCount = sorted.filter((p) => p.priority === "CRITICAL").length;
  const highCount = sorted.filter((p) => p.priority === "HIGH").length;

  const getPriorityColor = (priority?: string) => {
    if (priority === "CRITICAL") return "border-l-destructive bg-destructive/5";
    if (priority === "HIGH") return "border-l-[hsl(var(--neon-orange))] bg-[hsl(var(--neon-orange))]/5";
    return "border-l-[hsl(var(--neon-green))] bg-[hsl(var(--neon-green))]/5";
  };

  const getPriorityIcon = (priority?: string) => {
    if (priority === "CRITICAL") return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    if (priority === "HIGH") return <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--neon-orange))]" />;
    return <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--neon-green))]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-2xl p-4 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-[hsl(var(--neon-magenta))]" />
        <h3 className="text-sm font-heading font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>

      {/* Summary badges */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="flex gap-2 mb-3">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold animate-pulse">
              <Flame className="w-3 h-3" /> {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[hsl(var(--neon-orange))]/15 text-[hsl(var(--neon-orange))] text-xs font-bold">
              <AlertTriangle className="w-3 h-3" /> {highCount} High
            </span>
          )}
        </div>
      )}

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {sorted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No patients in queue</p>
            </div>
          ) : (
            sorted.map((patient, i) => (
              <motion.button
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect?.(patient)}
                className={`w-full text-left rounded-xl p-3 border-l-4 transition-all duration-200 ${getPriorityColor(patient.priority)} ${
                  selectedId === patient.id
                    ? "ring-1 ring-[hsl(var(--neon-magenta))]/50 shadow-[0_0_12px_hsl(var(--neon-magenta)/0.15)]"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate max-w-[60%]">{patient.name}</span>
                  {getPriorityIcon(patient.priority)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{patient.id} • Age {patient.age}</span>
                  {patient.urgencyScore !== undefined && (
                    <span className={`font-mono font-bold ${
                      patient.priority === "CRITICAL" ? "text-destructive" :
                      patient.priority === "HIGH" ? "text-[hsl(var(--neon-orange))]" : "text-[hsl(var(--neon-green))]"
                    }`}>
                      {patient.urgencyScore}%
                    </span>
                  )}
                </div>
                {patient.chiefComplaint && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{patient.chiefComplaint}</p>
                )}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PrioritySidebar;

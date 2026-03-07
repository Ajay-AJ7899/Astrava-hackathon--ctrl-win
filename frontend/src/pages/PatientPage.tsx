import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import PatientPortal from "@/components/PatientPortal";

const PatientPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong h-12 flex items-center px-4 gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-cyan" />
          <span className="font-heading font-semibold text-sm neon-text-cyan">Arogya AI</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <span className="text-xs text-muted-foreground">Patient Portal</span>
      </motion.div>
      <div className="pt-12">
        <PatientPortal />
      </div>
    </div>
  );
};

export default PatientPage;

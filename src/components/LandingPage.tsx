import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, User, Activity, Stethoscope, Monitor, ScanSearch } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-neon-magenta/5 blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "10%", right: "10%" }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-neon-violet/5 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 80, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-10 h-10 text-neon-cyan" />
          </motion.div>
          <h1 className="text-6xl font-heading font-bold tracking-tight">
            <span className="neon-text-cyan">Arogya</span>{" "}
            <span className="text-foreground">AI</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          AI-Powered Radiology Triage & Diagnostic Intelligence Platform
        </p>
        <motion.div
          className="h-px w-48 mx-auto mt-6 bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Two Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        {/* Hospital Staff Portal */}
        <motion.button
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/hospital")}
          className="card-3d glass border-neon-cyan/30 rounded-2xl p-10 text-left cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/15 to-neon-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_hsl(185_100%_50%/0.3)] transition-shadow duration-500"
              animate={{ boxShadow: ["0 0 15px hsl(185 100% 50% / 0.05)", "0 0 25px hsl(185 100% 50% / 0.15)", "0 0 15px hsl(185 100% 50% / 0.05)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Building2 className="w-10 h-10 text-neon-cyan" />
            </motion.div>

            <h2 className="text-3xl font-heading font-bold mb-2">Hospital Staff</h2>
            <p className="text-neon-cyan font-medium text-sm mb-4">Clinical Workflow Portal</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Access the full diagnostic pipeline — order scans, upload images, and review AI-prioritized results.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-xs font-medium">
                <Stethoscope className="w-3 h-3" /> Doctor
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-xs font-medium">
                <Monitor className="w-3 h-3" /> Technologist
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/20 text-neon-magenta text-xs font-medium">
                <ScanSearch className="w-3 h-3" /> Radiologist
              </span>
            </div>

            <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Enter Hospital Portal</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </motion.button>

        {/* Patient Portal */}
        <motion.button
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/patient")}
          className="card-3d glass border-neon-green/30 rounded-2xl p-10 text-left cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/15 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_hsl(150_100%_50%/0.3)] transition-shadow duration-500"
              animate={{ boxShadow: ["0 0 15px hsl(150 100% 50% / 0.05)", "0 0 25px hsl(150 100% 50% / 0.15)", "0 0 15px hsl(150 100% 50% / 0.05)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <User className="w-10 h-10 text-neon-green" />
            </motion.div>

            <h2 className="text-3xl font-heading font-bold mb-2">Patient</h2>
            <p className="text-neon-green font-medium text-sm mb-4">My Health Records</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Log in with your Patient ID to view scan status, AI predictions, lab results, and download your diagnostic report as PDF.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium">
                📋 Scan Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium">
                🧠 AI Predictions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium">
                📄 PDF Report
              </span>
            </div>

            <div className="flex items-center gap-2 text-neon-green text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Login as Patient</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-16 text-muted-foreground/50 text-xs relative z-10"
      >
        Hackathon Demo • Not for clinical use • Powered by AI diagnostics
      </motion.p>
    </div>
  );
};

export default LandingPage;

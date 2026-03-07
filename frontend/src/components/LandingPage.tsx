import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, User, Activity, Stethoscope, Monitor, ScanSearch } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-mesh flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-neon-cyan/5 blur-[120px]"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "-10%", left: "-10%" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-neon-magenta/5 blur-[100px]"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "10%", right: "-5%" }}
        />
      </div>

      {/* LEFT COLUMN: Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center border-r border-white/5 bg-black/20 backdrop-blur-sm">
        {/* Glow behind the DNA */}
        <div className="absolute w-[60%] h-[80%] bg-neon-cyan/15 blur-[120px] rounded-full mix-blend-screen mix-blend-lighten pointer-events-none" />

        <motion.video
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/dna-strand.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="relative z-10 w-full max-w-md xl:max-w-lg object-contain drop-shadow-[0_0_50px_rgba(0,255,255,0.25)] mix-blend-screen"
          style={{
            maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)"
          }}
        />

        {/* Floating holographic UI elements over the DNA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute left-[15%] top-[30%] glass rounded-xl px-4 py-3 z-20 border-l-2 border-l-neon-cyan border-t-0 border-r-0 border-b-0 backdrop-blur-md bg-black/40"
        >
          <div className="text-[10px] text-neon-cyan uppercase tracking-widest mb-1 font-mono">Structural Analysis</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-sm font-medium">Priority Based </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute right-[15%] bottom-[35%] glass rounded-xl px-4 py-3 z-20 border-l-2 border-l-neon-violet border-t-0 border-r-0 border-b-0 backdrop-blur-md bg-black/40"
        >
          <div className="text-[10px] text-neon-violet uppercase tracking-widest mb-1 font-mono">AI Accuracy</div>
          <div className="text-2xl font-heading font-bold text-white">95.2%</div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Interactive Portals */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-screen p-8 sm:p-12 lg:p-16 xl:p-24 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20 backdrop-blur-sm"
            >
              <Activity className="w-8 h-8 text-neon-cyan" />
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold tracking-tight">
              <span className="neon-text-cyan">Arogya</span>{" "}
              <span className="text-foreground">AI</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            AI-Powered Radiology Triage & Diagnostic Intelligence Platform.
            Prioritize care using advanced neuro and structural models.
          </p>
        </motion.div>

        {/* Portals Stack */}
        <div className="flex flex-col gap-6 w-full max-w-xl">
          {/* Hospital Staff Portal */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/hospital")}
            className="card-3d glass border-neon-cyan/30 rounded-2xl p-6 lg:p-8 text-left cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            <motion.div
              className="w-16 h-16 shrink-0 rounded-2xl bg-black/40 border border-neon-cyan/20 flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(185_100%_50%/0.3)] transition-all duration-500 z-10"
            >
              <Building2 className="w-8 h-8 text-neon-cyan" />
            </motion.div>

            <div className="flex-1 relative z-10">
              <h2 className="text-2xl font-heading font-bold mb-1 group-hover:text-neon-cyan transition-colors">Hospital Staff</h2>
              <p className="text-muted-foreground text-sm mb-3">
                Clinical Workflow & AI Triage
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan text-[10px] uppercase font-bold tracking-wider">
                  <Stethoscope className="w-3 h-3" /> Doctor
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-violet/10 text-neon-violet text-[10px] uppercase font-bold tracking-wider">
                  <Monitor className="w-3 h-3" /> Tech
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-magenta/10 text-neon-magenta text-[10px] uppercase font-bold tracking-wider">
                  <ScanSearch className="w-3 h-3" /> Radio
                </span>
              </div>
            </div>

            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-white/5 items-center justify-center group-hover:bg-neon-cyan/20 transition-colors z-10">
              <span className="text-neon-cyan text-xl">→</span>
            </div>
          </motion.button>

          {/* Patient Portal */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/patient")}
            className="card-3d glass border-neon-green/30 rounded-2xl p-6 lg:p-8 text-left cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            <motion.div
              className="w-16 h-16 shrink-0 rounded-2xl bg-black/40 border border-neon-green/20 flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(150_100%_50%/0.3)] transition-all duration-500 z-10"
            >
              <User className="w-8 h-8 text-neon-green" />
            </motion.div>

            <div className="flex-1 relative z-10">
              <h2 className="text-2xl font-heading font-bold mb-1 group-hover:text-neon-green transition-colors">Patient Portal</h2>
              <p className="text-muted-foreground text-sm mb-3">
                My Health Records & Results
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-green/10 text-neon-green text-[10px] uppercase font-bold tracking-wider">
                  📋 Scan Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-green/10 text-neon-green text-[10px] uppercase font-bold tracking-wider">
                  📄 PDF Reports
                </span>
              </div>
            </div>

            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-white/5 items-center justify-center group-hover:bg-neon-green/20 transition-colors z-10">
              <span className="text-neon-green text-xl">→</span>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-muted-foreground/40 text-xs font-mono tracking-widest uppercase"
        >
          Hackathon Build • Clinical Preview
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;

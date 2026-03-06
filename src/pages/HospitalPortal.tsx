import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Activity, FileText, Inbox, Building2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HospitalRoleSelect from "@/components/HospitalRoleSelect";
import DoctorPortal from "@/components/DoctorPortal";
import DoctorResults from "@/components/DoctorResults";
import TechStation from "@/components/TechStation";
import RadiologistDashboard from "@/components/RadiologistDashboard";

type StaffRole = "doctor" | "tech" | "radiologist" | null;
type DoctorTab = "intake" | "results";

const DEMO_CREDENTIALS = { username: "admin", password: "admin" };

const HospitalPortal = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>(null);
  const [doctorTab, setDoctorTab] = useState<DoctorTab>("intake");

  const handleLogin = () => {
    if (username.trim().toLowerCase() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Use admin / admin");
    }
  };

  const handleBack = () => {
    if (staffRole) {
      setStaffRole(null);
      setDoctorTab("intake");
    } else if (isLoggedIn) {
      setIsLoggedIn(false);
      setUsername("");
      setPassword("");
    } else {
      navigate("/");
    }
  };

  // Demo login screen
  if (!isLoggedIn) {
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
          <span className="text-xs text-muted-foreground">Hospital Staff Login</span>
        </motion.div>

        <div className="pt-12 min-h-[calc(100vh-3rem)] gradient-mesh flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-10 max-w-md w-full text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-neon-cyan/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-neon-violet/10 blur-3xl" />

            <div className="relative z-10">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-6"
                animate={{ boxShadow: ["0 0 20px hsl(185 100% 50% / 0.1)", "0 0 40px hsl(185 100% 50% / 0.2)", "0 0 20px hsl(185 100% 50% / 0.1)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Building2 className="w-10 h-10 text-neon-cyan" />
              </motion.div>

              <h2 className="text-2xl font-heading font-bold mb-2">Hospital Staff Login</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Sign in to access the clinical workflow portal
              </p>

              <div className="space-y-4">
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
                  className="bg-muted/50 border-border h-12 text-center"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-muted/50 border-border h-12 text-center"
                />

                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-destructive text-sm"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button onClick={handleLogin} className="w-full h-12 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/30 text-base font-semibold">
                  <LogIn className="w-5 h-5 mr-2" /> Sign In
                </Button>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  Demo credentials: <span className="font-mono text-neon-cyan">admin</span> / <span className="font-mono text-neon-cyan">admin</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!staffRole) {
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
          <span className="text-xs text-muted-foreground">Hospital Staff Portal</span>
        </motion.div>
        <div className="pt-12">
          <HospitalRoleSelect onSelectRole={setStaffRole} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong h-12 flex items-center px-4 gap-4"
      >
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-cyan" />
          <span className="font-heading font-semibold text-sm neon-text-cyan">Arogya AI</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <span className="text-xs text-muted-foreground capitalize">
          {staffRole === "tech" ? "Technologist" : staffRole} Portal
        </span>

        {staffRole === "doctor" && (
          <>
            <div className="h-5 w-px bg-border" />
            <div className="flex gap-1">
              <button
                onClick={() => setDoctorTab("intake")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  doctorTab === "intake"
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> New Order
              </button>
              <button
                onClick={() => setDoctorTab("results")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  doctorTab === "results"
                    ? "bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" /> Results
              </button>
            </div>
          </>
        )}
      </motion.div>

      <div className="pt-12">
        <AnimatePresence mode="wait">
          {staffRole === "doctor" && doctorTab === "intake" && (
            <motion.div key="doctor-intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoctorPortal />
            </motion.div>
          )}
          {staffRole === "doctor" && doctorTab === "results" && (
            <motion.div key="doctor-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoctorResults />
            </motion.div>
          )}
          {staffRole === "tech" && (
            <motion.div key="tech" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TechStation />
            </motion.div>
          )}
          {staffRole === "radiologist" && (
            <motion.div key="radiologist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RadiologistDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HospitalPortal;

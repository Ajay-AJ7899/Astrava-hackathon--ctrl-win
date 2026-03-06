import { motion } from "framer-motion";
import { Stethoscope, Monitor, ScanSearch } from "lucide-react";

type StaffRole = "doctor" | "tech" | "radiologist";

interface HospitalRoleSelectProps {
  onSelectRole: (role: StaffRole) => void;
}

const roles = [
  {
    id: "doctor" as StaffRole,
    title: "Doctor",
    subtitle: "Intake Portal",
    description: "Order scans, enter clinical notes, and review patient lab reports",
    icon: Stethoscope,
    gradient: "from-neon-cyan/20 to-neon-cyan/5",
    borderColor: "border-neon-cyan/30",
    iconColor: "text-neon-cyan",
  },
  {
    id: "tech" as StaffRole,
    title: "Technologist",
    subtitle: "Upload Station",
    description: "Upload X-ray scans and trigger AI-powered diagnostic analysis",
    icon: Monitor,
    gradient: "from-neon-violet/20 to-neon-violet/5",
    borderColor: "border-neon-violet/30",
    iconColor: "text-neon-violet",
  },
  {
    id: "radiologist" as StaffRole,
    title: "Radiologist",
    subtitle: "Triage Dashboard",
    description: "AI-prioritized worklist with heatmap overlays and clinical context",
    icon: ScanSearch,
    gradient: "from-neon-magenta/20 to-neon-magenta/5",
    borderColor: "border-neon-magenta/30",
    iconColor: "text-neon-magenta",
  },
];

const HospitalRoleSelect = ({ onSelectRole }: HospitalRoleSelectProps) => {
  return (
    <div className="min-h-[calc(100vh-3rem)] gradient-mesh flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-heading font-bold mb-2">Select Your Role</h2>
        <p className="text-muted-foreground">Choose your station to begin</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {roles.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
            whileHover={{ scale: 1.04, y: -8 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectRole(role.id)}
            className={`card-3d glass ${role.borderColor} rounded-2xl p-8 text-left cursor-pointer group relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-6 transition-shadow duration-500">
                <role.icon className={`w-8 h-8 ${role.iconColor}`} />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-1">{role.title}</h3>
              <p className={`text-sm ${role.iconColor} font-medium mb-3`}>{role.subtitle}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{role.description}</p>
              <div className={`mt-6 flex items-center gap-2 ${role.iconColor} text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <span>Enter Portal</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HospitalRoleSelect;

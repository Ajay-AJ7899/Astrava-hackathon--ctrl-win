import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, FileText, FlaskConical, Send, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addPatient, generatePatientId, getLabRecords, type LabRecord } from "@/store/patientStore";
import { toast } from "sonner";

const DoctorPortal = () => {
  const [patientId, setPatientId] = useState(generatePatientId());
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [checkedId, setCheckedId] = useState("");

  const checkLabRecords = () => {
    const records = getLabRecords(patientId);
    setLabRecords(records);
    setCheckedId(patientId);
    if (records.length === 0) {
      toast.info("No previous lab records found for this patient.");
    } else {
      toast.success(`Found ${records.length} lab records.`);
    }
  };

  const handleOrderScan = () => {
    if (!name || !age || !clinicalNotes) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addPatient({
      id: patientId,
      name,
      age: parseInt(age),
      status: "Awaiting Scan",
      chiefComplaint: clinicalNotes.split(".")[0] || clinicalNotes,
      clinicalNotes,
      labRecords: labRecords.length > 0 ? labRecords : getLabRecords(patientId),
      createdAt: new Date(),
    });
    toast.success(`Scan ordered for ${name} (${patientId})`);
    // Reset
    setPatientId(generatePatientId());
    setName("");
    setAge("");
    setClinicalNotes("");
    setLabRecords([]);
    setCheckedId("");
  };

  const getFlagIcon = (flag?: string) => {
    if (flag === "critical") return <XCircle className="w-4 h-4 text-destructive" />;
    if (flag === "abnormal") return <AlertTriangle className="w-4 h-4 text-neon-orange" />;
    return <CheckCircle className="w-4 h-4 text-neon-green" />;
  };

  return (
    <div className="min-h-screen gradient-mesh p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-neon-cyan" />
            <span>Doctor's Intake Portal</span>
          </h1>
          <p className="text-muted-foreground mt-1">Create a new scan order and review patient history</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-cyan" />
              Patient Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Patient ID</label>
                <Input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="bg-muted/30 border-border/50 focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Full Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter patient name"
                  className="bg-muted/30 border-border/50 focus:border-neon-cyan/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Age *</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="bg-muted/30 border-border/50 focus:border-neon-cyan/50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Chief Complaint & Clinical Notes *</label>
              <Textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Patient presents with shortness of breath and fever..."
                rows={5}
                className="bg-muted/30 border-border/50 focus:border-neon-cyan/50 resize-none"
              />
            </div>

            <Button
              onClick={handleOrderScan}
              className="w-full bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/90 font-semibold text-base py-5"
            >
              <Send className="w-5 h-5 mr-2" />
              Order Scan
            </Button>
          </motion.div>

          {/* Lab Records Checker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-neon-violet" />
              Lab Report Checker
            </h2>

            <div className="flex gap-3 mb-6">
              <Input
                value={patientId}
                readOnly
                className="bg-muted/30 border-border/50 flex-1"
              />
              <Button
                onClick={checkLabRecords}
                variant="outline"
                className="border-neon-violet/30 text-neon-violet hover:bg-neon-violet/10"
              >
                Check Records
              </Button>
            </div>

            {checkedId && labRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  Found <span className="text-neon-violet font-semibold">{labRecords.length}</span> records for {checkedId}
                </p>
                <div className="space-y-2">
                  {labRecords.map((rec, i) => (
                    <div
                      key={i}
                      className={`glass rounded-lg p-3 flex items-center justify-between ${
                        rec.flag === "critical" ? "priority-critical" : rec.flag === "abnormal" ? "priority-high" : "priority-normal"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{rec.test}</p>
                        <p className="text-xs text-muted-foreground">{rec.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{rec.result}</span>
                        {getFlagIcon(rec.flag)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {checkedId && labRecords.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No previous lab records found</p>
                <p className="text-xs mt-1">Try PAT-001, PAT-002, or PAT-003 for demo data</p>
              </div>
            )}

            {!checkedId && (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Click "Check Records" to search</p>
                <p className="text-xs mt-1">Demo IDs: PAT-001, PAT-002, PAT-003</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPortal;

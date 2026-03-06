import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Upload, Zap, ImageIcon, Clock, User, FlaskConical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientsByStatus } from "@/hooks/usePatients";
import { usePatients } from "@/hooks/usePatients";
import { updatePatient, generateAIReasoning, addLabRecords, type LabRecord } from "@/store/patientStore";
import { toast } from "sonner";

interface LabEntry {
  test: string;
  result: string;
  flag: "normal" | "abnormal" | "critical";
}

const TechStation = () => {
  const pendingPatients = usePatientsByStatus("Awaiting Scan");
  const allPatients = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lab report state
  const [labPatientId, setLabPatientId] = useState("");
  const [labEntries, setLabEntries] = useState<LabEntry[]>([{ test: "", result: "", flag: "normal" }]);

  const addLabEntry = () => {
    setLabEntries([...labEntries, { test: "", result: "", flag: "normal" }]);
  };

  const removeLabEntry = (index: number) => {
    setLabEntries(labEntries.filter((_, i) => i !== index));
  };

  const updateLabEntry = (index: number, field: keyof LabEntry, value: string) => {
    setLabEntries(labEntries.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const handleSubmitLabs = () => {
    const id = labPatientId.trim().toUpperCase();
    if (!id) {
      toast.error("Please enter a Patient ID.");
      return;
    }
    const validEntries = labEntries.filter((e) => e.test && e.result);
    if (validEntries.length === 0) {
      toast.error("Please add at least one lab test with results.");
      return;
    }
    const records: LabRecord[] = validEntries.map((e) => ({
      date: new Date().toISOString().split("T")[0],
      test: e.test,
      result: e.result,
      flag: e.flag,
    }));
    addLabRecords(id, records);

    // Also update patient object if it exists
    const patient = allPatients.find((p) => p.id === id);
    if (patient) {
      updatePatient(id, { labRecords: [...patient.labRecords, ...records] });
    }

    toast.success(`${records.length} lab record(s) added for ${id}`);
    setLabPatientId("");
    setLabEntries([{ test: "", result: "", flag: "normal" }]);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a JPG or PNG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      toast.success("Image uploaded successfully.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleProcess = async () => {
    if (!selectedPatient || !uploadedImage) {
      toast.error("Select a patient and upload an image first.");
      return;
    }
    setIsProcessing(true);

    await new Promise((r) => setTimeout(r, 2500));

    const patient = pendingPatients.find((p) => p.id === selectedPatient);
    const criticalLabCount = patient?.labRecords.filter((l) => l.flag === "critical").length || 0;
    const abnormalLabCount = patient?.labRecords.filter((l) => l.flag === "abnormal").length || 0;

    const imageRisk = Math.round(40 + Math.random() * 55);
    const labRisk = Math.min(100, Math.round(criticalLabCount * 35 + abnormalLabCount * 15 + Math.random() * 10));
    const urgencyScore = Math.round(imageRisk * 0.5 + labRisk * 0.5);

    let priority: "CRITICAL" | "HIGH" | "NORMAL" = "NORMAL";
    if (urgencyScore >= 70 || imageRisk >= 80 || labRisk >= 80) priority = "CRITICAL";
    else if (urgencyScore >= 45) priority = "HIGH";

    const aiReasoning = generateAIReasoning(patient!, imageRisk, labRisk, priority);

    updatePatient(selectedPatient, {
      status: "Ready for Read",
      scanImage: uploadedImage,
      heatmapImage: uploadedImage,
      imageRisk,
      labRisk,
      urgencyScore,
      priority,
      aiReasoning,
    });

    toast.success(`AI analysis complete. Priority: ${priority}`);
    setIsProcessing(false);
    setSelectedPatient(null);
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen gradient-mesh p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Monitor className="w-8 h-8 text-neon-violet" />
            <span>Technologist Upload Station</span>
          </h1>
          <p className="text-muted-foreground mt-1">Upload X-ray scans, add lab reports, and trigger AI-powered analysis</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-neon-orange" />
              Pending Orders
              <span className="ml-auto bg-neon-orange/20 text-neon-orange text-xs px-2 py-0.5 rounded-full font-mono">
                {pendingPatients.length}
              </span>
            </h2>

            <div className="space-y-2">
              {pendingPatients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pending orders</p>
                </div>
              )}
              {pendingPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p.id)}
                  className={`w-full text-left glass rounded-xl p-4 transition-all duration-200 ${
                    selectedPatient === p.id
                      ? "border-neon-violet/50 neon-glow-violet"
                      : "hover:border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.id} • Age {p.age}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.chiefComplaint}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Scan Uploader */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-neon-violet" />
                Scan Uploader
              </h2>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                  isDragging
                    ? "border-neon-violet bg-neon-violet/5"
                    : uploadedImage
                    ? "border-neon-green/30"
                    : "border-border/50 hover:border-neon-violet/30"
                } ${uploadedImage ? "p-4" : "p-12"}`}
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded scan"
                      className="w-full max-h-80 object-contain rounded-lg"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-muted/80 hover:bg-destructive/80 text-foreground rounded-full w-8 h-8 flex items-center justify-center transition-colors text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground mb-2">Drag & drop X-ray image here</p>
                    <p className="text-xs text-muted-foreground/60 mb-4">Accepts JPG, PNG (represents DICOM feed in production)</p>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-violet/10 text-neon-violet border border-neon-violet/20 hover:bg-neon-violet/20 transition-colors text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        Browse Files
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <Button
                onClick={handleProcess}
                disabled={!selectedPatient || !uploadedImage || isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-neon-violet to-neon-magenta text-foreground hover:opacity-90 font-semibold text-base py-5 disabled:opacity-30"
              >
                {isProcessing ? (
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5" />
                    Processing AI Analysis...
                  </motion.div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Process & Send to Radiology
                  </>
                )}
              </Button>

              {selectedPatient && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Selected: {pendingPatients.find((p) => p.id === selectedPatient)?.name || selectedPatient}
                </p>
              )}
            </div>

            {/* Lab Report Entry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-neon-green" />
                Add Lab Reports
              </h2>

              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-1.5 block">Patient ID</label>
                <Input
                  value={labPatientId}
                  onChange={(e) => setLabPatientId(e.target.value)}
                  placeholder="e.g. PAT-001"
                  className="bg-muted/30 border-border/50 focus:border-neon-green/50 font-mono"
                />
              </div>

              <div className="space-y-3 mb-4">
                <AnimatePresence>
                  {labEntries.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex gap-2 items-end"
                    >
                      <div className="flex-1">
                        {i === 0 && <label className="text-xs text-muted-foreground mb-1 block">Test Name</label>}
                        <Input
                          value={entry.test}
                          onChange={(e) => updateLabEntry(i, "test", e.target.value)}
                          placeholder="e.g. WBC Count"
                          className="bg-muted/30 border-border/50 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        {i === 0 && <label className="text-xs text-muted-foreground mb-1 block">Result</label>}
                        <Input
                          value={entry.result}
                          onChange={(e) => updateLabEntry(i, "result", e.target.value)}
                          placeholder="e.g. 14,200/μL"
                          className="bg-muted/30 border-border/50 text-sm"
                        />
                      </div>
                      <div className="w-32">
                        {i === 0 && <label className="text-xs text-muted-foreground mb-1 block">Flag</label>}
                        <Select value={entry.flag} onValueChange={(v) => updateLabEntry(i, "flag", v)}>
                          <SelectTrigger className="bg-muted/30 border-border/50 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {labEntries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLabEntry(i)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={addLabEntry}
                  className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Row
                </Button>
                <Button
                  onClick={handleSubmitLabs}
                  className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/30 font-semibold"
                >
                  <FlaskConical className="w-4 h-4 mr-2" /> Submit Lab Reports
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TechStation;

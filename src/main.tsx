import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPatients } from "./store/patientStore.ts";

// Hydrate the patient store from MongoDB on startup (non-blocking)
initPatients().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);

import { useSyncExternalStore } from "react";
import { subscribe, getPatients, type Patient } from "@/store/patientStore";

export function usePatients(): readonly Patient[] {
  return useSyncExternalStore(subscribe, getPatients, getPatients);
}

export function usePatientsByStatus(status: Patient["status"]) {
  const patients = usePatients();
  return patients.filter((p) => p.status === status);
}

"use client";

import type { DirectorState } from "@/types/director";

export const directorStorageKey = "photoclinic-director-state";

export const defaultDirectorState: DirectorState = {
  basic: {
    hospitalName: "",
    managerName: "",
    phone: "",
    email: "",
    websiteUrl: ""
  },
  style: {
    hospitalType: "",
    imageTypes: [],
    moodTypes: [],
    spaceTone: "",
    targetPatient: ""
  },
  reference: {
    referenceUrl: "",
    concernText: "",
    uploadedReferences: []
  },
  generator: {
    mode: "scene",
    department: "피부과",
    scene: "",
    doctorDescription: "",
    content: "",
    interior: "",
    staffPresence: "",
    patientDescription: "",
    mood: "따뜻하고 자연스러운",
    cameraStyle: "실제 병원 홍보 사진 같은 사실적인 사진",
    usage: "홈페이지와 SNS 홍보용",
    extraRequest: ""
  },
  generatedImages: []
};

export function loadDirectorState(): DirectorState {
  if (typeof window === "undefined") return defaultDirectorState;
  const raw = window.localStorage.getItem(directorStorageKey);
  if (!raw) return defaultDirectorState;
  try {
    const parsed = JSON.parse(raw) as Partial<DirectorState>;
    return {
      ...defaultDirectorState,
      ...parsed,
      basic: { ...defaultDirectorState.basic, ...parsed.basic },
      style: { ...defaultDirectorState.style, ...parsed.style },
      reference: { ...defaultDirectorState.reference, ...parsed.reference },
      generator: { ...defaultDirectorState.generator, ...parsed.generator }
    } as DirectorState;
  } catch {
    return defaultDirectorState;
  }
}

export function saveDirectorState(state: DirectorState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(directorStorageKey, JSON.stringify(state));
}

export function patchDirectorState(patch: Partial<DirectorState>) {
  const next = { ...loadDirectorState(), ...patch };
  saveDirectorState(next);
  return next;
}

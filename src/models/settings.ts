export type StimulusMode = "visual" | "audio" | "both";

export const EVENT_DURATION_MS = 3000;

export const MODE_LABELS: Record<StimulusMode, string> = {
  visual: "Visuellt",
  audio: "Ljud",
  both: "Visuellt och ljud",
};

// Ett bokstavsljud för varje rutnummer, 0–8.
export const LETTERS = [
  "A",
  "F",
  "H",
  "K",
  "L",
  "O",
  "R",
  "S",
  "X",
];
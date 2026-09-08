import type { TabId } from "./command-center";

export const BRACKETS: Record<TabId, { label: string; code: string }> = {
  "mission-control": { label: "MISSION", code: "01" },
  "cnn-analysis": { label: "ANALYSIS", code: "02" },
  "region-compare": { label: "COMPARE", code: "03" },
  "global-burning": { label: "GLOBAL", code: "04" },
  "model-performance": { label: "PERFORMANCE", code: "05" },
  "energy-economics": { label: "ENERGY", code: "06" },
  "environmental-impact": { label: "IMPACT", code: "07" },
  "enforcement-dispatch": { label: "DISPATCH", code: "08" },
};
export type Status =
  | "CRITICAL"
  | "HIGH RISK"
  | "WATCH"
  | "MODERATE"
  | "LOW RISK"
  | "CLEAR";

export type IncidentStatus = "CONFIRMED" | "UNDER REVIEW" | "MONITORING";

export interface FireCluster {
  lat: number;
  lon: number;
  intensity: number;
  radius: number;
}

export interface RegionBandValues {
  [band: string]: number;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  status: Status;
  severity: number;
  aqi: number;
  pm25: number;
  nbr: number;
  ndvi: number;
  bands: RegionBandValues;
  fire_clusters: FireCluster[];
  burn_history: number[];
  smoke_plume_km: number;
  active_fires: number;
  area_affected_ha: number;
  crops_affected: string;
  residue_mt: number;
  burnt_pct: number;
  energy_potential_gj: number;
}

export interface Country {
  name: string;
  flag: string;
  aqi: number;
  pm25: number;
  rank: number;
  burn_pct: number;
  residue_mt: number;
  co2_mt: number;
  energy_pj: number;
  power_mw: number;
  status: string;
}

export interface IncidentTimelineStep {
  time: string;
  msg: string;
}

export interface Incident {
  id: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  confidence: number;
  classification: string;
  status: IncidentStatus;
  burnAreaHa: number;
  timeUtc: string;
  crop: string;
  biomassTonnes: number;
  co2Tonnes: number;
  pm25Surge: number;
  energyTj: number;
  threatLevel: "CRITICAL" | "HIGH RISK" | "WATCH";
  ndviDelta: number;
  perimeterKm: number;
  peakActivation: number;
  burnCoords: { cx: number; cy: number; r: number };
  timeline: IncidentTimelineStep[];
}

export interface ModelPerformance {
  epochs: number[];
  trainAcc: number[];
  valAcc: number[];
  trainLoss: number[];
  valLoss: number[];
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PixGlyph } from "@/components/pix-glyph";
import { BRACKETS } from "./tab-defs";
import { MissionControl } from "./mission-control";
import { AnalysisTab } from "./analysis-tab";
import { CompareTab } from "./compare-tab";
import { GlobalTab } from "./global-tab";
import { PerformanceTab } from "./performance-tab";
import { EnergyTab } from "./energy-tab";
import { ImpactTab } from "./impact-tab";
import { DispatchTab } from "./dispatch-tab";
import { GLOBAL_COUNTRIES, REGIONS } from "@/lib/regions";
import { INCIDENTS } from "@/lib/incidents";
import { LiveData } from "@/lib/live-data";
import { cn } from "@/lib/utils";
import type { Country, Incident, Region } from "@/lib/types";

export type TabId =
  | "mission-control"
  | "cnn-analysis"
  | "region-compare"
  | "global-burning"
  | "model-performance"
  | "energy-economics"
  | "environmental-impact"
  | "enforcement-dispatch";

const TAB_ORDER: TabId[] = [
  "mission-control",
  "cnn-analysis",
  "region-compare",
  "global-burning",
  "model-performance",
  "energy-economics",
  "environmental-impact",
  "enforcement-dispatch",
];

const simulate = (val: number, pct: number) => {
  const delta = val * pct * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(val + delta));
};

interface Toast {
  id: number;
  msg: string;
  type: "info" | "success" | "alert" | "warning";
}

export function CommandCenter() {
  const [tab, setTab] = useState<TabId>("mission-control");
  const [regions, setRegions] = useState<Region[]>(() => REGIONS.map((r) => ({ ...r })));
  const [countries, setCountries] = useState<Country[]>(() => GLOBAL_COUNTRIES.map((c) => ({ ...c })));
  const [timeline, setTimeline] = useState<{ labels: string[]; series: { name: string; data: (number | null)[] }[] } | null>(null);
  const [regionId, setRegionId] = useState("punjab");
  const [incidentId, setIncidentId] = useState("PB-2847");
  const [kpis, setKpis] = useState({ fires: 0, area: "0 ha", smoke: "0 km", aqi: 0, energy: "0 GJ", live: "—" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [clock, setClock] = useState("00:00:00 UTC");
  const toastId = useRef(0);
  const baseRef = useRef<{ fires: number; area: number; smoke: number } | null>(null);
  const driftRef = useRef({ fires: 0, area: 0, smoke: 0 });
  const kpiValRef = useRef<{ [k: string]: string }>({});
  const regsRef = useRef(regions);

  useEffect(() => {
    regsRef.current = regions;
  }, [regions]);


  const pushToast = useCallback((msg: string, type: Toast["type"] = "info", duration = 4000) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const triggerAlert = useCallback(
    (inc: Incident) => {
      pushToast(`Fire detected at ${inc.state} - ${inc.district}. Alerting authorities...`, "alert", 6000);
      setAlertOpen(true);
    },
    [pushToast],
  );

  const animateKpi = (key: string, val: string) => {
    if (kpiValRef.current[key] === val) return;
    kpiValRef.current[key] = val;
    setKpis((k) => ({ ...k, [key]: val }));
  };

  // Live AQI + 90-day timeline
  useEffect(() => {
    let mounted = true;
    LiveData.init()
      .then((res) => {
        if (!mounted) return;
        setRegions(res.regions);
        setCountries(res.countries);
        setTimeline(res.timeline);
        if (res.liveCount > 0) pushToast(`Live AQI updated for ${res.liveCount} locations`, "success", 3000);
      })
      .catch((e) => {
        if (mounted) console.error("[LiveData] init failed:", e);
      });
    return () => {
      mounted = false;
    };
  }, [pushToast]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toISOString().substring(11, 19) + " UTC"), 1000);
    return () => clearInterval(t);
  }, []);

  // KPI simulation every 2.5s with drift accumulator
  useEffect(() => {
    const tick = () => {
      let totalFires = 0;
      let totalArea = 0;
      let totalSmoke = 0;
      let totalAqi = 0;
      let totalEnergy = 0;
      const next = regsRef.current.map((r) => {
        const fires = simulate(r.active_fires, 0.004);
        const area = simulate(r.area_affected_ha, 0.003);
        const smoke = simulate(r.smoke_plume_km, 0.008);
        totalFires += fires;
        totalArea += area;
        totalSmoke += smoke;
        totalAqi += r.aqi;
        totalEnergy += r.energy_potential_gj;
        return { ...r, active_fires: fires, area_affected_ha: area, smoke_plume_km: smoke };
      });
      setRegions(next);

      const avgAqi = Math.round(totalAqi / next.length);
      if (!baseRef.current) {
        baseRef.current = { fires: totalFires, area: totalArea, smoke: totalSmoke };
        animateKpi("fires", String(Math.round(totalFires)));
        animateKpi("area", `${Math.round(totalArea).toLocaleString()} ha`);
        animateKpi("smoke", `${Math.round(totalSmoke)} km`);
      } else {
        driftRef.current.fires += totalFires - baseRef.current.fires;
        driftRef.current.area += totalArea - baseRef.current.area;
        driftRef.current.smoke += totalSmoke - baseRef.current.smoke;
        if (Math.abs(driftRef.current.fires) / baseRef.current.fires >= 0.01) {
          baseRef.current.fires += Math.round(driftRef.current.fires);
          driftRef.current.fires = 0;
          animateKpi("fires", String(Math.round(baseRef.current.fires)));
        }
        if (Math.abs(driftRef.current.area) / baseRef.current.area >= 0.01) {
          baseRef.current.area += Math.round(driftRef.current.area);
          driftRef.current.area = 0;
          animateKpi("area", `${Math.round(baseRef.current.area).toLocaleString()} ha`);
        }
        if (Math.abs(driftRef.current.smoke) / baseRef.current.smoke >= 0.01) {
          baseRef.current.smoke += Math.round(driftRef.current.smoke);
          driftRef.current.smoke = 0;
          animateKpi("smoke", `${Math.round(baseRef.current.smoke)} km`);
        }
      }
      animateKpi("aqi", String(avgAqi));
      animateKpi("energy", `${(totalEnergy / 1e3).toFixed(1)}k GJ`);
      animateKpi("live", new Date().toISOString().substring(11, 19) + " UTC");
    };
    const i = setInterval(tick, 2500);
    const t = setTimeout(tick, 0);
    return () => {
      clearInterval(i);
      clearTimeout(t);
    };
  }, []);

  const selectRegion = useCallback((id: string) => setRegionId(id), []);
  const selectIncident = useCallback((id: string) => setIncidentId(id), []);

  const currentRegion = regions.find((r) => r.id === regionId) || regions[0];
  const currentIncident = INCIDENTS.find((i) => i.id === incidentId) || INCIDENTS[0];

  return (
    <main className="grid-bg min-h-[100svh] bg-black">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b hairline bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <PixGlyph type="bracket-l" className="h-4 w-2 text-lime" />
            <span className="font-display text-base tracking-tight md:text-lg">PRITHVI_SENTINEL</span>
            <PixGlyph type="bracket-r" className="h-4 w-2 text-lime" />
            <span className="micro-label hidden text-[#7D7D7D] lg:inline">satellite fire command</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 md:flex">
              <span className="live-dot" />
              <span className="micro-label text-lime">{kpis.live}</span>
            </div>
            <div className="micro-label text-[#7D7D7D] hidden sm:block">{clock}</div>
          </div>
        </div>
      </header>

      {/* TAB NAV */}
      <nav className="sticky top-[57px] z-30 border-b hairline bg-black/85 backdrop-blur-md">
        <div className="no-scrollbar mx-auto flex max-w-[1600px] gap-6 overflow-x-auto px-4 py-0 md:px-8">
          {TAB_ORDER.map((id) => {
            const def = BRACKETS[id];
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 py-3 transition-colors",
                  active ? "text-lime" : "text-[#7D7D7D] hover:text-[#F2F2F2]",
                )}
              >
                <PixGlyph type="diamond" className={cn("h-2.5 w-2.5", active ? "text-lime" : "text-[#7D7D7D]")} />
                <span className="font-mono text-[10px] uppercase tracking-[0.4px] md:text-[11px]">{def.label}</span>
                <span className={cn("font-mono text-[9px]", active ? "text-lime" : "text-[#4a4a4a]")}>{def.code}</span>
                {active && <span className="absolute inset-x-0 bottom-0 h-px bg-lime" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* KPI STRIP */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-px bg-white/[0.06] md:grid-cols-5">
          {[
            { label: "ACTIVE FIRE CLUSTERS", val: kpis.fires, accent: "text-neon-red", icon: "!" },
            { label: "BURNT AREA MONITORED", val: kpis.area, accent: "text-neon-orange", icon: "#" },
            { label: "NATIONAL AVG AQI", val: kpis.aqi, accent: "text-lime", icon: "live" },
            { label: "TOTAL SMOKE PLUME", val: kpis.smoke, accent: "text-neon-cyan", icon: "~" },
            { label: "RESIDUE ENERGY POTENTIAL", val: kpis.energy, accent: "text-neon-green", icon: "e" },
          ].map((k) => (
            <div key={k.label} className="flex items-center justify-between bg-black px-5 py-4 md:px-8">
              <div>
                <div className="micro-label text-[#7D7D7D]">{k.label}</div>
                <div className={cn("mt-1 font-display text-xl md:text-2xl", k.accent)}>{k.val}</div>
              </div>
              <PixGlyph type="bracket-r" className="h-4 w-2 text-[#7D7D7D]" />
            </div>
          ))}
        </div>
      </section>

      {/* TAB VIEWS */}
      <section className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
        {tab === "mission-control" && (
          <MissionControl
            regions={regions}
            incidents={INCIDENTS}
            regionId={regionId}
            incidentId={incidentId}
            onSelectRegion={selectRegion}
            onSelectIncident={selectIncident}
            onToast={pushToast}
            onTriggerAlert={triggerAlert}
            onSwitchTab={setTab}
            currentRegion={currentRegion}
          />
        )}
        {tab === "cnn-analysis" && (
          <AnalysisTab
            incident={currentIncident}
            onTriggerAlert={triggerAlert}
            onToast={pushToast}
          />
        )}
        {tab === "region-compare" && <CompareTab regions={regions} />}
        {tab === "global-burning" && <GlobalTab countries={countries} timeline={timeline} />}
        {tab === "model-performance" && <PerformanceTab />}
        {tab === "energy-economics" && <EnergyTab countries={countries} />}
        {tab === "environmental-impact" && <ImpactTab incident={currentIncident} />}
        {tab === "enforcement-dispatch" && (
          <DispatchTab
            regions={regions}
            onToast={pushToast}
            onTriggerAlert={triggerAlert}
          />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <PixGlyph type="diamond" className="h-3 w-3 text-lime" />
            <span className="micro-label text-[#7D7D7D]">PRITHVI SENTINEL · EVS PILOT</span>
          </div>
          <p className="micro-label text-[#7D7D7D]">AIR QUALITY REAL · BURN DETECTION SIMULATED · DEMONSTRATION ONLY</p>
        </div>
      </footer>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 border px-4 py-3 backdrop-blur-md",
              t.type === "alert"
                ? "border-neon-red/40 bg-neon-red/10 text-neon-red"
                : t.type === "success"
                  ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                  : t.type === "warning"
                    ? "border-neon-orange/40 bg-neon-orange/10 text-neon-orange"
                    : "border-white/15 bg-black/90 text-[#F2F2F2]",
            )}
          >
            <PixGlyph type={t.type === "alert" ? "bracket-l" : "diamond"} className={cn("mt-1 h-3 w-3 shrink-0")} />
            <p className="text-xs leading-relaxed">{t.msg}</p>
          </div>
        ))}
      </div>

      {/* Alert Modal */}
      {alertOpen && (
        <AlertModal incident={currentIncident} onClose={() => setAlertOpen(false)} />
      )}

    </main>
  );
}

function AlertModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const [steps, setSteps] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    [1, 2, 3].forEach((s, i) => {
      timers.push(window.setTimeout(() => setSteps(s), (i + 1) * 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md border hairline bg-[#050505]">
        <div className="flex items-center justify-between border-b hairline px-5 py-4">
          <div className="flex items-center gap-2">
            <PixGlyph type="bracket-l" className="h-4 w-2 text-neon-red" />
            <span className="font-display text-lg text-neon-red">FIRE ALERT</span>
          </div>
          <button onClick={onClose} className="micro-label text-[#7D7D7D] hover:text-[#F2F2F2]">[x]</button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="micro-label text-lime">{incident.id} · {incident.status}</div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="micro-label text-[#7D7D7D]">Location</div>
              <div>{incident.state} — {incident.district}</div>
            </div>
            <div>
              <div className="micro-label text-[#7D7D7D]">Confidence</div>
              <div className="text-neon-red">{incident.confidence}%</div>
            </div>
            <div>
              <div className="micro-label text-[#7D7D7D]">Burn Area</div>
              <div>{incident.burnAreaHa} ha</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "VERIFY SATELLITE CONFIRMATION", done: steps >= 1 },
              { label: "DISPATCH TO AUTHORITIES", done: steps >= 2 },
              { label: "AUTHORITIES NOTIFIED", done: steps >= 3 },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center justify-between border hairline px-4 py-3">
                <span className="micro-label">{s.label}</span>
                <span className={s.done ? "micro-label text-neon-green" : "micro-label text-[#7D7D7D]"}>
                  {s.done ? "[NOTIFIED]" : `[STEP ${i + 1}]`}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t hairline px-5 py-4">
          <button onClick={onClose} className="micro-label text-[#7D7D7D] hover:text-[#F2F2F2]">[ACKNOWLEDGE]</button>
        </div>
      </div>
    </div>
  );
}
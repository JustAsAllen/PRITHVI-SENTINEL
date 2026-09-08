"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel, StatusBadge } from "./panel";
import { ChartJs, MONTHS } from "./chart";
import { cn } from "@/lib/utils";
import type { Incident, Region } from "@/lib/types";
import type { TabId } from "./command-center";

const RegionMap = dynamic(() => import("./region-map").then((m) => m.RegionMap), {
  ssr: false,
  loading: () => (
    <div className="grid-bg flex h-full min-h-[320px] items-center justify-center">
      <span className="micro-label text-[#7D7D7D]">[ ACQUIRING SATELLITE TILE... ]</span>
    </div>
  ),
});

function TileGrid({ region }: { region: Region }) {
  const isBurning = region.status === "CRITICAL" || region.status === "HIGH RISK";
  const cells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const isFire = isBurning && row >= 3 && row <= 6 && col >= 3 && col <= 6;
    const dist = Math.sqrt((row - 4.5) ** 2 + (col - 4.5) ** 2);
    const noise = Math.abs(Math.sin(i * 12.9898 + 78.233)) % 1;
    if (isFire) {
      const intensity = Math.max(0, 1 - dist / 5) * (0.8 + noise * 0.2);
      const red = Math.min(255, Math.floor(200 + 55 * intensity));
      const green = Math.min(255, Math.floor(60 + 80 * (1 - intensity)));
      return `rgb(${red}, ${green}, 20)`;
    }
    const ndvi = region.ndvi * (0.8 + noise * 0.4);
    const red = Math.floor(40 + 60 * (1 - ndvi));
    const green = Math.floor(70 + 130 * ndvi);
    return `rgb(${red}, ${green}, 50)`;
  });

  return (
    <div className="grid grid-cols-10 gap-0.5">
      {cells.map((c, i) => (
        <div key={i} className="aspect-square" style={{ background: c }} />
      ))}
    </div>
  );
}

function BandBars({ region }: { region: Region }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(region.bands).map(([name, val]) => {
        const pct = Math.min(100, Math.round(val * 100));
        const color = pct > 70 ? "bg-neon-red" : pct > 40 ? "bg-neon-orange" : "bg-neon-cyan";
        return (
          <div key={name} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-[#7D7D7D]">{name}</span>
            <div className="h-1.5 flex-1 overflow-hidden bg-white/[0.04]">
              <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 text-right text-[#7D7D7D]">{val.toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MissionControl({
  regions,
  incidents,
  regionId,
  incidentId,
  onSelectRegion,
  onSelectIncident,
  onToast,
  onTriggerAlert,
  onSwitchTab,
  currentRegion,
}: {
  regions: Region[];
  incidents: Incident[];
  regionId: string;
  incidentId: string;
  onSelectRegion: (id: string) => void;
  onSelectIncident: (id: string) => void;
  onToast: (msg: string, type?: "info" | "success" | "alert" | "warning") => void;
  onTriggerAlert: (inc: Incident) => void;
  onSwitchTab: (tab: TabId) => void;
  currentRegion: Region;
}) {
  const [pipelineActive, setPipelineActive] = useState(false);

  const runScan = () => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc || pipelineActive) return;
    setPipelineActive(true);
    onToast(`Running scan on ${inc.id}...`, "info");
    setTimeout(() => {
      setPipelineActive(false);
      if (inc.status === "CONFIRMED") onTriggerAlert(inc);
      onSwitchTab("cnn-analysis");
    }, 2200);
  };

  const selectedInc = incidents.find((i) => i.id === incidentId) || incidents[0];

  const monitorData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Burn Severity",
        data: currentRegion.burn_history,
        borderColor: "#ff2d55",
        backgroundColor: "rgba(255,45,85,0.08)",
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-5">
      {/* Section label */}
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">MISSION CONTROL</span>
        <span className="micro-label text-[#7D7D7D]">live KPI · theatre · feed</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_260px]">
        {/* Region List */}
        <Panel title="REGIONS" code="9" className="h-fit max-h-[500px] overflow-y-auto no-scrollbar">
          <div className="divide-y divide-white/[0.06]">
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRegion(r.id)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  r.id === regionId ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{r.name.split("(")[0]}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1 flex gap-4 text-xs text-[#7D7D7D]">
                  <span>AQI: <span className={r.status === "CRITICAL" ? "text-neon-red" : ""}>{r.aqi}</span></span>
                  <span>Fires: {r.active_fires}</span>
                  <span>NBR: {r.nbr}</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Map + Telemetry */}
        <div className="space-y-4">
          <Panel code="1" title={`${currentRegion.name}`}>
            <div className="flex items-center justify-between px-4 pt-3">
              <div>
                <span className="micro-label text-[#7D7D7D]">LAT: {currentRegion.lat.toFixed(4)} · LON: {currentRegion.lon.toFixed(4)}</span>
              </div>
              <StatusBadge status={currentRegion.status} />
            </div>
            <div className="px-4 py-3">
              <RegionMap
                regions={regions}
                incidents={incidents}
                regionId={regionId}
                incidentId={incidentId}
                onSelectRegion={onSelectRegion}
                onSelectIncident={onSelectIncident}
              />
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-3">
            <Panel title="S-2 TILE" code="SIM">
              <div className="p-4">
                <TileGrid region={currentRegion} />
                <div className="mt-2 flex items-center justify-between text-xs text-[#7D7D7D]">
                  <span>10×10 px</span>
                  <span>NDVI: {currentRegion.ndvi}</span>
                </div>
              </div>
            </Panel>

            <Panel title="SPECTRAL BANDS" code="B02-B12">
              <div className="p-4">
                <BandBars region={currentRegion} />
              </div>
            </Panel>

            <Panel title="MONITOR" code="CHART">
              <div className="p-4">
                <ChartJs type="line" data={monitorData} height={170} />
              </div>
            </Panel>
          </div>
        </div>

        {/* Feed + Actions */}
        <div className="space-y-4">
          <Panel title="INCIDENTS" code={`${incidents.length}`}>
            <div className="divide-y divide-white/[0.06] max-h-[240px] overflow-y-auto no-scrollbar">
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    inc.id === incidentId ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      {inc.status === "CONFIRMED" && <PixGlyph type="diamond" className="h-2 w-2 text-neon-red" />}
                      {inc.status === "UNDER REVIEW" && <PixGlyph type="diamond" className="h-2 w-2 text-neon-orange" />}
                      {inc.status === "MONITORING" && <PixGlyph type="diamond" className="h-2 w-2 text-neon-cyan" />}
                      {inc.id}
                    </span>
                    <StatusBadge status={inc.status} />
                  </div>
                  <div className="mt-1 text-xs text-[#7D7D7D]">{inc.state} · {inc.burnAreaHa} ha · {inc.confidence}%</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="ACTIONS" code="CMD">
            <div className="space-y-2 p-4">
              <button
                onClick={runScan}
                disabled={pipelineActive}
                className={cn(
                  "w-full border py-2.5 font-mono text-xs uppercase tracking-widest transition-colors",
                  pipelineActive
                    ? "border-[#7D7D7D]/30 text-[#7D7D7D]"
                    : "border-lime text-lime hover:bg-lime hover:text-black",
                )}
              >
                {pipelineActive ? "[SCANNING...]" : "[RUN FULL SCAN]"}
              </button>
              <button
                onClick={() => {
                  const inc = incidents.find((i) => i.id === incidentId);
                  if (inc) onTriggerAlert(inc);
                }}
                className="w-full border border-neon-red/30 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-red transition-colors hover:bg-neon-red hover:text-black"
              >
                [TRIGGER ALERT]
              </button>
            </div>
          </Panel>

          <Panel title="LOG" code={`${selectedInc.id}`}>
            <div className="space-y-1 p-4">
              {selectedInc.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-neon-cyan">{item.time}</span>
                  <span className="text-[#7D7D7D]">→</span>
                  <span>{item.msg}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
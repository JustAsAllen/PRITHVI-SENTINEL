"use client";

import { useEffect, useRef } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel } from "./panel";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";

function PlumeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    let raf = 0;
    let offset = 0;

    const renderPlume = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ff2d55";
      ctx.beginPath();
      ctx.arc(80, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 40; i++) {
        const x = 80 + i * 20;
        const spread = i * 3.5;
        const y = h / 2 + Math.sin(i * 0.3 + offset) * 15;
        const grad = ctx.createRadialGradient(x, y, 2, x, y, spread);
        grad.addColorStop(0, "rgba(255,140,0,0.25)");
        grad.addColorStop(0.5, "rgba(255,45,85,0.12)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, spread, 0, Math.PI * 2);
        ctx.fill();
      }
      offset += 0.03;
      raf = requestAnimationFrame(renderPlume);
    };
    renderPlume();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={900} height={240} className="hidden h-[240px] w-full md:block" />;
}

export function ImpactTab({ incident }: { incident: Incident }) {
  const rows = [
    { label: "BIOMASS LOST", value: incident.biomassTonnes.toLocaleString(), unit: "tonnes", color: "text-neon-orange" },
    { label: "CO₂ RELEASED", value: incident.co2Tonnes.toLocaleString(), unit: "tonnes", color: "text-neon-red" },
    { label: "PM2.5 SURGE", value: `+${incident.pm25Surge}`, unit: "µg/m³", color: "text-neon-yellow" },
    { label: "ENERGY WASTED", value: `${incident.energyTj}`, unit: "TJ", color: "text-neon-cyan" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">ENVIRONMENTAL IMPACT</span>
        <span className="micro-label text-[#7D7D7D]">{incident.id} · {incident.state}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="IMPACT PROFILE" code={incident.threatLevel}>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="micro-label text-[#7D7D7D]">Threat level</span>
              <span
                className={cn(
                  "font-display text-xl",
                  incident.threatLevel === "CRITICAL" ? "text-neon-red" : incident.threatLevel === "HIGH RISK" ? "text-neon-orange" : "text-neon-yellow",
                )}
              >
                {incident.threatLevel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rows.map((r) => (
                <div key={r.label} className="border hairline px-4 py-3">
                  <div className="micro-label text-[#7D7D7D]">{r.label}</div>
                  <div className={cn("mt-1 font-display text-2xl", r.color)}>
                    {r.value} <span className="text-xs text-[#7D7D7D]">{r.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border hairline px-4 py-3">
                <div className="micro-label text-[#7D7D7D]">NDVI DELTA</div>
                <div className="mt-1 font-display text-2xl text-neon-red">{incident.ndviDelta}%</div>
              </div>
              <div className="border hairline px-4 py-3">
                <div className="micro-label text-[#7D7D7D]">BURN PERIMETER</div>
                <div className="mt-1 font-display text-2xl text-neon-cyan">{incident.perimeterKm} km</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="SMOKE PLUME DISPERSION" code="SIM">
          <div className="p-4">
            <div className="flex items-center justify-between text-xs text-[#7D7D7D]">
              <span>SOURCE: {incident.burnAreaHa} ha burn scar</span>
              <span className="text-neon-white">wind N→E drift</span>
            </div>
            <PlumeCanvas />
            <div className="mt-3 border hairline px-4 py-3">
              <div className="micro-label text-[#7D7D7D]">DOWNWIND REACH</div>
              <div className="mt-1 font-display text-2xl text-neon-orange">
                {incident.pm25Surge * 4} km <span className="text-xs text-[#7D7D7D]">plume footprint</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "NDVI CHANGE", value: `${incident.ndviDelta}%`, note: "vegetation index delta since pass" },
          { label: "PEAK CNN ACTIVATION", value: incident.peakActivation.toFixed(4), note: "Grad-CAM hotspot confidence" },
          { label: "CLASSIFICATION", value: incident.classification.split(" ")[0], note: incident.classification },
        ].map((x) => (
          <Panel key={x.label} code="METRIC">
            <div className="p-5">
              <div className="micro-label text-[#7D7D7D]">{x.label}</div>
              <div className="mt-2 font-display text-2xl text-lime">{x.value}</div>
              <p className="mt-1 text-xs text-[#7D7D7D]">{x.note}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
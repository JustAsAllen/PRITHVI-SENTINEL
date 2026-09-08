"use client";

import { useMemo, useState } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel, SectionLabel, StatusBadge } from "./panel";
import { ChartJs, MONTHS } from "./chart";
import type { Region } from "@/lib/types";

export function CompareTab({ regions }: { regions: Region[] }) {
  const [idA, setIdA] = useState("punjab");
  const [idB, setIdB] = useState("karnataka");
  const a = regions.find((r) => r.id === idA) || regions[0];
  const b = regions.find((r) => r.id === idB) || regions[0];

  const data = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: a.name,
          data: a.burn_history,
          borderColor: "#ff2d55",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: b.name,
          data: b.burn_history,
          borderColor: "#00f0ff",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    }),
    [a, b],
  );

  const renderCard = (r: Region) => (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-base">{r.name}</span>
        <StatusBadge status={r.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { k: "AQI", v: String(r.aqi), accent: r.aqi > 200 ? "text-neon-red" : "text-lime" },
          { k: "Fires", v: String(r.active_fires) },
          { k: "NBR", v: String(r.nbr) },
          { k: "Area", v: `${r.area_affected_ha.toLocaleString()} ha` },
          { k: "Smoke", v: `${r.smoke_plume_km} km` },
          { k: "Energy", v: `${(r.energy_potential_gj / 1000).toFixed(0)}k GJ` },
        ].map((cell) => (
          <div key={cell.k} className="border hairline px-3 py-2">
            <div className="micro-label text-[#7D7D7D]">{cell.k}</div>
            <div className={cell.accent || "text-[#F2F2F2]"}>{cell.v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">REGION COMPARISON</span>
        <span className="micro-label text-[#7D7D7D]">two regions · one view</span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className="micro-label mb-2 text-[#7D7D7D]">REGION A</div>
          <select
            value={idA}
            onChange={(e) => setIdA(e.target.value)}
            className="border hairline bg-black px-3 py-2 font-mono text-xs text-[#F2F2F2] outline-none focus:border-lime"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <PixGlyph type="diamond" className="mb-3 h-3 w-3 text-lime" />
        <div>
          <div className="micro-label mb-2 text-[#7D7D7D]">REGION B</div>
          <select
            value={idB}
            onChange={(e) => setIdB(e.target.value)}
            className="border hairline bg-black px-3 py-2 font-mono text-xs text-[#F2F2F2] outline-none focus:border-lime"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={a.name} code="A">{renderCard(a)}</Panel>
        <Panel title={b.name} code="B">{renderCard(b)}</Panel>
      </div>

      <Panel title="BURN HISTORY · SYNCHRONOUS" code="12M">
        <div className="p-4">
          <ChartJs type="line" data={data} height={300} />
        </div>
      </Panel>

      <div>
        <SectionLabel>notes</SectionLabel>
        <p className="mt-3 max-w-2xl text-sm text-[#7D7D7D]">
          Live AQI is swapped in from Open-Meteo the moment it arrives. Burn
          history is scenario data. NBR and NDVI reflect the current Sentinel-2
          pass for each region.
        </p>
      </div>
    </div>
  );
}
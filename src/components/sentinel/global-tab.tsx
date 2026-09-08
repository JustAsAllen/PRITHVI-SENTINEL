"use client";

import { useMemo } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel, StatusBadge } from "./panel";
import { ChartJs } from "./chart";
import type { Country } from "@/lib/types";

const PALETTE = ["#ff2d55", "#ff8c00", "#FFD166", "#06d6a0", "#00f0ff", "#9d4edd", "#ff6b35", "#3a86ff", "#b5179e", "#00b4d8", "#70e000", "#f72585"];

export function GlobalTab({
  countries,
  timeline,
}: {
  countries: Country[];
  timeline: { labels: string[]; series: { name: string; data: (number | null)[] }[] } | null;
}) {
  const burnData = useMemo(
    () => ({
      labels: countries.map((c) => c.name),
      datasets: [{ data: countries.map((c) => c.burn_pct), backgroundColor: "#ff8c00", borderRadius: 2 }],
    }),
    [countries],
  );

  const co2Data = useMemo(
    () => ({
      labels: countries.map((c) => c.name),
      datasets: [{ data: countries.map((c) => c.co2_mt), backgroundColor: "#ff2d55", borderRadius: 2 }],
    }),
    [countries],
  );

  const timelineData = useMemo(() => {
    if (!timeline) return null;
    return {
      labels: timeline.labels,
      datasets: timeline.series.map((s, i) => ({
        label: s.name,
        data: s.data,
        borderColor: PALETTE[i % PALETTE.length],
        borderWidth: 1.6,
        tension: 0.25,
        pointRadius: 0,
        spanGaps: true,
      })),
    };
  }, [timeline]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">GLOBAL AIR QUALITY BOARD</span>
        <span className="micro-label text-[#7D7D7D]">12 nations · live · ~90d</span>
      </div>

      <div className="grid grid-cols-2 gap-px border hairline bg-white/[0.06] md:grid-cols-4">
        {countries.map((c) => (
          <div key={c.name} className="bg-black p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="text-base">{c.flag}</span>
                <span>{c.name}</span>
              </span>
              <span className="micro-label text-[#7D7D7D]">#{c.rank}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <StatusBadge status={c.status} />
              <span className="font-display text-xl">{c.aqi}</span>
            </div>
            <div className="mt-1 text-xs text-[#7D7D7D]">PM2.5 {c.pm25} µg/m³ · burn {c.burn_pct}%</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="BURNING RATE BY COUNTRY" code="%">
          <div className="p-4"><ChartJs type="bar" data={burnData} height={260} /></div>
        </Panel>
        <Panel title="CO₂ EMITTED (MT)" code="MT">
          <div className="p-4"><ChartJs type="bar" data={co2Data} height={260} /></div>
        </Panel>
      </div>

      <Panel title="GLOBAL AQI TIMELINE · DAILY AVERAGE" code="90D">
        <div className="p-4">
          {timelineData ? (
            <ChartJs type="line" data={timelineData} height={320} />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="micro-label text-[#7D7D7D]">[ FETCHING LIVE AQI HISTORY... ]</div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
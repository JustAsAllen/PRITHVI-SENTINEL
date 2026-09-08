"use client";

import { useMemo } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel } from "./panel";
import { ChartJs } from "./chart";
import { MODEL_PERFORMANCE } from "@/lib/incidents";

export function PerformanceTab() {
  const accData = useMemo(
    () => ({
      labels: MODEL_PERFORMANCE.epochs,
      datasets: [
        {
          label: "Training Accuracy",
          data: MODEL_PERFORMANCE.trainAcc,
          borderColor: "#00f0ff",
          backgroundColor: "rgba(0,240,255,0.05)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
        {
          label: "Validation Accuracy",
          data: MODEL_PERFORMANCE.valAcc,
          borderColor: "#9d4edd",
          borderDash: [4, 4],
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    }),
    [],
  );

  const lossData = useMemo(
    () => ({
      labels: MODEL_PERFORMANCE.epochs,
      datasets: [
        {
          label: "Training Loss",
          data: MODEL_PERFORMANCE.trainLoss,
          borderColor: "#ff8c00",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "Validation Loss",
          data: MODEL_PERFORMANCE.valLoss,
          borderColor: "#ff2d55",
          borderDash: [4, 4],
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    }),
    [],
  );

  const metrics = [
    { label: "PEAK VALIDATION ACCURACY", value: "96.8%" },
    { label: "TILES TRAINED", value: "14,200" },
    { label: "EPOCHS", value: "25" },
    { label: "CLASSES", value: "binary" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">MODEL PERFORMANCE</span>
        <span className="micro-label text-[#7D7D7D]">sentinel-2 cnn</span>
      </div>

      <div className="grid grid-cols-2 gap-px border hairline bg-white/[0.06] md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-black px-6 py-6">
            <div className="micro-label text-[#7D7D7D]">{m.label}</div>
            <div className="mt-2 font-display text-3xl text-lime">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="TRAINING vs VALIDATION ACCURACY" code="%">
          <div className="p-4"><ChartJs type="line" data={accData} height={300} /></div>
        </Panel>
        <Panel title="TRAINING vs VALIDATION LOSS" code="LOSS">
          <div className="p-4"><ChartJs type="line" data={lossData} height={300} /></div>
        </Panel>
      </div>

      <Panel title="PRECISION / RECALL" code="METRICS">
        <div className="grid gap-4 p-4 md:grid-cols-3">
          {[
            { k: "Precision (FIRE)", v: "0.972" },
            { k: "Recall (FIRE)", v: "0.947" },
            { k: "F1-Score", v: "0.959" },
          ].map((x) => (
            <div key={x.k} className="border hairline px-4 py-3">
              <div className="micro-label text-[#7D7D7D]">{x.k}</div>
              <div className="mt-1 font-display text-2xl text-neon-green">{x.v}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
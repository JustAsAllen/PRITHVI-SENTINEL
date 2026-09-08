"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ChartData, ChartOptions } from "chart.js";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  scales: {
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#94A3B8", font: { family: "ui-monospace, monospace", size: 10 } } },
    x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { family: "ui-monospace, monospace", size: 9 } } },
  },
  plugins: { legend: { display: false } },
} as const;

Chart.defaults.color = "#94A3B8";
Chart.defaults.font.family = "ui-monospace, monospace";

export function ChartJs({
  type,
  data,
  options,
  height = 200,
}: {
  type: "line" | "bar";
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    if (!ctx) return;
    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: { ...chartDefaults, ...options } as ChartOptions,
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data;
      chartRef.current.update();
    }
  }, [data]);

  return (
    <div style={{ height }} className="w-full">
      <canvas ref={ref} />
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel } from "./panel";
import { cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";

type Mode = "original" | "attention" | "heatmap" | "mask";

function drawSatelliteBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1b281b";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    for (let y = 0; y < h; y += 40) {
      const shade = (Math.sin(x) * Math.cos(y) + 1) * 20;
      ctx.fillStyle = `rgb(${20 + shade}, ${45 + shade * 1.5}, ${20 + shade})`;
      ctx.fillRect(x, y, 38, 38);
    }
  }
}

function drawBurnScar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0c0806";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const ember = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 0.7);
  ember.addColorStop(0, "#ff8c00");
  ember.addColorStop(0.4, "#ff2d55");
  ember.addColorStop(1, "transparent");
  ctx.fillStyle = ember;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function useAnalysisCanvas(incident: Incident, mode: Mode) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const { cx, cy, r } = incident.burnCoords;

    ctx.clearRect(0, 0, w, h);
    drawSatelliteBase(ctx, w, h);
    const bbox = document.getElementById("analysis-bbox");
    const tag = document.getElementById("bbox-tag");
    if (mode === "original") {
      drawBurnScar(ctx, cx, cy, r, 0.95);
      if (bbox) bbox.style.display = "none";
    } else {
      drawBurnScar(ctx, cx, cy, r, mode === "attention" ? 0.4 : 0.2);
      if (mode === "attention") {
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.8);
        grad.addColorStop(0, "rgba(0,240,255,0.85)");
        grad.addColorStop(0.5, "rgba(157,78,221,0.4)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (mode === "heatmap") {
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r * 1.5);
        grad.addColorStop(0, "rgba(255,0,0,0.9)");
        grad.addColorStop(0.3, "rgba(255,255,0,0.7)");
        grad.addColorStop(0.6, "rgba(0,255,0,0.5)");
        grad.addColorStop(0.85, "rgba(0,0,255,0.3)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (bbox) {
        bbox.style.display = "block";
        if (tag) tag.innerText = `BURN CLUSTER [${(incident.confidence / 100).toFixed(3)}]`;
      }
    }
  }, [incident, mode]);

  return ref;
}

function NoiseCanvas({ tint }: { tint: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, 40, 40);
    for (let x = 0; x < 40; x += 5) {
      for (let y = 0; y < 40; y += 5) {
        if (Math.random() > 0.45) {
          ctx.fillStyle = tint;
          ctx.globalAlpha = Math.random() * 0.7;
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [tint]);
  return <canvas ref={ref} width={40} height={40} className="h-10 w-10 border border-white/[0.08]" />;
}

export function AnalysisTab({
  incident,
  onTriggerAlert,
  onToast,
}: {
  incident: Incident;
  onTriggerAlert: (inc: Incident) => void;
  onToast: (msg: string, type?: "info" | "success" | "alert" | "warning") => void;
}) {
  const [mode, setMode] = useState<Mode>("original");
  const [scanning, setScanning] = useState(false);
  const [verdict, setVerdict] = useState<{ status: string; conf: string; color: string }>({
    status: "IDLE",
    conf: "--.-%",
    color: "#7D7D7D",
  });
  const analysisRef = useAnalysisCanvas(incident, mode);
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const [latents, setLatents] = useState<number[]>(() =>
    Array.from({ length: 16 }, () => 40),
  );

  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after) return;
    const ctxB = before.getContext("2d");
    const ctxA = after.getContext("2d");
    if (!ctxB || !ctxA) return;
    const { cx, cy, r } = incident.burnCoords;
    drawSatelliteBase(ctxB, 320, 320);
    drawSatelliteBase(ctxA, 320, 320);
    drawBurnScar(ctxA, cx * (320 / 512), cy * (320 / 512), r * (320 / 512), 1);
    const mini = miniRef.current;
    if (mini) {
      const ctxM = mini.getContext("2d");
      if (ctxM) {
        drawSatelliteBase(ctxM, 80, 80);
        drawBurnScar(ctxM, (cx * 80) / 512, (cy * 80) / 512, (r * 80) / 512, 1);
      }
    }
  }, [incident]);

  const runInference = () => {
    if (scanning) return;
    setScanning(true);
    setVerdict({ status: "ANALYZING", conf: "--.-%", color: "#7D7D7D" });
    onToast(`Running inference on ${incident.id}...`, "info");

    let step = 0;
    const interval = window.setInterval(() => {
      step++;
      if (step < 5) {
        if (step === 2 || step === 3) setLatents(Array.from({ length: 16 }, () => Math.random() * 85 + 15));
        if (step === 4) setLatents(Array.from({ length: 16 }, () => Math.random() * 85 + 15));
      } else {
        window.clearInterval(interval);
        setScanning(false);
        const detected = incident.status === "CONFIRMED";
        setVerdict({
          status: detected ? "FIRE DETECTED" : "NO DETECTION",
          conf: `${incident.confidence}%`,
          color: detected ? "#ff2d55" : "#00ff88",
        });
        setMode("heatmap");
        if (detected) onTriggerAlert(incident);
      }
    }, 650);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">SENTINEL-2 ANALYSIS</span>
        <span className="micro-label text-[#7D7D7D]">CNN · {incident.id}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Viz canvas */}
        <Panel title="SCENE VIEWER" code={mode.toUpperCase()}>
          <div className="flex gap-2 p-3">
            {(["original", "attention", "heatmap", "mask"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "border px-3 py-1 font-mono text-[10px] uppercase tracking-widest",
                  mode === m ? "border-lime text-lime" : "border-white/10 text-[#7D7D7D] hover:text-[#F2F2F2]",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="relative p-4">
            <canvas ref={analysisRef} width={512} height={512} className="w-full border border-white/[0.08]" />
            <div
              id="analysis-bbox"
              style={{ display: "none" }}
              className="absolute left-4 top-4 pointer-events-none"
            >
              <div className="micro-label whitespace-pre rounded border border-neon-cyan bg-black/70 px-2 py-1 text-neon-cyan">
                <span id="bbox-tag">BURN CLUSTER</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4 pt-0">
            <div>
              <p className="micro-label mb-1 text-[#7D7D7D]">BEFORE</p>
              <canvas ref={beforeRef} width={320} height={320} className="w-full border border-white/[0.08]" />
            </div>
            <div>
              <p className="micro-label mb-1 text-[#7D7D7D]">AFTER</p>
              <canvas ref={afterRef} width={320} height={320} className="w-full border border-white/[0.08]" />
            </div>
            <div>
              <p className="micro-label mb-1 text-[#7D7D7D]">INPUT</p>
              <canvas ref={miniRef} width={80} height={80} className="h-20 w-20 border border-white/[0.08]" />
            </div>
          </div>
        </Panel>

        {/* Pipeline */}
        <div className="space-y-4">
          <Panel title="CNN INFERENCE PIPELINE" code="512³">
            <div className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {["INPUT", "CONV1", "CONV2", "LATENT", "OUTPUT"].map((label, i) => (
                  <div key={label} className="border hairline px-1 py-2 text-center">
                    <div className="micro-label text-[#7D7D7D]">{label}</div>
                    <div className="mt-2 h-1 w-full bg-white/[0.03]">
                      <div
                        className={cn("h-full transition-all", scanning ? "bg-neon-cyan" : "bg-white/[0.08]")}
                        style={{ width: scanning ? `${((i + 1) / 5) * 100}%` : `${((i + 1) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border hairline bg-black p-4">
                <div className="micro-label text-[#7D7D7D]">5TH_ROW — inference</div>
                <div className="mt-3 space-y-1 font-mono text-[11px]">
                  <div className="text-[#7D7D7D]">$ prithvi scan {incident.id}</div>
                  <div className="text-neon-cyan">[tensor] 512×512×3 normalized</div>
                  <div className="text-neon-cyan">[conv1] SWIR edge activation</div>
                  <div className="text-neon-cyan">[conv2] deep scar extraction</div>
                  <div className="mt-1">
                    <span className="text-[#F2F2F2]">verdict: </span>
                    <span style={{ color: verdict.color }}>{verdict.status}</span>
                    <span className="text-[#7D7D7D]"> · conf {verdict.conf}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 h-1 w-full bg-white/[0.04]">
                <div
                  className={cn("h-full transition-all", scanning ? "bg-neon-cyan" : "bg-lime")}
                  style={{ width: scanning ? "80%" : "0%" }}
                />
              </div>

              <div className="mt-4 flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <NoiseCanvas key={i} tint={i < 2 ? "#00f0ff" : "#9d4edd"} />
                ))}
              </div>

              <div className="mt-4 flex h-16 items-end gap-1">
                {latents.map((h, i) => (
                  <div key={i} className="flex-1 bg-neon-purple/50" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="VERDICT" code="AI">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: verdict.color }} />
                  <span style={{ color: verdict.color }} className="font-display text-xl">{verdict.status}</span>
                </div>
                <div className="mt-2 text-sm text-[#7D7D7D]">
                  {incident.classification} · {incident.confidence}% confidence
                </div>
              </div>
            </Panel>

            <Panel title="ACTIONS" code="CMD">
              <div className="space-y-2 p-4">
                <button
                  onClick={runInference}
                  disabled={scanning}
                  className={cn(
                    "w-full border py-2.5 font-mono text-xs uppercase tracking-widest transition-colors",
                    scanning ? "border-[#7D7D7D]/30 text-[#7D7D7D]" : "border-lime text-lime hover:bg-lime hover:text-black",
                  )}
                >
                  {scanning ? "[INFERRING...]" : "[RUN FULL INFERENCE]"}
                </button>
                <button
                  onClick={() => onTriggerAlert(incident)}
                  className="w-full border border-neon-red/30 py-2.5 font-mono text-xs uppercase tracking-widest text-neon-red hover:bg-neon-red hover:text-black"
                >
                  [DISPATCH AUTHORITIES]
                </button>
              </div>
            </Panel>
          </div>

          <Panel title={`ACQUISITION TIMELINE · ${incident.id}`} code="PLAYBACK">
            <div className="space-y-2 p-4">
              {incident.timeline.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="micro-label w-16 text-neon-cyan">{item.time}</span>
                  <PixGlyph type="diamond" className="h-2 w-2 text-lime" />
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
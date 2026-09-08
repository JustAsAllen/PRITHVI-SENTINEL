"use client";

import { useEffect, useState } from "react";
import { PixGlyph } from "@/components/pix-glyph";
import { Panel } from "./panel";
import { AUTHORITIES, INCIDENTS } from "@/lib/incidents";
import { cn } from "@/lib/utils";
import type { Incident, Region } from "@/lib/types";

interface DispatchEntry {
  id: number;
  time: string;
  state: string;
  lat: string;
  lon: string;
  nbr: number;
  penalty: string;
  authority: string;
}

export function DispatchTab({
  regions,
  onToast,
  onTriggerAlert,
}: {
  regions: Region[];
  onToast: (msg: string, type?: "info" | "success" | "alert" | "warning") => void;
  onTriggerAlert: (inc: Incident) => void;
}) {
  const [entries, setEntries] = useState<DispatchEntry[]>([]);
  const [notified, setNotified] = useState<string[]>([]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const burning = regions.filter((r) => r.status === "CRITICAL" || r.status === "HIGH RISK");
      if (burning.length > 0 && Math.random() > 0.4) {
        const target = burning[Math.floor(Math.random() * burning.length)];
        const lat = (target.lat + (Math.random() * 0.1 - 0.05)).toFixed(4);
        const lon = (target.lon + (Math.random() * 0.1 - 0.05)).toFixed(4);
        const penalty = (target.active_fires * 2500).toLocaleString();
        const authority = AUTHORITIES[Math.floor(Math.random() * AUTHORITIES.length)].name;
        setEntries((prev) =>
          [
            {
              id: Date.now(),
              time: new Date().toLocaleTimeString(),
              state: target.state,
              lat,
              lon,
              nbr: target.nbr,
              penalty,
              authority,
            },
            ...prev.slice(0, 19),
          ].filter(Boolean),
        );
      }
    }, 4000);
    return () => window.clearInterval(tick);
  }, [regions]);

  const notifyAll = () => {
    setNotified(AUTHORITIES.map((a) => a.name));
    const burning = regions.filter((r) => r.status === "CRITICAL" || r.status === "HIGH RISK");
    const primary = INCIDENTS.find((i) => i.status === "CONFIRMED");
    const victim =
      burning.find((r) => r.status === "CRITICAL") || burning[0] || regions[0];
    const target: Incident = primary
      ? { ...primary, district: victim?.name ?? primary.district }
      : {
          ...INCIDENTS[0],
          district: victim?.name ?? INCIDENTS[0].district,
          status: "CONFIRMED",
          confidence: 94,
          threatLevel: "CRITICAL" as const,
        };
    onTriggerAlert(target);
    onToast("Alert dispatched to all authorities", "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">ENFORCEMENT & AUTHORITY FEED</span>
        <span className="micro-label text-[#7D7D7D]">live ticker · 5 authorities</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Panel title="DISPATCH FEED" code="LIVE">
          <div className="divide-y divide-white/[0.04] max-h-[480px] overflow-y-auto no-scrollbar">
            {entries.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <div className="micro-label text-[#7D7D7D]">[ LISTENING FOR ANOMALIES... ]</div>
              </div>
            )}
            {entries.map((e) => (
              <div key={e.id} className="px-4 py-3">
                <div className="micro-label text-neon-red">[{e.time}] CRITICAL ANOMALY DETECTED</div>
                <div className="mt-1 text-sm">
                  <b>{e.state}</b> <span className="text-[#7D7D7D]">(Lat: {e.lat}, Lon: {e.lon})</span>
                </div>
                <div className="mt-1 text-xs text-neon-orange">
                  Trigger: NBR Index {e.nbr} | High SWIR Reflectance
                </div>
                <div className="mt-1 text-xs text-[#7D7D7D]">
                  Dispatched → <span className="text-lime">{e.authority}</span> · Penalty: ₹{e.penalty}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="AUTHORITY ROSTER" code="5">
            <div className="divide-y divide-white/[0.04]">
              {AUTHORITIES.map((a, i) => {
                const isNotified = notified.includes(a.name);
                return (
                  <div key={a.name} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm">{a.name}</div>
                      <div className="text-xs text-[#7D7D7D]">{a.role}</div>
                    </div>
                    <span
                      className={cn(
                        "micro-label border px-2 py-0.5",
                        isNotified
                          ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                          : "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan",
                      )}
                    >
                      {isNotified ? "[NOTIFIED]" : `[STANDBY ${i + 1}]`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t hairline p-4">
              <button
                onClick={notifyAll}
                className="w-full border py-2.5 font-mono text-xs uppercase tracking-widest text-neon-green transition-colors hover:bg-neon-green hover:text-black"
              >
                [NOTIFY ALL AUTHORITIES]
              </button>
            </div>
          </Panel>

          <Panel title="PENALTY MODEL" code="₹">
            <div className="p-4 text-xs text-[#7D7D7D]">
              <div className="flex justify-between py-1">
                <span>Per active fire</span>
                <span className="text-neon-orange">₹2,500</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Per hectare burnt</span>
                <span className="text-neon-orange">₹18,000</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Repeat offender</span>
                <span className="text-neon-red">×3</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
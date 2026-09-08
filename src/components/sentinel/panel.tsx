"use client";

import { PixGlyph } from "@/components/pix-glyph";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({
  title,
  code,
  children,
  className,
  right,
}: {
  title?: string;
  code?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("border hairline bg-[#050505]", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between border-b hairline px-4 py-3">
          <div className="flex items-center gap-2">
            {title && <span className="micro-label text-[#F2F2F2]">{title}</span>}
            {code && <span className="micro-label text-[#7D7D7D]">[{code}]</span>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function LiveDot({ color = "lime" }: { color?: string }) {
  return <span className={`live-dot ${color === "red" ? "bg-neon-red" : ""} ${color === "cyan" ? "bg-neon-cyan" : ""}`} />;
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "CRITICAL" || status === "Hazardous"
      ? "bg-neon-red/10 text-neon-red border-neon-red/30"
      : status === "HIGH RISK" || status === "Unhealthy" || status === "Very Unhealthy"
        ? "bg-neon-orange/10 text-neon-orange border-neon-orange/30"
        : status === "WATCH" || status === "Unhealthy (Sensitive)" || status === "Moderate"
          ? "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30"
          : status === "MODERATE"
            ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
            : "bg-neon-green/10 text-neon-green border-neon-green/30";
  return (
    <span className={cn("micro-label border px-2 py-0.5", cls)}>
      {status}
    </span>
  );
}

export function SectionLabel({ children, icon = "diamond" }: { children: ReactNode; icon?: "diamond" | "plus" | "ticks" }) {
  return (
    <div className="micro-label flex items-center gap-2 text-lime">
      <PixGlyph type={icon} className={icon === "ticks" ? "h-5 w-2" : "h-3 w-3"} />
      {children}
    </div>
  );
}

export function BracketCode({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={cn("font-mono text-[10px] tracking-[0.4px] uppercase", active ? "text-lime" : "text-[#7D7D7D]")}>
      <span className={active ? "text-lime" : ""}>[</span>
      {children}
      <span className={active ? "text-lime" : ""}>]</span>
    </span>
  );
}
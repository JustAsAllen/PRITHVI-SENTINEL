"use client";

import { PixGlyph } from "@/components/pix-glyph";
import { Panel } from "./panel";
import type { Country } from "@/lib/types";

export function EnergyTab({ countries }: { countries: Country[] }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PixGlyph type="plus" className="h-3 w-3 text-lime" />
        <span className="font-display text-2xl md:text-3xl">WASTE-TO-ENERGY ECONOMICS</span>
        <span className="micro-label text-[#7D7D7D]">what burning costs</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="micro-label border-b hairline text-[#7D7D7D]">
              <th className="px-3 py-3">COUNTRY</th>
              <th className="px-3 py-3">RESIDUE (MT)</th>
              <th className="px-3 py-3">ENERGY (PJ)</th>
              <th className="px-3 py-3">POWER (MW)</th>
              <th className="px-3 py-3">HOMES (k)</th>
              <th className="px-3 py-3">CO₂ SAVED (MT)</th>
              <th className="px-3 py-3">MWH/DAY</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.name} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                <td className="px-3 py-3 font-medium">{c.flag} {c.name}</td>
                <td className="px-3 py-3 text-[#7D7D7D]">{c.residue_mt} MT</td>
                <td className="px-3 py-3 text-[#7D7D7D]">{c.energy_pj} PJ</td>
                <td className="px-3 py-3 text-neon-cyan">{c.power_mw.toLocaleString()} MW</td>
                <td className="px-3 py-3 text-[#7D7D7D]">{Math.round(c.residue_mt * 0.24)}</td>
                <td className="px-3 py-3 font-semibold text-neon-green">{Math.round(c.co2_mt * 0.4)} MT</td>
                <td className="px-3 py-3 text-[#7D7D7D]">{(c.power_mw * 24).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="INDIA · RESIDUE" code="MT">
          <div className="p-5">
            <div className="font-display text-4xl text-lime">500 MT</div>
            <p className="mt-2 text-sm text-[#7D7D7D]">
              Annual crop residue produced. Burning it forfeits 3,060 PJ of
              recoverable energy.
            </p>
          </div>
        </Panel>
        <Panel title="INDIA · POWER" code="MW">
          <div className="p-5">
            <div className="font-display text-4xl text-neon-cyan">10,200 MW</div>
            <p className="mt-2 text-sm text-[#7D7D7D]">
              Potential installed capacity if residue were gasified instead of
              burnt.
            </p>
          </div>
        </Panel>
        <Panel title="INDIA · CO₂" code="MT">
          <div className="p-5">
            <div className="font-display text-4xl text-neon-green">78 MT</div>
            <p className="mt-2 text-sm text-[#7D7D7D]">
              Avoidable emissions estimate from residue-to-energy conversion.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
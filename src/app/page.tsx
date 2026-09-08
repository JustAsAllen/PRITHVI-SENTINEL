import Link from "next/link";
import { PixGlyph } from "@/components/pix-glyph";
import { GLOBAL_COUNTRIES } from "@/lib/regions";
import { INCIDENTS } from "@/lib/incidents";

const CAPABILITIES = [
  {
    n: "01",
    code: "MISSION",
    name: "Mission Control",
    desc: "Live KPI strip, interactive 2D theatre of 9 regions, and a forensic incident feed synced to every marker on the map.",
  },
  {
    n: "02",
    code: "TILE",
    name: "Sentinel-2 Analysis",
    desc: "Original, CNN-attention and Grad-CAM heatmap views of the same raster the inference engine sees during a scan.",
  },
  {
    n: "03",
    code: "PAIR",
    name: "Region Comparison",
    desc: "Side-by-side telemetry for any two regions — AQI, fires, NBR, plume length, energy — rendered synchronously.",
  },
  {
    n: "04",
    code: "GLOBAL",
    name: "12-Country AQI",
    desc: "Live air quality and PM2.5 for twelve countries with an honest ~90-day daily-average timeline.",
  },
  {
    n: "05",
    code: "MODEL",
    name: "Model Performance",
    desc: "CNN training curves peaking at ~96.8% accuracy across 14,200 Sentinel-2 tiles, with precision/recall.",
  },
  {
    n: "06",
    code: "ENERGY",
    name: "Energy Economics",
    desc: "What we lose when residue burns — tonnes of residue, recoverable PJ, potential MW, and homes unpowered.",
  },
  {
    n: "07",
    code: "IMPACT",
    name: "Environmental Impact",
    desc: "Per-incident threat, biomass lost, CO₂ released, PM2.5 surge, and energy wasted — colour-coded severity.",
  },
  {
    n: "08",
    code: "DISPATCH",
    name: "Enforcement Dispatch",
    desc: "A live-ticking authority feed: DDMA, SPCB, Fire, Agri, NDRF told the moment a burn is confirmed.",
  },
];

function DottedRule() {
  return <PixGlyph type="dottule" className="h-1 w-7 text-[#7D7D7D]" />;
}

export default function HomePage() {
  const fired = INCIDENTS.filter((i) => i.status === "CONFIRMED").length;
  const nations = GLOBAL_COUNTRIES.length;

  return (
    <>
      {/* Top hairline + nav */}
      <header className="sticky top-0 z-40 border-b hairline bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1416px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <PixGlyph type="bracket-l" className="h-4 w-2 text-lime" />
            <span className="font-display text-lg tracking-tight">PRITHVI_SENTINEL</span>
            <PixGlyph type="bracket-r" className="h-4 w-2 text-lime" />
            <span className="micro-label hidden text-[#7D7D7D] md:inline">v2.0 · satellite fire detection</span>
          </div>
          <Link
            href="/sentinel"
            className="group flex items-center gap-2 border border-white/10 px-4 py-2 text-sm hover:border-lime"
          >
            Open Command Center
            <span className="text-lime transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="grid-bg relative border-b hairline">
        <div className="mx-auto max-w-[1416px] px-6 pt-20 pb-24 md:px-10 md:pt-32 md:pb-32">
          <div className="micro-label flex items-center gap-3 text-lime">
            <PixGlyph type="ticks" className="h-5 w-2 text-lime" />
            SATELLITE-POWERED COMMAND CENTER
            <PixGlyph type="diamond" className="h-3 w-3 text-lime" />
            INDIAN AGRARIAN REGIONS
          </div>

          <h1 className="mt-8 max-w-5xl font-display text-[13vw] leading-[0.86] tracking-tight md:text-[7.5rem]">
            PRITHVI
            <br />
            SENTINEL
          </h1>

          <div className="mt-12 flex max-w-[1416px] flex-col gap-8 md:mt-16 md:flex-row md:items-start md:justify-between">
            <p className="max-w-md font-serif text-2xl leading-snug text-[#F2F2F2]">
              A watch on every stubble burn and forest fire — from satellite
              tile to enforcement dispatch, in one theatre.
            </p>
            <div className="flex max-w-xl flex-col gap-5">
              <div className="flex items-start gap-4">
                <DottedRule />
                <p className="text-sm leading-relaxed text-[#7D7D7D]">
                  Sentinel-2 acquisition → CNN inference → Grad-CAM verification →
                  authority dispatch. The detection layer is simulated; the air
                  quality it orbits is <span className="text-lime">live</span> from
                  Open-Meteo across 9 regions and 12 nations.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <DottedRule />
                <p className="text-sm leading-relaxed text-[#7D7D7D]">
                  Zero assumptions of ground truth at 1,416 pixels.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <Link
                  href="/sentinel"
                  className="group flex items-center gap-3 border-b border-lime pb-1 text-lg font-semibold text-lime"
                >
                  Launch the dashboard
                  <span className="transition-transform group-hover:translate-x-1.5">→</span>
                </Link>
                <span className="micro-label text-[#7D7D7D]">no key · no build · static</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-[1416px] grid-cols-2 md:grid-cols-4">
          {[
            { label: "REGIONS UNDER WATCH", value: "09", note: "live AQI" },
            { label: "NATIONS MONITORED", value: String(nations).padStart(2, "0"), note: "daily avg" },
            { label: "CONFIRMED BURNS", value: String(fired).padStart(2, "0"), note: "this pass" },
            { label: "MODEL ACCURACY", value: "96.8%", note: "val @ 25 ep" },
          ].map((s, i) => (
            <div key={s.label} className={`flex items-center justify-between border-hairline px-6 py-8 md:px-10 ${i !== 0 ? "border-l" : ""}`}>
              <div>
                <div className="micro-label text-[#7D7D7D]">{s.label}</div>
                <div className="mt-2 font-display text-4xl">{s.value}</div>
              </div>
              <div className="text-right">
                <div className="micro-label text-lime">{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-[1416px] px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-end justify-between">
          <div>
            <div className="micro-label flex items-center gap-3 text-lime">
              <PixGlyph type="plus" className="h-2 w-2 text-lime" />
              THE SYSTEM
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
              Eight command modules. One orbit.
            </h2>
          </div>
          <PixGlyph type="diamond" className="hidden h-4 w-4 text-lime md:block" />
        </div>

        <div className="mt-14 grid gap-px border hairline bg-white/[0.06] md:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.n} className="group bg-black p-8 transition-colors hover:bg-[#050505] md:p-10">
              <div className="flex items-center justify-between">
                <span className="micro-label text-lime">{c.code}</span>
                <span className="micro-label text-[#7D7D7D]">[{c.n}]</span>
              </div>
              <h3 className="mt-6 font-display text-2xl">{c.name}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#7D7D7D]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t hairline">
        <div className="grid-bg mx-auto max-w-[1416px] px-6 py-24 text-center md:px-10 md:py-32">
          <PixGlyph type="corners" className="mx-auto h-4 w-4 text-lime" />
          <h2 className="mt-8 font-display text-4xl leading-[0.95] md:text-7xl">
            The sky is watching.
            <br />
            Go take the console.
          </h2>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link
              href="/sentinel"
              className="group flex items-center gap-3 border-b border-lime pb-1 text-lg text-lime"
            >
              Enter command center
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-[1416px] flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <PixGlyph type="diamond" className="h-3 w-3 text-lime" />
            <span className="micro-label text-[#7D7D7D]">PRITHVI SENTINEL © 2026</span>
          </div>
          <p className="micro-label text-[#7D7D7D]">
            AIR QUALITY IS REAL · BURN DETECTION IS SIMULATED · DEMONSTRATION ONLY
          </p>
        </div>
      </footer>
    </>
  );
}
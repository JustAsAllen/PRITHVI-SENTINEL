import Link from "next/link";
import { PixGlyph } from "@/components/pix-glyph";

export default function NotFound() {
  return (
    <main className="grid-bg grid min-h-[100svh] place-items-center bg-black px-6">
      <div className="max-w-md border hairline bg-[#050505] p-8 text-center">
        <PixGlyph type="plus" className="mx-auto h-3 w-3 text-lime" />
        <h1 className="mt-6 font-display text-5xl">404</h1>
        <p className="mt-3 text-sm text-[#7D7D7D]">
          No tile at this coordinate. The grid is clear.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 border-b border-lime pb-1 text-lime"
          >
            Return to surface
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
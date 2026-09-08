"use client";

import { PixGlyph } from "@/components/pix-glyph";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-[100svh] place-items-center bg-black px-6 text-[#F2F2F2]">
        <div className="max-w-md border hairline bg-[#050505] p-8 text-center">
          <PixGlyph type="bracket-l" className="mx-auto h-4 w-2 text-neon-red" />
          <h1 className="mt-6 font-display text-3xl text-neon-red">ORBIT LOST</h1>
          <p className="mt-3 text-sm text-[#7D7D7D]">
            The console hit an unexpected error. The satellite keeps flying —
            bring the view back.
          </p>
          {error.digest && (
            <p className="micro-label mt-3 text-[#7D7D7D]">[digest {error.digest}]</p>
          )}
          <button
            onClick={reset}
            className="mt-6 border border-lime px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-lime transition-colors hover:bg-lime hover:text-black"
          >
            [RECOVER ORBIT]
          </button>
        </div>
      </body>
    </html>
  );
}
const P = 4;

type Pattern =
  | "plus"
  | "dottule"
  | "bracket-l"
  | "bracket-r"
  | "corners"
  | "diamond"
  | "ticks";

const VIEWBOX: Record<Pattern, string> = {
  plus: "0 0 8 8",
  dottule: "0 0 28 4",
  "bracket-l": "0 0 6 16",
  "bracket-r": "0 0 6 16",
  corners: "0 0 16 16",
  diamond: "0 0 12 12",
  ticks: "0 0 8 20",
};

const CELLS: Record<Pattern, Array<[number, number]>> = {
  plus: [],
  dottule: [
    [0, 0],
    [6, 0],
    [12, 0],
    [18, 0],
    [24, 0],
  ],
  "bracket-l": [
    [0, 0],
    [0, 12],
    [2, 6],
  ],
  "bracket-r": [
    [2, 0],
    [2, 12],
    [0, 6],
  ],
  corners: [
    [0, 0],
    [4, 0],
    [0, 4],
    [12, 0],
    [12, 4],
    [16, 0],
    [0, 12],
    [0, 16],
    [4, 12],
    [12, 12],
    [16, 12],
    [12, 16],
  ],
  diamond: [
    [4, 0],
    [0, 4],
    [8, 4],
    [4, 8],
  ],
  ticks: [
    [2, 0],
    [2, 6],
    [2, 12],
    [2, 18],
  ],
};

export function PixGlyph({
  type,
  className,
}: {
  type: Pattern;
  className?: string;
}) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox={VIEWBOX[type]}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {type === "plus" ? (
        <>
          <path d="M4 0V8" stroke="currentColor" />
          <path d="M8 4L0 4" stroke="currentColor" />
        </>
      ) : (
        CELLS[type].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={P} height={P} fill="currentColor" />
        ))
      )}
    </svg>
  );
}
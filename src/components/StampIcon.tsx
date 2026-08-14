type StampIconProps = {
  filled: boolean;
  index?: number;
};

const NAVY = "#1E2430";

const COOKIE_PATHS = [
  "M32 7 C39 5 47 8 51 15 C56 20 57 28 54 35 C52 42 46 48 38 52 C30 56 20 54 14 48 C8 42 6 33 9 24 C12 15 20 9 32 7 Z",
  "M30 8 C38 6 46 9 52 16 C57 23 56 32 52 39 C48 46 40 53 31 54 C22 55 13 50 9 41 C5 32 7 22 13 15 C19 8 24 9 30 8 Z",
  "M33 6 C41 7 49 11 53 19 C57 27 55 36 49 43 C43 50 34 55 25 53 C16 51 9 44 7 35 C5 26 10 17 18 11 C24 7 28 5 33 6 Z",
];

/** Angular, irregular chip shapes — chunks, shards, crescents, broken pieces */
type Chip = { d: string; rot?: number; cx?: number; cy?: number };

const CHIP_SETS: Chip[][] = [
  // Cookie 0
  [
    { d: "M18 22 L24 19 L26 25 L21 28 L17 26 Z", rot: -12, cx: 22, cy: 24 },
    { d: "M29 16 L35 15 L36 21 L31 23 L27 20 Z", rot: 18, cx: 32, cy: 19 },
    { d: "M38 21 L44 19 L45 26 L40 28 L36 24 Z", rot: -25, cx: 41, cy: 24 },
    { d: "M46 29 L51 27 L50 34 L45 35 L43 31 Z", rot: 15, cx: 47, cy: 31 },
    { d: "M20 32 L26 30 L27 36 L22 38 L17 35 Z", rot: 8, cx: 22, cy: 34 },
    { d: "M31 29 L37 27 L38 33 L33 36 L28 33 Z", rot: -18, cx: 33, cy: 32 },
    { d: "M40 37 L46 35 L44 42 L39 43 L37 39 Z", rot: 22, cx: 42, cy: 39 },
    { d: "M24 40 L29 38 L30 44 L25 45 L22 42 Z", rot: -8, cx: 26, cy: 42 },
  ],
  // Cookie 1
  [
    { d: "M16 24 L21 21 L23 27 L18 29 L14 26 Z", rot: 20, cx: 19, cy: 25 },
    { d: "M27 18 L33 16 L34 22 L29 24 L25 21 Z", rot: -15, cx: 30, cy: 20 },
    { d: "M39 23 L45 21 L44 28 L39 29 L36 25 Z", rot: 30, cx: 41, cy: 25 },
    { d: "M14 33 L19 31 L20 37 L15 39 L11 35 Z", rot: -22, cx: 16, cy: 35 },
    { d: "M28 31 L34 29 L35 35 L30 37 L26 34 Z", rot: 10, cx: 31, cy: 33 },
    { d: "M41 32 L47 30 L46 37 L41 38 L38 34 Z", rot: -28, cx: 43, cy: 34 },
    { d: "M22 41 L27 39 L28 45 L23 46 L19 43 Z", rot: 14, cx: 24, cy: 43 },
    { d: "M35 41 L40 39 L39 45 L34 46 L32 42 Z", rot: -10, cx: 36, cy: 43 },
  ],
  // Cookie 2
  [
    { d: "M19 19 L25 17 L26 23 L21 25 L16 22 Z", rot: -20, cx: 21, cy: 21 },
    { d: "M32 17 L38 15 L39 21 L34 23 L29 20 Z", rot: 25, cx: 34, cy: 19 },
    { d: "M43 27 L49 25 L48 32 L43 33 L40 29 Z", rot: -12, cx: 45, cy: 29 },
    { d: "M12 28 L17 26 L18 32 L13 34 L9 30 Z", rot: 18, cx: 14, cy: 30 },
    { d: "M25 27 L31 25 L32 31 L27 33 L23 30 Z", rot: -30, cx: 28, cy: 29 },
    { d: "M37 36 L43 34 L42 41 L37 42 L34 38 Z", rot: 8, cx: 39, cy: 38 },
    { d: "M17 38 L22 36 L23 42 L18 44 L14 40 Z", rot: -16, cx: 19, cy: 40 },
    { d: "M29 39 L34 37 L35 43 L30 44 L27 41 Z", rot: 22, cx: 31, cy: 41 },
  ],
  // Cookie 3
  [
    { d: "M20 21 L26 18 L28 24 L23 27 L18 24 Z", rot: 12, cx: 23, cy: 23 },
    { d: "M33 19 L39 17 L40 23 L35 25 L30 22 Z", rot: -18, cx: 35, cy: 21 },
    { d: "M44 24 L50 22 L49 29 L44 30 L41 26 Z", rot: 28, cx: 46, cy: 26 },
    { d: "M15 31 L20 29 L21 35 L16 37 L12 33 Z", rot: -8, cx: 17, cy: 33 },
    { d: "M29 30 L35 28 L36 34 L31 36 L26 33 Z", rot: 20, cx: 31, cy: 32 },
    { d: "M40 33 L46 31 L45 38 L40 39 L37 35 Z", rot: -25, cx: 42, cy: 35 },
    { d: "M23 39 L28 37 L29 43 L24 44 L20 41 Z", rot: 15, cx: 25, cy: 41 },
  ],
  // Cookie 4
  [
    { d: "M17 20 L23 17 L25 23 L20 26 L15 23 Z", rot: -14, cx: 20, cy: 22 },
    { d: "M30 15 L36 13 L37 19 L32 21 L27 18 Z", rot: 22, cx: 32, cy: 17 },
    { d: "M41 22 L47 20 L46 27 L41 28 L38 24 Z", rot: -20, cx: 43, cy: 24 },
    { d: "M13 29 L18 27 L19 33 L14 35 L10 31 Z", rot: 16, cx: 15, cy: 31 },
    { d: "M26 28 L32 26 L33 32 L28 34 L24 31 Z", rot: -28, cx: 29, cy: 30 },
    { d: "M38 35 L44 33 L43 40 L38 41 L35 37 Z", rot: 10, cx: 40, cy: 37 },
    { d: "M21 38 L26 36 L27 42 L22 44 L18 40 Z", rot: -12, cx: 23, cy: 40 },
    { d: "M32 40 L37 38 L36 44 L31 45 L29 41 Z", rot: 24, cx: 33, cy: 42 },
  ],
  // Cookie 5
  [
    { d: "M21 23 L27 20 L29 26 L24 29 L19 26 Z", rot: 18, cx: 24, cy: 25 },
    { d: "M34 18 L40 16 L41 22 L36 24 L31 21 Z", rot: -22, cx: 36, cy: 20 },
    { d: "M45 28 L51 26 L50 33 L45 34 L42 30 Z", rot: 12, cx: 47, cy: 30 },
    { d: "M16 32 L21 30 L22 36 L17 38 L13 34 Z", rot: -26, cx: 18, cy: 34 },
    { d: "M28 31 L34 29 L35 35 L30 37 L26 34 Z", rot: 8, cx: 31, cy: 33 },
    { d: "M39 37 L45 35 L44 42 L39 43 L36 39 Z", rot: -16, cx: 41, cy: 39 },
    { d: "M24 41 L29 39 L30 45 L25 46 L21 43 Z", rot: 20, cx: 26, cy: 43 },
  ],
  // Cookie 6
  [
    { d: "M18 18 L24 15 L26 21 L21 24 L16 21 Z", rot: -24, cx: 21, cy: 20 },
    { d: "M31 17 L37 15 L38 21 L33 23 L28 20 Z", rot: 16, cx: 33, cy: 19 },
    { d: "M42 25 L48 23 L47 30 L42 31 L39 27 Z", rot: -10, cx: 44, cy: 27 },
    { d: "M14 27 L19 25 L20 31 L15 33 L11 29 Z", rot: 26, cx: 16, cy: 29 },
    { d: "M27 29 L33 27 L34 33 L29 35 L25 32 Z", rot: -18, cx: 30, cy: 31 },
    { d: "M40 34 L46 32 L45 39 L40 40 L37 36 Z", rot: 14, cx: 42, cy: 36 },
    { d: "M20 39 L25 37 L26 43 L21 45 L17 41 Z", rot: -8, cx: 22, cy: 41 },
    { d: "M33 40 L38 38 L37 44 L32 45 L30 41 Z", rot: 22, cx: 34, cy: 42 },
  ],
  // Cookie 7
  [
    { d: "M19 24 L25 21 L27 27 L22 30 L17 27 Z", rot: 10, cx: 22, cy: 26 },
    { d: "M32 16 L38 14 L39 20 L34 22 L29 19 Z", rot: -20, cx: 34, cy: 18 },
    { d: "M43 23 L49 21 L48 28 L43 29 L40 25 Z", rot: 28, cx: 45, cy: 25 },
    { d: "M15 30 L20 28 L21 34 L16 36 L12 32 Z", rot: -14, cx: 17, cy: 32 },
    { d: "M28 32 L34 30 L35 36 L30 38 L26 35 Z", rot: 18, cx: 31, cy: 34 },
    { d: "M41 31 L47 29 L46 36 L41 37 L38 33 Z", rot: -24, cx: 43, cy: 33 },
    { d: "M23 40 L28 38 L29 44 L24 45 L20 42 Z", rot: 12, cx: 25, cy: 42 },
  ],
  // Cookie 8
  [
    { d: "M17 21 L23 18 L25 24 L20 27 L15 24 Z", rot: -16, cx: 20, cy: 23 },
    { d: "M30 19 L36 17 L37 23 L32 25 L27 22 Z", rot: 24, cx: 32, cy: 21 },
    { d: "M41 26 L47 24 L46 31 L41 32 L38 28 Z", rot: -12, cx: 43, cy: 28 },
    { d: "M13 31 L18 29 L19 35 L14 37 L10 33 Z", rot: 20, cx: 15, cy: 33 },
    { d: "M26 30 L32 28 L33 34 L28 36 L24 33 Z", rot: -28, cx: 29, cy: 32 },
    { d: "M38 36 L44 34 L43 41 L38 42 L35 38 Z", rot: 8, cx: 40, cy: 38 },
    { d: "M21 39 L26 37 L27 43 L22 45 L18 41 Z", rot: -18, cx: 23, cy: 41 },
    { d: "M34 39 L39 37 L38 43 L33 44 L31 40 Z", rot: 16, cx: 35, cy: 41 },
  ],
  // Cookie 9
  [
    { d: "M20 20 L26 17 L28 23 L23 26 L18 23 Z", rot: 14, cx: 23, cy: 22 },
    { d: "M33 18 L39 16 L40 22 L35 24 L30 21 Z", rot: -26, cx: 35, cy: 20 },
    { d: "M44 27 L50 25 L49 32 L44 33 L41 29 Z", rot: 10, cx: 46, cy: 29 },
    { d: "M16 29 L21 27 L22 33 L17 35 L13 31 Z", rot: -20, cx: 18, cy: 31 },
    { d: "M29 28 L35 26 L36 32 L31 34 L27 31 Z", rot: 22, cx: 32, cy: 30 },
    { d: "M40 35 L46 33 L45 40 L40 41 L37 37 Z", rot: -8, cx: 42, cy: 37 },
    { d: "M24 38 L29 36 L30 42 L25 44 L21 40 Z", rot: 18, cx: 26, cy: 40 },
    { d: "M32 41 L37 39 L36 45 L31 46 L29 42 Z", rot: -14, cx: 33, cy: 43 },
  ],
];

function ChipShape({ chip, filled }: { chip: Chip; filled: boolean }) {
  const transform =
    chip.rot && chip.cx && chip.cy
      ? `rotate(${chip.rot} ${chip.cx} ${chip.cy})`
      : undefined;

  return (
    <path
      d={chip.d}
      transform={transform}
      fill={filled ? "#1A0E06" : "none"}
      stroke={filled ? "#0D0704" : NAVY}
      strokeWidth={filled ? 0.5 : 1.3}
      strokeOpacity={filled ? 1 : 0.4}
      strokeLinejoin="miter"
    />
  );
}

function CookieShape({ filled, index }: { filled: boolean; index: number }) {
  const cookiePath = COOKIE_PATHS[index % 3];
  const chips = CHIP_SETS[index % CHIP_SETS.length];
  const uid = `c${index}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <radialGradient id={`${uid}-base`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#F5C860" />
          <stop offset="50%" stopColor="#E8A840" />
          <stop offset="100%" stopColor="#C8842A" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="60%" cy="65%" r="50%">
          <stop offset="0%" stopColor="#A86820" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A86820" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#8B5A20" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={filled ? `url(#${uid}-shadow)` : undefined}>
        <path
          d={cookiePath}
          fill={filled ? `url(#${uid}-base)` : "none"}
          stroke={filled ? "#8B5520" : NAVY}
          strokeWidth={filled ? 2 : 2.2}
          strokeOpacity={filled ? 1 : 0.55}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {filled && (
          <>
            <path d={cookiePath} fill={`url(#${uid}-shade)`} />
            <path
              d={cookiePath}
              fill="none"
              stroke="#7A4818"
              strokeWidth="1.4"
              strokeOpacity="0.5"
            />
            {chips.map((chip, i) => (
              <ChipShape key={i} chip={chip} filled />
            ))}
          </>
        )}

        {!filled && chips.slice(0, 6).map((chip, i) => (
          <ChipShape key={i} chip={chip} filled={false} />
        ))}
      </g>
    </svg>
  );
}

export function StampIcon({ filled, index = 0 }: StampIconProps) {
  return (
    <div
      className={`stamp-slot ${filled ? "stamp-slot--filled" : ""}`}
      style={{ animationDelay: `${0.55 + index * 0.05}s` }}
    >
      <div
        className={filled ? "stamp-cookie stamp-cookie--filled" : "stamp-cookie"}
        style={{ animationDelay: `${0.6 + index * 0.05}s` }}
      >
        <CookieShape filled={filled} index={index} />
      </div>
    </div>
  );
}

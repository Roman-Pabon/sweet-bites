import type { CSSProperties } from "react";

type StampIconProps = {
  filled: boolean;
  index?: number;
  justFilled?: boolean;
};

type CrumbStyle = CSSProperties & {
  "--crumb-dx"?: string;
  "--crumb-dy"?: string;
};

const NAVY = "#1E2430";
const COOKIE_OUTLINE = "#3D2314";
const COOKIE_BODY = "#E8C878";
const COOKIE_BODY_LIGHT = "#F2D898";
const COOKIE_BODY_DARK = "#C89440";

/** Tiny dough specks for texture (fixed per cookie index) */
const SPECK_SETS: { cx: number; cy: number; r: number }[][] = [
  [
    { cx: 22, cy: 18, r: 0.7 },
    { cx: 28, cy: 42, r: 0.5 },
    { cx: 38, cy: 28, r: 0.6 },
    { cx: 16, cy: 36, r: 0.5 },
    { cx: 44, cy: 44, r: 0.7 },
  ],
  [
    { cx: 20, cy: 30, r: 0.6 },
    { cx: 34, cy: 22, r: 0.5 },
    { cx: 26, cy: 46, r: 0.7 },
    { cx: 42, cy: 38, r: 0.5 },
    { cx: 18, cy: 44, r: 0.6 },
  ],
  [
    { cx: 24, cy: 20, r: 0.5 },
    { cx: 30, cy: 38, r: 0.7 },
    { cx: 40, cy: 30, r: 0.5 },
    { cx: 14, cy: 28, r: 0.6 },
    { cx: 36, cy: 46, r: 0.5 },
  ],
];

const COOKIE_PATHS = [
  "M32 7 C39 5 47 8 51 15 C56 20 57 28 54 35 C52 42 46 48 38 52 C30 56 20 54 14 48 C8 42 6 33 9 24 C12 15 20 9 32 7 Z",
  "M30 8 C38 6 46 9 52 16 C57 23 56 32 52 39 C48 46 40 53 31 54 C22 55 13 50 9 41 C5 32 7 22 13 15 C19 8 24 9 30 8 Z",
  "M33 6 C41 7 49 11 53 19 C57 27 55 36 49 43 C43 50 34 55 25 53 C16 51 9 44 7 35 C5 26 10 17 18 11 C24 7 28 5 33 6 Z",
];

/**
 * Single continuous bite edge — three scallops opening toward the removed chunk (upper-right).
 * Quadratic curves: control point pulls into bite zone, end point stays on cookie body.
 */
const BITE_EDGE =
  "Q 51 11 47 15 Q 43 18 52 21 Q 47 25 54 29 Q 49 33 52 40";

const BITE_EDGE_ALT =
  "Q 52 12 48 16 Q 44 19 53 22 Q 48 26 55 30 Q 50 34 53 41";

const BITE_INNER_EDGE =
  "M 45 11 Q 50 12 47 16 Q 44 19 51 22 Q 48 26 53 30 Q 50 34 51 39";

const BITE_INNER_EDGE_ALT =
  "M 46 12 Q 51 13 48 17 Q 45 20 52 23 Q 49 27 54 31 Q 51 35 52 40";

/** Cookie outline with one unified bite — stroke follows the scalloped edge */
const BITTEN_COOKIE_PATHS = [
  `M 32 7 C 39 5 47 8 44 9 ${BITE_EDGE} C 52 42 46 48 38 52 C 30 56 20 54 14 48 C 8 42 6 33 9 24 C 12 15 20 9 32 7 Z`,
  `M 30 8 C 38 6 46 9 45 10 ${BITE_EDGE_ALT} C 48 46 40 53 31 54 C 22 55 13 50 9 41 C 5 32 7 22 13 15 C 19 8 24 9 30 8 Z`,
  `M 33 6 C 41 7 49 11 44 9 ${BITE_EDGE} C 49 43 43 50 34 55 C 25 53 16 51 9 44 C 7 35 5 26 10 17 C 18 11 24 7 28 5 C 31 5 33 6 33 6 Z`,
];

const BITE_INNER_EDGE_PATHS = [BITE_INNER_EDGE, BITE_INNER_EDGE_ALT, BITE_INNER_EDGE];

const BITE_CRUMBS = [
  [
    { d: "M 54 4 L 58 2 L 56 8 L 52 7 Z", dx: 4, dy: -5, fill: COOKIE_BODY_LIGHT },
    { d: "M 59 10 L 62 8 L 60 13 Z", dx: 6, dy: -3, fill: COOKIE_OUTLINE },
    { d: "M 56 14 L 59 12 L 57 16 Z", dx: 5, dy: -1, fill: COOKIE_OUTLINE },
  ],
  [
    { d: "M 55 5 L 59 3 L 57 9 L 53 8 Z", dx: 4, dy: -5, fill: COOKIE_BODY_LIGHT },
    { d: "M 60 11 L 63 9 L 61 14 Z", dx: 6, dy: -3, fill: COOKIE_OUTLINE },
    { d: "M 57 15 L 60 13 L 58 17 Z", dx: 5, dy: -2, fill: COOKIE_OUTLINE },
  ],
  [
    { d: "M 53 3 L 57 1 L 55 7 L 51 6 Z", dx: 4, dy: -6, fill: COOKIE_BODY_LIGHT },
    { d: "M 58 9 L 61 7 L 59 12 Z", dx: 6, dy: -4, fill: COOKIE_OUTLINE },
    { d: "M 55 13 L 58 11 L 56 15 Z", dx: 5, dy: -2, fill: COOKIE_OUTLINE },
  ],
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

type BiteData = {
  bittenPath: string;
  fullPath: string;
  innerEdge: string;
  crumbs: { d: string; dx: number; dy: number; fill: string }[];
  origin: { x: number; y: number };
};

function getBiteData(index: number): BiteData {
  const shape = index % 3;
  return {
    bittenPath: BITTEN_COOKIE_PATHS[shape],
    fullPath: COOKIE_PATHS[shape],
    innerEdge: BITE_INNER_EDGE_PATHS[shape],
    crumbs: BITE_CRUMBS[shape],
    origin: { x: 50, y: 20 },
  };
}

function ChipShape({ chip, filled }: { chip: Chip; filled: boolean }) {
  const transform =
    chip.rot && chip.cx && chip.cy
      ? `rotate(${chip.rot} ${chip.cx} ${chip.cy})`
      : undefined;

  if (!filled) {
    return (
      <path
        d={chip.d}
        transform={transform}
        fill="none"
        stroke={NAVY}
        strokeWidth={1.3}
        strokeOpacity={0.4}
        strokeLinejoin="miter"
      />
    );
  }

  return (
    <g transform={transform}>
      <path
        d={chip.d}
        fill="#2A1508"
        stroke={COOKIE_OUTLINE}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {chip.cx && chip.cy && (
        <circle
          cx={chip.cx - 1}
          cy={chip.cy - 1}
          r={1.1}
          fill="#4A2810"
          opacity={0.55}
        />
      )}
    </g>
  );
}

function CookieShape({
  filled,
  index,
  justFilled,
}: {
  filled: boolean;
  index: number;
  justFilled?: boolean;
}) {
  const shapeIndex = index % 3;
  const cookiePath = COOKIE_PATHS[shapeIndex];
  const bittenPath = BITTEN_COOKIE_PATHS[shapeIndex];
  const chips = CHIP_SETS[index % CHIP_SETS.length];
  const specks = SPECK_SETS[index % SPECK_SETS.length];
  const bite = getBiteData(index);
  const uid = `c${index}`;

  const outlineCookie = (
    <>
      <path
        d={cookiePath}
        fill="none"
        stroke={NAVY}
        strokeWidth={2.2}
        strokeOpacity={0.55}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {chips.slice(0, 6).map((chip, i) => (
        <ChipShape key={i} chip={chip} filled={false} />
      ))}
    </>
  );

  const filledCookieBody = (
    <>
      <path
        d={bittenPath}
        fill={`url(#${uid}-base)`}
        stroke={COOKIE_OUTLINE}
        strokeWidth={2.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d={bittenPath} fill={`url(#${uid}-shade)`} stroke="none" />
      <g clipPath={`url(#${uid}-clip)`}>
        {specks.map((speck, i) => (
          <circle
            key={i}
            cx={speck.cx}
            cy={speck.cy}
            r={speck.r}
            fill={COOKIE_OUTLINE}
            opacity={0.35}
          />
        ))}
        {chips
          .filter((chip) => !(chip.cx && chip.cx > 44 && chip.cy && chip.cy < 38))
          .map((chip, i) => (
            <ChipShape key={i} chip={chip} filled />
          ))}
      </g>
      <path
        d={bite.innerEdge}
        fill="none"
        stroke={COOKIE_BODY_DARK}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </>
  );

  const biteOverlay = justFilled ? (
    <>
      {bite.crumbs.map((crumb, i) => (
        <path
          key={i}
          className="cookie-bite-crumb cookie-bite-crumb--animate"
          d={crumb.d}
          fill={crumb.fill}
          stroke={COOKIE_OUTLINE}
          strokeWidth="0.8"
          strokeLinejoin="round"
          style={
            {
              "--crumb-dx": `${crumb.dx}px`,
              "--crumb-dy": `${crumb.dy}px`,
              animationDelay: `${0.35 + i * 0.07}s`,
            } as CrumbStyle
          }
        />
      ))}
    </>
  ) : null;

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <radialGradient id={`${uid}-base`} cx="38%" cy="32%" r="58%">
          <stop offset="0%" stopColor={COOKIE_BODY_LIGHT} />
          <stop offset="55%" stopColor={COOKIE_BODY} />
          <stop offset="100%" stopColor={COOKIE_BODY_DARK} />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="62%" cy="68%" r="48%">
          <stop offset="0%" stopColor="#A87830" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A87830" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#8B5A20" floodOpacity="0.35" />
        </filter>
        {filled && (
          <clipPath id={`${uid}-clip`}>
            <path d={bittenPath} />
          </clipPath>
        )}
      </defs>

      <g filter={filled ? `url(#${uid}-shadow)` : undefined}>
        {filled ? (
          <>
            {justFilled && (
              <g className="cookie-outline-before-bite" aria-hidden="true">
                {outlineCookie}
              </g>
            )}
            <g
              className={justFilled ? "cookie-filled-reveal cookie-bite-draw" : undefined}
              style={
                justFilled
                  ? { transformOrigin: `${bite.origin.x}px ${bite.origin.y}px` }
                  : undefined
              }
            >
              {filledCookieBody}
            </g>
            {biteOverlay}
          </>
        ) : (
          outlineCookie
        )}
      </g>
    </svg>
  );
}

export function StampIcon({ filled, index = 0, justFilled = false }: StampIconProps) {
  return (
    <div
      className={`stamp-slot ${filled ? "stamp-slot--filled" : ""} ${
        justFilled ? "stamp-slot--just-filled" : ""
      }`}
      style={{ animationDelay: `${0.55 + index * 0.05}s` }}
    >
      <div
        className={
          filled
            ? justFilled
              ? "stamp-cookie stamp-cookie--just-filled"
              : "stamp-cookie stamp-cookie--filled"
            : "stamp-cookie"
        }
        style={{ animationDelay: `${0.6 + index * 0.05}s` }}
      >
        <CookieShape filled={filled} index={index} justFilled={justFilled} />
      </div>
    </div>
  );
}

import type { Garden } from "@/features/progress/api/get-garden";

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Dibujo del jardín (CU-07, RS-PR-02): capas SVG predefinidas, nunca imágenes
 * generadas. Cielo y colina son la capa general; sobre la colina, una planta
 * por zona que crece por etapa (0 semilla … 5) y los elementos especiales de
 * cada meta semanal cumplida. Nada se marchita ni retrocede (RN-PR-04).
 * Decorativo: los mismos datos están en texto debajo de la escena.
 */
export function GardenScene({ garden }: { garden: Garden }) {
  const has = (code: string) => garden.especiales.includes(code);

  return (
    // overflow visible: en pantallas anchas la colina y los árboles lejanos siguen más allá del dibujo central.
    <svg viewBox="0 0 400 250" overflow="visible" className="block h-auto w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id="garden-hill" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="250">
          <stop offset="0" stopColor="var(--garden-hill-top)" />
          <stop offset="1" stopColor="var(--garden-hill-mid)" />
        </linearGradient>
        <radialGradient id="garden-glow" cx="0.5" cy="0.35" r="0.5">
          <stop offset="0" stopColor="var(--garden-glow)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--garden-glow)" stopOpacity="0" />
        </radialGradient>
        <filter id="garden-far" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {garden.general.elements > 0 && <RainCloud />}

      {/* Árboles lejanos, desenfocados, a los lados */}
      <g filter="url(#garden-far)" opacity="0.75">
        <FarTree x={18} y={150} r={30} />
        <FarTree x={62} y={160} r={22} />
        <FarTree x={340} y={152} r={26} />
        <FarTree x={384} y={146} r={32} />
        <FarTree x={-40} y={162} r={28} />
        <FarTree x={-110} y={170} r={34} />
        <FarTree x={-190} y={176} r={26} />
        <FarTree x={440} y={160} r={30} />
        <FarTree x={510} y={168} r={24} />
        <FarTree x={585} y={174} r={32} />
      </g>

      {/* Colina: capa general */}
      <path d="M-400 226 C -120 224, 40 140, 200 140 C 360 140, 520 224, 800 226 L 800 250 L -400 250 Z" fill="url(#garden-hill)" />
      <ellipse cx="200" cy="170" rx="150" ry="40" fill="url(#garden-glow)" />
      <GrassTufts stage={garden.general.stage} />

      {has("S1") && <Bench x={48} y={206} />}
      {has("S2") && <Lantern x={356} y={202} />}
      {has("S4") && <Fountain x={306} y={232} />}

      <RootsTree x={118} y={170} stage={garden.raices.stage} />
      <FlowerBush x={204} y={160} stage={garden.flores.stage} />
      <Reeds x={286} y={170} stage={garden.ritmo.stage} />

      {has("S3") && (
        <>
          <Butterfly x={176} y={96} delay="0s" />
          <Butterfly x={236} y={110} delay="-1.4s" />
        </>
      )}
    </svg>
  );
}

function FarTree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <rect x={x - 3} y={y} width="6" height={r * 0.9} rx="3" fill="var(--garden-far-trunk)" />
      <circle cx={x} cy={y - r * 0.2} r={r} fill="var(--garden-far-tree)" />
      <circle cx={x - r * 0.55} cy={y + r * 0.15} r={r * 0.6} fill="var(--garden-far-tree)" />
      <circle cx={x + r * 0.55} cy={y + r * 0.1} r={r * 0.65} fill="var(--garden-far-tree)" />
    </g>
  );
}

function RainCloud() {
  return (
    <g className="garden-cloud">
      <g fill="var(--garden-cloud)">
        <circle cx="300" cy="40" r="13" />
        <circle cx="316" cy="34" r="16" />
        <circle cx="334" cy="42" r="12" />
        <rect x="290" y="40" width="54" height="13" rx="6.5" />
      </g>
      {[298, 312, 326, 338].map((x, i) => (
        <line
          key={x}
          x1={x}
          y1="58"
          x2={x - 3}
          y2="68"
          stroke="var(--flow)"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
          className="garden-drop"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </g>
  );
}

const TUFTS = [
  [24, 214], [92, 188], [158, 206], [246, 204], [322, 190], [378, 214],
  [60, 236], [140, 232], [262, 238], [350, 236],
] as const;

/** Pasto: más matas a medida que crece la capa general (cada registro riega todo). */
function GrassTufts({ stage }: { stage: Stage }) {
  const count = [2, 4, 5, 7, 8, 10][stage];
  return (
    <g fill="none" stroke="var(--garden-grass)" strokeWidth="2" strokeLinecap="round">
      {TUFTS.slice(0, count).map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 4} ${y} q 1 -6 -1 -9 M${x} ${y} q 0 -8 1 -11 M${x + 4} ${y} q 0 -6 3 -8`} />
      ))}
    </g>
  );
}

function GroundShadow({ x, y, rx }: { x: number; y: number; rx: number }) {
  return <ellipse cx={x} cy={y + 2} rx={rx} ry={rx * 0.22} fill="var(--garden-shadow)" />;
}

function Seed({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <GroundShadow x={x} y={y} rx={14} />
      <ellipse cx={x} cy={y - 2} rx="9" ry="5" fill="var(--garden-soil)" />
      <path d={`M${x} ${y - 6} q -1 -7 -6 -9 M${x} ${y - 6} q 2 -8 7 -9`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/** Raíces (D1): un árbol con raíces a la vista; tronco y copa crecen por etapa. */
function RootsTree({ x, y, stage }: { x: number; y: number; stage: Stage }) {
  if (stage === 0) return <Seed x={x} y={y} color="var(--garden-leaf)" />;
  const trunk = 16 + stage * 7;
  const r = 10 + stage * 4;
  const top = y - trunk;
  return (
    <g>
      <GroundShadow x={x} y={y} rx={r * 1.1} />
      {/* raíces que asoman */}
      <g fill="none" stroke="var(--root)" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
        {Array.from({ length: Math.min(stage + 1, 5) }, (_, i) => {
          const dx = (i - Math.min(stage, 4) / 2) * 7;
          return <path key={i} d={`M${x} ${y - 2} q ${dx * 0.6} 4 ${dx} 9`} />;
        })}
      </g>
      <path d={`M${x - 5} ${y} L${x - 3} ${top + 6} L${x + 3} ${top + 6} L${x + 5} ${y} Z`} fill="var(--garden-trunk)" />
      <g fill="var(--garden-canopy-root)">
        <circle cx={x} cy={top - r * 0.2} r={r} />
        <circle cx={x - r * 0.75} cy={top + r * 0.25} r={r * 0.7} />
        <circle cx={x + r * 0.75} cy={top + r * 0.2} r={r * 0.72} />
      </g>
      {/* frutos color tierra, uno más por etapa */}
      <g fill="var(--root)">
        {Array.from({ length: stage }, (_, i) => {
          const angle = -2.4 + i * 1.1;
          return <circle key={i} cx={x + Math.cos(angle) * r * 0.7} cy={top - r * 0.1 + Math.sin(angle) * r * 0.55} r="2.6" />;
        })}
      </g>
    </g>
  );
}

const FLOWER_SPOTS = [
  [0, -1.05], [-0.62, -0.62], [0.62, -0.62], [-0.95, 0], [0.95, 0.05],
  [-0.3, -0.3], [0.32, -0.25], [0, 0.25], [-0.6, 0.3],
] as const;

function Flower({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={x + Math.cos(rad) * size} cy={y + Math.sin(rad) * size} r={size * 0.8} fill="var(--bloom)" />;
      })}
      <circle cx={x} cy={y} r={size * 0.7} fill="var(--garden-sun)" />
    </g>
  );
}

/** Flores (D2): un arbusto que se llena de flores; más flores por etapa. */
function FlowerBush({ x, y, stage }: { x: number; y: number; stage: Stage }) {
  if (stage === 0) return <Seed x={x} y={y} color="var(--garden-leaf)" />;
  const r = 14 + stage * 5;
  const cy = y - r * 0.75;
  const flowers = [0, 2, 3, 5, 7, 9][stage];
  return (
    <g>
      <GroundShadow x={x} y={y} rx={r * 1.15} />
      <g fill="var(--garden-canopy-bloom)">
        <ellipse cx={x} cy={cy} rx={r} ry={r * 0.85} />
        <circle cx={x - r * 0.8} cy={cy + r * 0.3} r={r * 0.55} />
        <circle cx={x + r * 0.8} cy={cy + r * 0.3} r={r * 0.55} />
      </g>
      {FLOWER_SPOTS.slice(0, flowers).map(([fx, fy]) => (
        <Flower key={`${fx}-${fy}`} x={x + fx * r * 0.75} y={cy + fy * r * 0.6} size={2.4 + stage * 0.35} />
      ))}
    </g>
  );
}

/** Ritmo (D3): juncos que se mecen con calma; más tallos y más altos por etapa. */
function Reeds({ x, y, stage }: { x: number; y: number; stage: Stage }) {
  if (stage === 0) return <Seed x={x} y={y} color="var(--garden-leaf)" />;
  const count = [0, 3, 4, 5, 7, 9][stage];
  const height = 26 + stage * 9;
  return (
    <g>
      <GroundShadow x={x} y={y} rx={10 + count * 2.2} />
      {Array.from({ length: count }, (_, i) => {
        const offset = (i - (count - 1) / 2) * 5;
        const h = height * (0.75 + ((i * 37) % 10) / 40);
        const bend = i % 2 === 0 ? 6 : -6;
        return (
          <g key={i} className="garden-sway" style={{ transformOrigin: `${x + offset}px ${y}px`, animationDelay: `${-i * 0.4}s` }}>
            <path
              d={`M${x + offset} ${y} q ${bend} ${-h * 0.5} ${bend * 0.4} ${-h}`}
              fill="none"
              stroke="var(--garden-leaf)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <ellipse cx={x + offset + bend * 0.4} cy={y - h - 4} rx="2.6" ry="6" fill="var(--flow)" />
          </g>
        );
      })}
    </g>
  );
}

function Bench({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <GroundShadow x={x} y={y} rx={20} />
      <g fill="var(--garden-wood)">
        <rect x={x - 18} y={y - 16} width="36" height="4" rx="2" />
        <rect x={x - 18} y={y - 10} width="36" height="4" rx="2" />
        <rect x={x - 15} y={y - 7} width="3" height="8" />
        <rect x={x + 12} y={y - 7} width="3" height="8" />
      </g>
    </g>
  );
}

function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <GroundShadow x={x} y={y} rx={9} />
      <circle cx={x} cy={y - 40} r="12" fill="var(--garden-sun)" opacity="0.35" />
      <rect x={x - 1.5} y={y - 34} width="3" height="34" fill="var(--garden-wood)" />
      <rect x={x - 6} y={y - 46} width="12" height="13" rx="3" fill="var(--garden-sun)" stroke="var(--garden-wood)" strokeWidth="2" />
    </g>
  );
}

function Fountain({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <GroundShadow x={x} y={y} rx={18} />
      <path d={`M${x - 16} ${y - 8} h32 l-4 8 h-24 Z`} fill="var(--garden-stone)" />
      <rect x={x - 2} y={y - 18} width="4" height="10" fill="var(--garden-stone)" />
      <path d={`M${x} ${y - 18} q -8 -8 -12 4 M${x} ${y - 18} q 8 -8 12 4`} fill="none" stroke="var(--flow)" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Butterfly({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g className="garden-flutter" style={{ animationDelay: delay, transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={x - 4} cy={y} rx="4.5" ry="3.2" fill="var(--flow)" opacity="0.85" />
      <ellipse cx={x + 4} cy={y} rx="4.5" ry="3.2" fill="var(--bloom)" opacity="0.85" />
      <rect x={x - 0.8} y={y - 3} width="1.6" height="6" rx="0.8" fill="var(--garden-trunk)" />
    </g>
  );
}

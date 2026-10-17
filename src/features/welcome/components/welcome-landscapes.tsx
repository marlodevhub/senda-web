import type { ReactNode } from "react";

/**
 * Los paisajes de la bienvenida (CU-17), uno por pantalla y pensado para su ilustración, en el sistema de
 * 1440 × 520 (la mitad de abajo de la pantalla). Cada uno tiene tres capas —lejos, medio y cerca— que WelcomeBackdrop
 * mueve a distinta velocidad (parallax) al pasar de pantalla. Los colores salen de las clases `.welcome-mountain-*`,
 * `.welcome-tree`, `.welcome-water` y `.welcome-light` (mezclas del color de la pantalla en globals.css).
 */
export type Landscape = { far: ReactNode; mid: ReactNode; near: ReactNode };

/** Pino: punta en (x, y) y alto h. */
function pine(x: number, y: number, h: number) {
  return `M${x} ${y} l${h * 0.3} ${h} h-${h * 0.6} z`;
}

/** Árbol redondo: copa de radio r sobre un tronco, con la base en (x, y). */
function RoundTree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g className="welcome-tree">
      <rect x={x - r * 0.12} y={y - r * 1.3} width={r * 0.24} height={r * 1.3} rx={r * 0.08} />
      <circle cx={x} cy={y - r * 1.7} r={r} />
      <circle cx={x - r * 0.65} cy={y - r * 1.25} r={r * 0.62} />
      <circle cx={x + r * 0.65} cy={y - r * 1.25} r={r * 0.62} />
    </g>
  );
}

/** Cactus saguaro con la base en (x, y) y alto h. */
function Cactus({ x, y, h }: { x: number; y: number; h: number }) {
  const w = h * 0.16;
  return (
    <g className="welcome-tree">
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w / 2} />
      <path
        d={`M${x - w / 2} ${y - h * 0.45} h-${h * 0.18} v-${h * 0.28}`}
        strokeWidth={w * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="welcome-tree-stroke"
      />
      <path
        d={`M${x + w / 2} ${y - h * 0.58} h${h * 0.18} v-${h * 0.22}`}
        strokeWidth={w * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="welcome-tree-stroke"
      />
    </g>
  );
}

/** Qué es Senda: prados con colinas suaves y árboles redondos. */
const MEADOW: Landscape = {
  far: (
    <path
      className="welcome-mountain-far"
      d="M0 260 C160 210 300 230 440 250 C600 272 720 200 900 214 C1060 226 1200 270 1440 236 V520 H0 Z"
    />
  ),
  mid: (
    <>
      <path
        className="welcome-mountain-mid"
        d="M0 340 C200 300 360 320 520 338 C700 358 860 300 1040 310 C1200 318 1320 340 1440 330 V520 H0 Z"
      />
      <RoundTree x={240} y={330} r={34} />
      <RoundTree x={1130} y={312} r={28} />
      <RoundTree x={1210} y={318} r={20} />
    </>
  ),
  near: (
    <>
      <path
        className="welcome-mountain-near"
        d="M0 420 C240 384 420 410 640 400 C860 390 1040 420 1240 404 C1340 396 1400 398 1440 400 V520 H0 Z"
      />
      <RoundTree x={70} y={430} r={46} />
      <RoundTree x={1370} y={420} r={52} />
      <g className="welcome-light">
        {[180, 260, 340, 1180, 1260].map((x, i) => (
          <circle key={x} cx={x} cy={452 + (i % 2) * 14} r={5} />
        ))}
      </g>
    </>
  ),
};

/** Qué no es: desierto al atardecer, con mesetas, dunas y cactus. */
const DESERT: Landscape = {
  far: (
    <path
      className="welcome-mountain-far"
      d="M0 270 H120 L160 220 H330 L370 270 H860 L900 200 H1090 L1130 270 H1440 V520 H0 Z"
    />
  ),
  mid: (
    <>
      <path
        className="welcome-mountain-mid"
        d="M0 340 C180 300 320 296 480 330 C620 358 760 290 960 300 C1140 310 1280 350 1440 320 V520 H0 Z"
      />
      <Cactus x={300} y={322} h={70} />
      <Cactus x={1180} y={318} h={56} />
    </>
  ),
  near: (
    <>
      <path
        className="welcome-mountain-near"
        d="M0 410 C200 370 420 380 620 412 C820 444 1040 380 1240 392 C1340 398 1400 410 1440 404 V520 H0 Z"
      />
      <Cactus x={110} y={440} h={150} />
      <Cactus x={1330} y={430} h={128} />
      <g className="welcome-tree">
        <ellipse cx={520} cy={470} rx={22} ry={8} />
        <ellipse cx={900} cy={462} rx={16} ry={6} />
      </g>
    </>
  ),
};

/** Cómo se usa: el mar de noche, con islas a lo lejos y el reflejo de la luna. */
const SEA: Landscape = {
  far: (
    <>
      <path
        className="welcome-mountain-far"
        d="M120 262 C170 220 230 210 300 262 Z M980 262 C1040 214 1110 200 1190 236 C1230 252 1250 258 1270 262 Z"
      />
      <path className="welcome-water-far" d="M0 262 H1440 V520 H0 Z" />
    </>
  ),
  mid: (
    <>
      <path className="welcome-water" d="M0 320 C240 310 480 330 720 320 C960 310 1200 330 1440 320 V520 H0 Z" />
      {/* El reflejo de la luna (a la derecha, bajo la luna de escritorio) */}
      <g fill="#fff" opacity={0.45}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={980 + (i % 2) * 18 - i * 6} y={278 + i * 30} width={150 - i * 16} height={6} rx={3} />
        ))}
      </g>
    </>
  ),
  near: (
    <>
      <path
        className="welcome-water-near"
        d="M0 420 C120 404 240 436 360 420 C480 404 600 436 720 420 C840 404 960 436 1080 420 C1200 404 1320 436 1440 420 V520 H0 Z"
      />
      <path
        className="welcome-mountain-near"
        d="M0 470 C80 450 160 452 260 476 C300 486 330 500 340 520 H0 Z M1100 520 C1150 480 1260 450 1440 452 V520 Z"
      />
    </>
  ),
};

/** Tu punto de partida: montañas con picos nevados y pinos. */
const MOUNTAINS: Landscape = {
  far: (
    <>
      <path
        className="welcome-mountain-far"
        d="M0 260 L150 170 L260 240 L420 100 L580 230 L700 160 L860 250 L1000 120 L1150 230 L1290 150 L1440 230 V520 H0 Z"
      />
      <g className="welcome-snow">
        <path d="M420 100 L452 128 L436 126 L420 140 L404 128 L390 128 Z" />
        <path d="M1000 120 L1030 146 L1014 144 L1000 158 L986 146 L972 144 Z" />
        <path d="M150 170 L170 188 L158 188 L150 196 L142 188 L132 186 Z" />
        <path d="M1290 150 L1312 170 L1300 168 L1290 178 L1280 170 L1268 168 Z" />
      </g>
    </>
  ),
  mid: (
    <>
      <path
        className="welcome-mountain-mid"
        d="M0 330 C140 290 240 250 360 280 C470 308 560 230 700 250 C850 272 930 330 1080 300 C1210 274 1320 250 1440 280 V520 H0 Z"
      />
      <g className="welcome-tree">
        {[
          [520, 236, 70],
          [560, 250, 54],
          [1220, 254, 60],
        ].map(([x, y, h]) => (
          <path key={x} d={pine(x, y, h)} />
        ))}
      </g>
    </>
  ),
  near: (
    <>
      <path
        className="welcome-mountain-near"
        d="M0 410 C180 370 320 400 470 380 C640 356 760 420 940 400 C1110 381 1260 350 1440 380 V520 H0 Z"
      />
      <g className="welcome-tree">
        {[
          [30, 370, 150],
          [80, 410, 110],
          [130, 450, 70],
          [1300, 430, 90],
          [1350, 380, 140],
          [1405, 420, 100],
        ].map(([x, y, h]) => (
          <path key={x} d={pine(x, y, h)} />
        ))}
      </g>
    </>
  ),
};

/** Cuéntanos de ti: una ciudad al anochecer, con ventanas encendidas. */
const CITY: Landscape = {
  far: (
    <path
      className="welcome-mountain-far"
      d="M0 280 H70 V230 H120 V260 H180 V200 H230 V250 H300 V220 H360 V280 H520 V240 H580 V190 H640 V250 H720 V280 H860 V230 H930 V180 H980 V240 H1060 V210 H1120 V260 H1200 V220 H1260 V250 H1340 V200 H1400 V280 H1440 V520 H0 Z"
    />
  ),
  mid: (
    <>
      <path
        className="welcome-mountain-mid"
        d="M0 340 H60 V270 H150 V310 H210 V250 H300 V330 H420 V290 H500 V340 H900 V300 H980 V260 H1060 V320 H1160 V280 H1240 V250 H1320 V320 H1440 V520 H0 Z"
      />
      <g className="welcome-light">
        {[
          [80, 288],
          [116, 300],
          [230, 270],
          [262, 296],
          [440, 306],
          [1000, 282],
          [1030, 306],
          [1180, 296],
          [1262, 270],
          [1290, 296],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={12} height={14} rx={2} />
        ))}
      </g>
    </>
  ),
  near: (
    <>
      <path
        className="welcome-mountain-near"
        d="M0 420 C220 392 420 412 640 404 C860 396 1060 420 1260 404 C1360 396 1410 400 1440 402 V520 H0 Z"
      />
      <RoundTree x={90} y={440} r={42} />
      <RoundTree x={1350} y={430} r={48} />
    </>
  ),
};

export const LANDSCAPES = { MEADOW, DESERT, SEA, MOUNTAINS, CITY };

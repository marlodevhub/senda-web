import type { CSSProperties } from "react";

/**
 * El fondo de la bienvenida (CU-17), a pantalla completa en móvil y escritorio: cielo en degradado, una luna grande
 * con su resplandor, estrellas que titilan, nubes que flotan, tres capas de montañas y pinos al frente. Todo sale de
 * `from` y `to` (los colores de la pantalla): los demás tonos se mezclan en CSS, así cambia por completo de color con
 * una transición al pasar de pantalla (`.welcome-backdrop` en globals.css). `moon` mueve la luna: detrás de la
 * ilustración (en escritorio, a la derecha; en móvil, arriba). Decorativo.
 */
export function WelcomeBackdrop({ from, to }: { from: string; to: string }) {
  const vars = { "--wb-from": from, "--wb-to": to } as CSSProperties;
  return (
    <div aria-hidden className="welcome-backdrop pointer-events-none absolute inset-0 overflow-hidden" style={vars}>
      {/* Cielo */}
      <div className="welcome-backdrop-sky absolute inset-0" />

      {/* Estrellas: puntos redondos en cualquier proporción de pantalla. */}
      {STARS.map(([x, y, r, d]) => (
        <span
          key={`${x}-${y}`}
          className="welcome-star absolute rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%`, width: `${r * 10}px`, height: `${r * 10}px`, animationDelay: `${d}s` }}
        />
      ))}

      {/* La luna con su resplandor: detrás de la ilustración. */}
      <div className="welcome-moon welcome-moon-glow absolute" />

      {/* Nubes */}
      <svg className="welcome-cloud absolute top-[14%] left-[8%] w-[22vmax] opacity-50" viewBox="0 0 200 50">
        <path
          d="M10 44h170c10 0 14-14 2-18-2-12-18-16-28-8-6-14-30-16-38-2-10-6-26 0-26 12-12-4-26 2-26 10-10 0-14 6-12 6z"
          fill="#fff"
        />
      </svg>
      <svg
        className="welcome-cloud welcome-cloud-slow absolute top-[8%] right-[10%] w-[16vmax] opacity-40"
        viewBox="0 0 200 50"
      >
        <path
          d="M10 44h170c10 0 14-14 2-18-2-12-18-16-28-8-6-14-30-16-38-2-10-6-26 0-26 12-12-4-26 2-26 10-10 0-14 6-12 6z"
          fill="#fff"
        />
      </svg>

      {/* Montañas y pinos */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[52%] w-full"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          className="welcome-mountain-far"
          d="M0 250 L120 190 L230 240 L380 120 L520 230 L640 170 L790 260 L930 140 L1080 230 L1220 160 L1340 220 L1440 180 V520 H0 Z"
        />
        <path
          className="welcome-mountain-mid"
          d="M0 330 C140 290 240 250 360 280 C470 308 560 230 700 250 C850 272 930 330 1080 300 C1210 274 1320 250 1440 280 V520 H0 Z"
        />
        <path
          className="welcome-mountain-near"
          d="M0 410 C180 370 320 400 470 380 C640 356 760 420 940 400 C1110 381 1260 350 1440 380 V520 H0 Z"
        />
        <g className="welcome-tree">
          {TREES.map(([x, h]) => (
            <path key={x} d={`M${x} ${520 - h} l${h * 0.28} ${h} h-${h * 0.56} z`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** x, y (en %), radio y desfase de su titileo. */
const STARS: [number, number, number, number][] = [
  [6, 10, 0.35, 0],
  [18, 26, 0.25, 1.2],
  [29, 8, 0.3, 0.6],
  [41, 20, 0.22, 2],
  [52, 6, 0.3, 1.5],
  [63, 30, 0.2, 0.3],
  [74, 12, 0.28, 2.4],
  [86, 24, 0.24, 0.9],
  [94, 6, 0.32, 1.8],
  [12, 40, 0.2, 2.8],
  [57, 42, 0.18, 1.1],
  [90, 44, 0.2, 0.4],
];

/** Pinos al frente: x y alto, en el sistema de 1440 × 520. */
const TREES: [number, number][] = [
  [30, 150],
  [80, 110],
  [130, 70],
  [1300, 90],
  [1350, 140],
  [1405, 100],
];

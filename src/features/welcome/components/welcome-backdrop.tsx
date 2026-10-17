import type { CSSProperties } from "react";
import type { Landscape } from "@/features/welcome/components/welcome-landscapes";

/** Las tres capas del paisaje y cuánto se mueven al pasar de pantalla (1 = todo el ancho). */
const LAYERS = [
  { key: "far", speed: 0.25, base: { y: 300, className: "welcome-mountain-far" } },
  { key: "mid", speed: 0.55, base: { y: 370, className: "welcome-mountain-mid" } },
  { key: "near", speed: 1, base: { y: 470, className: "welcome-mountain-near" } },
] as const;

/**
 * El fondo de la bienvenida (CU-17), a pantalla completa en móvil y escritorio: cielo en degradado, una luna grande
 * con su resplandor, estrellas que titilan, nubes que flotan y, abajo, el paisaje de cada pantalla (`landscapes`, el
 * de `index` a la vista) en tres capas con parallax al pasar de pantalla. Todo sale de
 * `from` y `to` (los colores de la pantalla): los demás tonos se mezclan en CSS, así cambia por completo de color con
 * una transición al pasar de pantalla (`.welcome-backdrop` en globals.css). `moon` mueve la luna: detrás de la
 * ilustración (en escritorio, a la derecha; en móvil, arriba). Decorativo.
 */
export function WelcomeBackdrop({
  from,
  to,
  landscapes,
  index,
}: {
  from: string;
  to: string;
  landscapes: Landscape[];
  index: number;
}) {
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

      {/*
        Los paisajes de todas las pantallas, uno encima de otro: al pasar de pantalla, cada capa se desliza a su
        velocidad (lejos poco, cerca mucho: parallax) y el paisaje que se va se desvanece mientras entra el nuevo.
      */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[52%] w-full overflow-visible"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
      >
        {LAYERS.map(({ key, speed, base }) =>
          landscapes.map((landscape, i) => (
            <g
              key={`${key}-${i}`}
              className="welcome-layer"
              style={{
                transform: `translateX(${(i - index) * 1440 * speed}px)`,
                opacity: i === index ? 1 : 0,
              }}
            >
              {/* Base ancha bajo cada capa: al deslizarse, no deja ver el cielo por los bordes. */}
              <rect x={-1440} y={base.y} width={4320} height={520 - base.y} className={base.className} />
              {landscape[key]}
            </g>
          )),
        )}
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

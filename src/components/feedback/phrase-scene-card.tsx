"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, Feather, RotateCcw } from "lucide-react";
import { patternDot, SCENE_INK, sceneOf, type Scene } from "@/lib/pattern-style";
import { cn } from "@/lib/utils";

const RADIUS = "rounded-[0.875rem]";

/**
 * Una frase dura como tarjeta de clima (RN-ES-13). De frente, solo el paisaje de su tipo de frase y su título con
 * "Ver" debajo, en letras pastel; toda la tarjeta se toca para darla vuelta. Atrás, la frase que escribió y, con
 * `href`, el botón "Reescribir", que lleva a reescribir su registro (CU-04); "Ocultar" la regresa.
 */
export function PhraseSceneCard({
  fragment,
  title,
  pattern,
  href,
  linkLabel,
  className,
}: {
  fragment: string;
  /** El nombre corto del tipo de frase (`analysis.patternTitles`). */
  title: string;
  pattern: string;
  /** A dónde lleva "Reescribir" (la reescritura de su registro). */
  href?: string;
  /** Nombre accesible de "Reescribir" ("Reescribir: “…”"). */
  linkLabel?: string;
  className?: string;
}) {
  const t = useTranslations();
  const scene = sceneOf(pattern);
  const [flipped, setFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);

  // Al dar vuelta la tarjeta, el foco pasa a la cara que queda a la vista.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (flipped ? backButton : frontButton).current?.focus();
  }, [flipped]);

  return (
    <div className={cn("[perspective:1200px]", className)}>
      <div
        className={cn(
          "grid aspect-[9/5] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Frente: toda la tarjeta es el botón que la da vuelta. */}
        <button
          ref={frontButton}
          type="button"
          inert={flipped}
          aria-label={t("home.pendingFlip", { title })}
          onClick={() => setFlipped(true)}
          className={cn(
            "group relative isolate flex h-full flex-col items-start overflow-hidden p-3 text-left shadow-card transition-[box-shadow,filter] [grid-area:1/1] [backface-visibility:hidden] hover:shadow-bloom hover:brightness-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            RADIUS,
            SCENE_INK[scene],
          )}
        >
          <SceneArt scene={scene} />
          {/* Una sombra suave arriba a la izquierda, para que las letras pastel se lean en los cielos claros (≥ 4,5:1). */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_top_left,rgba(0,0,0,0.42),rgba(0,0,0,0.3)_45%,transparent_100%)]"
          />
          <span className="max-w-full truncate pr-8 font-heading text-[1.1875rem] leading-tight font-bold">{title}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 group-hover:underline">
            <Eye className="size-4" aria-hidden />
            {t("home.pendingFlipShort")}
          </span>
        </button>

        {/* Atrás: la frase que escribió, "Ocultar" y "Reescribir". */}
        <div
          inert={!flipped}
          className={cn(
            "flex h-full flex-col justify-between gap-2 overflow-hidden bg-card p-3 shadow-card [grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]",
            RADIUS,
          )}
        >
          <p className="flex items-start gap-2 font-display text-[0.9375rem] leading-snug font-semibold text-foreground">
            <span aria-hidden className={cn("mt-[0.45rem] size-2 shrink-0 rounded-full", patternDot(pattern))} />
            <span className="line-clamp-2 before:content-['“'] after:content-['”']">{fragment}</span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              ref={backButton}
              type="button"
              aria-label={t("home.pendingFlipBackLabel", { title })}
              onClick={() => setFlipped(false)}
              title={t("home.pendingFlipBack")}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
            {href && (
              <Link
                href={href}
                aria-label={linkLabel}
                className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-full bg-[image:var(--grad-hero)] px-3.5 text-sm font-semibold text-white shadow-bloom transition-transform active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Feather className="size-4" aria-hidden />
                {t("home.pendingRewriteShort")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** El paisaje completo de cada clima, en el estilo de las tarjetas de referencia (viewBox 320×160). */
function SceneArt({ scene }: { scene: Scene }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 320 160"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-0 -z-20 size-full"
    >
      {SCENES[scene](id)}
    </svg>
  );
}

type Stop = [offset: number, color: string];

function Linear({ id, stops, x2 = 1, y2 = 1 }: { id: string; stops: Stop[]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([offset, color]) => (
        <stop key={offset} offset={offset} stopColor={color} />
      ))}
    </linearGradient>
  );
}

function Sky({ id, stops, x2, y2 }: { id: string; stops: Stop[]; x2?: number; y2?: number }) {
  return (
    <>
      <defs>
        <Linear id={`${id}-sky`} stops={stops} x2={x2} y2={y2} />
      </defs>
      <rect width="320" height="160" fill={`url(#${id}-sky)`} />
    </>
  );
}

function Dots({
  points,
  fill = "#fff",
  opacity = 0.85,
}: {
  points: [number, number, number][];
  fill?: string;
  opacity?: number;
}) {
  return (
    <g fill={fill} opacity={opacity}>
      {points.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
}

/** Destello de 4 puntas (las estrellas grandes de la noche). */
function Sparkle({ x, y, size = 3 }: { x: number; y: number; size?: number }) {
  return (
    <path
      d={`M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size} Z`}
      fill="#fff"
    />
  );
}

function Tree({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <path
      d={`M${x} ${y - 9} L${x + 2.6} ${y - 1} H${x + 0.6} V${y + 1} H${x - 0.6} V${y - 1} H${x - 2.6} Z`}
      fill={color}
    />
  );
}

function Windmill({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g fill={color} stroke={color}>
      <path d={`M${x - 3.4} ${y} L${x - 2} ${y - 11} L${x + 2} ${y - 11} L${x + 3.4} ${y} Z`} stroke="none" />
      <path d={`M${x - 3} ${y - 11} L${x} ${y - 14} L${x + 3} ${y - 11} Z`} stroke="none" />
      <g strokeWidth={1.3} strokeLinecap="round">
        <path d={`M${x - 6} ${y - 18} L${x + 6} ${y - 8}`} />
        <path d={`M${x + 6} ${y - 18} L${x - 6} ${y - 8}`} />
      </g>
      <circle cx={x} cy={y - 13} r={1.1} fill="#fff" stroke="none" opacity={0.8} />
    </g>
  );
}

/** Lluvia en diagonal, como en las tarjetas de lluvia y tormenta. */
function Rain({ opacity }: { opacity: number }) {
  const drops: [number, number][] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 14; col++) {
      drops.push([col * 25 + ((row * 11) % 25) + 4, row * 24 + ((col * 7) % 12) - 6]);
    }
  }
  return (
    <g stroke="#fff" strokeWidth={0.9} strokeLinecap="round" opacity={opacity}>
      {drops.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} l-4 11`} />
      ))}
    </g>
  );
}

/** Copo de nieve de 6 brazos con sus ramitas. */
function Flake({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g stroke="#fff" strokeWidth={r / 6} strokeLinecap="round" fill="none" opacity={0.9}>
      {[0, 60, 120].map((angle) => (
        <path key={angle} d={`M${x} ${y - r} V${y + r}`} transform={`rotate(${angle} ${x} ${y})`} />
      ))}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <path
          key={`b${angle}`}
          d={`M${x - r * 0.3} ${y - r * 0.85} L${x} ${y - r * 0.6} L${x + r * 0.3} ${y - r * 0.85}`}
          transform={`rotate(${angle} ${x} ${y})`}
        />
      ))}
    </g>
  );
}

function Cloud({ circles, fill, opacity = 1 }: { circles: [number, number, number][]; fill: string; opacity?: number }) {
  const bottom = Math.max(...circles.map(([, y, r]) => y + r * 0.55));
  const left = Math.min(...circles.map(([x, , r]) => x - r));
  const right = Math.max(...circles.map(([x, , r]) => x + r));
  return (
    <g fill={fill} opacity={opacity}>
      {circles.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
      <rect x={left + 4} y={bottom - 8} width={right - left - 8} height={8} rx={4} />
    </g>
  );
}

/** Los dos cerros de la noche y del soleado: uno grande adelante y otro atrás a la derecha, con el molino. */
function Hills({
  id,
  back,
  front,
  trees,
  details,
}: {
  id: string;
  back: string;
  front: Stop[];
  trees: string;
  details: string;
}) {
  return (
    <>
      <defs>
        <Linear id={`${id}-land`} stops={front} x2={0} y2={1} />
      </defs>
      <path d="M150 104 C190 86 245 80 320 82 L320 160 L150 160 Z" fill={back} />
      <Windmill x={242} y={84} color={details} />
      <Tree x={266} y={83} color={details} />
      <Tree x={293} y={82} color={details} />
      <path d="M0 108 C70 95 170 95 230 106 C270 113 300 120 320 126 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
      {[
        [47, 101],
        [96, 98],
        [146, 98],
        [195, 102],
      ].map(([x, y]) => (
        <Tree key={x} x={x} y={y} color={trees} />
      ))}
    </>
  );
}

const SCENES: Record<Scene, (id: string) => React.ReactNode> = {
  // Warm: cielo azul noche, estrellas, luna menguante y los cerros con el molino.
  night: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#152560"],
          [0.55, "#22508A"],
          [1, "#2A6494"],
        ]}
      />
      <Dots
        points={[
          [26, 10, 0.9],
          [142, 24, 0.9],
          [195, 11, 0.8],
          [242, 19, 0.8],
          [283, 9, 0.8],
          [308, 23, 0.9],
          [283, 56, 0.8],
          [227, 44, 0.7],
        ]}
      />
      <Sparkle x={12} y={72} />
      <Sparkle x={178} y={67} />
      <defs>
        <mask id={`${id}-moon`}>
          <rect width="320" height="160" fill="#fff" />
          <circle cx="283" cy="25" r="11" fill="#000" />
        </mask>
      </defs>
      <circle cx="276" cy="31" r="18" fill="#fff" opacity={0.06} />
      <circle cx="276" cy="31" r="12" fill="#ECEEF6" mask={`url(#${id}-moon)`} />
      <Hills
        id={id}
        back="#1D4874"
        front={[
          [0, "#22558B"],
          [1, "#183F70"],
        ]}
        trees="#1A3F6C"
        details="#173A63"
      />
    </>
  ),
  // Sunny: naranja a amarillo, sol con rayos y los cerros dorados con el molino.
  sunny: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#FB963B"],
          [1, "#FBC044"],
        ]}
        y2={0.4}
      />
      <g stroke="#FFF8E4" strokeWidth={1.5} strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M277 17 V13" transform={`rotate(${i * 30} 277 28)`} />
        ))}
      </g>
      <circle cx="277" cy="28" r="8" fill="#FFF8E4" />
      <Hills
        id={id}
        back="#E8892F"
        front={[
          [0, "#FDC337"],
          [1, "#FCA02E"],
        ]}
        trees="#F0962C"
        details="#DB7C24"
      />
    </>
  ),
  // Raining: verde azulado, dos montañas y lluvia en diagonal.
  rain: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#3B958F"],
          [1, "#47C191"],
        ]}
      />
      <path
        d="M146 112 L192 55 Q196 50 200 55 L246 112 Z M206 112 L257 39 Q261 34 265 39 L318 112 Z"
        fill="#389F8B"
        opacity={0.85}
      />
      <defs>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#41AF8E"],
            [1, "#47C490"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <path d="M0 82 C60 78 120 100 190 110 C240 116 290 106 320 96 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
      <Rain opacity={0.3} />
    </>
  ),
  // Thunder: violeta, rayo con su brillo, dos montañas y lluvia.
  thunder: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#5B5FCB"],
          [1, "#8F72E4"],
        ]}
      />
      <path
        d="M146 112 L189 59 Q193 54 197 59 L246 112 Z M206 112 L255 40 Q259 35 263 40 L318 112 Z"
        fill="#6F60D5"
        opacity={0.85}
      />
      <defs>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#7565D7"],
            [1, "#9478E6"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <path d="M0 84 C60 80 130 100 190 108 C240 114 290 104 320 92 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
      <Rain opacity={0.24} />
      <g fill="none" stroke="#fff" strokeLinejoin="round" strokeLinecap="round">
        <path d="M231 0 L236 22 L223 46 L241 41 L226 84 M236 22 L249 38 L255 52" strokeWidth={5} opacity={0.2} />
        <path d="M231 0 L236 22 L223 46 L241 41 L226 84 M236 22 L249 38 L255 52" strokeWidth={1.4} />
      </g>
    </>
  ),
  // Snow: celeste, copos, puntitos de nieve y los cerros blancos.
  snow: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#47B0F2"],
          [1, "#8ED0F8"],
        ]}
        x2={0.4}
      />
      <Dots
        points={[
          [25, 10, 1.3],
          [123, 15, 1.3],
          [181, 11, 1.2],
          [220, 7, 1.2],
          [281, 10, 1.3],
          [308, 24, 1.2],
          [162, 32, 1.4],
          [199, 29, 1.2],
          [225, 44, 1.2],
          [289, 50, 1.4],
          [12, 73, 1.5],
          [81, 71, 1.2],
          [153, 71, 1.3],
          [169, 77, 1.3],
          [240, 72, 1.2],
          [113, 91, 1.4],
        ]}
      />
      <Flake x={238} y={24} r={5} />
      <Flake x={267} y={33} r={9} />
      <Flake x={303} y={65} r={4.5} />
      <path d="M110 112 C170 90 250 80 320 88 L320 160 L110 160 Z" fill="#BFE4FB" />
      <defs>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#F7FCFF"],
            [0.55, "#DDF0FD"],
            [1, "#A6D8FA"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <path d="M0 86 C50 80 120 84 180 100 C230 112 280 116 320 114 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
    </>
  ),
  // Sunset: naranja, el sol ocultándose detrás del cerro rojizo.
  sunset: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#FF9C46"],
          [0.6, "#FE8B4A"],
          [1, "#FF7650"],
        ]}
        x2={0.3}
      />
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#FFD58E" stopOpacity={0.85} />
          <stop offset="1" stopColor="#FFD58E" stopOpacity={0} />
        </radialGradient>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#FF9E50"],
            [1, "#FF7550"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <circle cx="187" cy="80" r="34" fill={`url(#${id}-glow)`} />
      <circle cx="187" cy="82" r="16" fill="#F98A3A" />
      <path d="M100 112 C160 92 250 82 320 96 L320 160 L100 160 Z" fill="#E35A36" />
      <path d="M0 84 C50 80 110 92 170 110 C220 124 280 124 320 120 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
    </>
  ),
  // Amanecer: rosa vivo, el sol saliendo, pájaros y cerros con árboles en flor.
  dawn: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#E24F95"],
          [1, "#FFA6C8"],
        ]}
      />
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#FFE9F2" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFE9F2" stopOpacity={0} />
        </radialGradient>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#F7A0C4"],
            [1, "#F27AAE"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <circle cx="250" cy="92" r="30" fill={`url(#${id}-glow)`} />
      <circle cx="250" cy="94" r="14" fill="#FFF1F6" />
      <g fill="none" stroke="#FFF1F6" strokeWidth={1.3} strokeLinecap="round">
        <path d="M206 30 q4 -4 8 0 q4 -4 8 0" />
        <path d="M228 44 q3 -3 6 0 q3 -3 6 0" />
        <path d="M260 24 q3 -3 6 0 q3 -3 6 0" />
      </g>
      <path d="M150 106 C200 88 260 84 320 90 L320 160 L150 160 Z" fill="#E86AA3" />
      <path d="M0 106 C70 94 170 96 230 108 C270 115 300 120 320 124 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
      {[
        [52, 100],
        [104, 97],
        [272, 88],
      ].map(([x, y]) => (
        <g key={x}>
          <rect x={x - 0.7} y={y - 4} width={1.4} height={5} fill="#C9558B" />
          <circle cx={x} cy={y - 7} r={4.2} fill="#FFE1EE" />
        </g>
      ))}
    </>
  ),
  // Laguna: turquesa, sol, una nube, la isla y las olas.
  lagoon: (id) => (
    <>
      <Sky
        id={id}
        stops={[
          [0, "#0C97C0"],
          [1, "#52D8E3"],
        ]}
      />
      <circle cx="277" cy="30" r="9" fill="#FFF6D8" />
      <circle cx="277" cy="30" r="15" fill="#FFF6D8" opacity={0.2} />
      <Cloud
        circles={[
          [262, 54, 6],
          [273, 50, 8],
          [285, 54, 6],
        ]}
        fill="#E8FBFF"
        opacity={0.9}
      />
      <path d="M170 104 C200 80 240 74 270 88 C290 96 305 100 320 102 L320 112 L170 112 Z" fill="#0A86A3" />
      <defs>
        <Linear
          id={`${id}-land`}
          stops={[
            [0, "#25BCD0"],
            [1, "#0E9DBA"],
          ]}
          x2={0}
          y2={1}
        />
      </defs>
      <path d="M0 102 C80 98 200 104 320 106 L320 160 L0 160 Z" fill={`url(#${id}-land)`} />
      <g fill="none" stroke="#E0FBFF" strokeWidth={1.3} strokeLinecap="round" opacity={0.7}>
        <path d="M20 122 q8 -4 16 0 t16 0" />
        <path d="M110 132 q8 -4 16 0 t16 0" />
        <path d="M210 124 q8 -4 16 0 t16 0" />
        <path d="M60 146 q8 -4 16 0 t16 0" />
        <path d="M250 146 q8 -4 16 0 t16 0" />
      </g>
    </>
  ),
};

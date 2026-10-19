"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Eye, RotateCcw } from "lucide-react";
import { patternDot, SCENE_CARD, sceneOf, type Scene } from "@/lib/pattern-style";
import { cn } from "@/lib/utils";

/** Radio de la tarjeta: el de su contenedor (28px) menos su relleno (20px), para que quede proporcional. */
const RADIUS = "rounded-[0.625rem]";

/**
 * Una frase dura como tarjeta de clima (RN-ES-13). De frente, solo el paisaje de su tipo de frase y su título en
 * blanco; con "Ver" se da vuelta y muestra la frase que escribió y su tipo en lenguaje amable. Con `href` (escritorio)
 * lleva además la flechita, que es lo único que abre el registro de esa frase.
 */
export function PhraseSceneCard({
  fragment,
  title,
  label,
  pattern,
  href,
  linkLabel,
  className,
}: {
  fragment: string;
  /** El nombre corto del tipo de frase (`analysis.patternTitles`). */
  title: string;
  /** El tipo en lenguaje amable, el mismo del Espejo (`analysis.patterns`). */
  label: string;
  pattern: string;
  href?: string;
  /** Nombre accesible de la flechita ("Ver el registro de “…”"). */
  linkLabel?: string;
  className?: string;
}) {
  const t = useTranslations();
  const scene = sceneOf(pattern);
  const [flipped, setFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);

  // Al dar vuelta la tarjeta, el foco pasa al botón de la cara que queda a la vista.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (flipped ? backButton : frontButton).current?.focus();
  }, [flipped]);

  const arrow = href && (
    <Link
      href={href}
      aria-label={linkLabel}
      className="absolute right-4 bottom-4 z-10 flex size-9 items-center justify-center rounded-full bg-white text-[#1D1D1F] shadow-card ring-1 ring-black/10 transition-transform hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );

  return (
    // La flechita va fuera de las dos caras (una sola, en la misma esquina), para no repetir el enlace.
    <div className={cn("relative [perspective:1200px]", className)}>
      <div
        className={cn(
          "grid h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Frente: el paisaje completo y el título. */}
        <div
          inert={flipped}
          className={cn(
            "relative isolate flex min-h-36 flex-col justify-between overflow-hidden p-4 shadow-card [grid-area:1/1] [backface-visibility:hidden]",
            RADIUS,
            SCENE_CARD[scene],
          )}
        >
          <SceneArt scene={scene} />
          {/* Un velo oscuro arriba para que el título blanco se lea en los paisajes claros (≥ 3:1, texto grande). */}
          <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-2/3 bg-linear-to-b from-black/40 via-black/25 to-transparent" />
          <h3 className="pr-16 font-heading text-xl leading-tight font-bold text-white">{title}</h3>
          <div className="mt-6 flex items-center justify-between gap-2">
            <button
              ref={frontButton}
              type="button"
              aria-label={t("home.pendingFlip", { title })}
              onClick={() => setFlipped(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-[#1D1D1F] shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Eye className="size-4" aria-hidden />
              {t("home.pendingFlipShort")}
            </button>
          </div>
        </div>

        {/* Atrás: la frase que escribió y su tipo. */}
        <div
          inert={!flipped}
          className={cn(
            "flex min-h-36 flex-col justify-between gap-3 bg-card p-4 shadow-card [grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]",
            RADIUS,
          )}
        >
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-base leading-snug font-semibold text-foreground before:content-['“'] after:content-['”']">
              {fragment}
            </p>
            <p className="flex items-start gap-2 text-sm leading-snug text-muted-foreground">
              <span aria-hidden className={cn("mt-[0.4rem] size-2 shrink-0 rounded-full", patternDot(pattern))} />
              {label}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              ref={backButton}
              type="button"
              aria-label={t("home.pendingFlipBackLabel", { title })}
              onClick={() => setFlipped(false)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-4 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <RotateCcw className="size-4" aria-hidden />
              {t("home.pendingFlipBack")}
            </button>
          </div>
        </div>
      </div>
      {arrow}
    </div>
  );
}

/**
 * El paisaje de cada clima, de borde a borde (cielo, montañas y colinas en capas), y su detalle principal (luna, sol,
 * rayo, nube…) en la esquina de arriba a la derecha, por encima del velo y sin pasar por debajo del título.
 */
function SceneArt({ scene }: { scene: Scene }) {
  return (
    <>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 320 180"
        preserveAspectRatio="xMaxYMax slice"
        className="pointer-events-none absolute inset-0 -z-20 size-full"
      >
        <SceneAtmosphere scene={scene} />
        <SceneLand scene={scene} />
      </svg>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 80 80"
        className="pointer-events-none absolute top-2 right-2 -z-[5] size-16"
      >
        <SceneCorner scene={scene} />
      </svg>
    </>
  );
}

function Stars({ points }: { points: [number, number, number][] }) {
  return (
    <g fill="#fff">
      {points.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity={0.8} />
      ))}
    </g>
  );
}

function Cloud({ x, y, scale = 1, opacity = 0.9 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0 16 a10 10 0 0 1 18 -6 a12 12 0 0 1 22 6 a8 8 0 0 1 0 16 h-38 a8 8 0 0 1 -2 -16 Z"
      fill="#fff"
      opacity={opacity}
    />
  );
}

function Rain({ opacity = 0.3 }: { opacity?: number }) {
  const drops: [number, number][] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 12; col++) {
      drops.push([col * 28 + (row % 2) * 14 + 6, row * 30 + 8]);
    }
  }
  return (
    <g stroke="#fff" strokeWidth={1.4} strokeLinecap="round" opacity={opacity}>
      {drops.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y} l-4 12`} />
      ))}
    </g>
  );
}

/** Lo que llena el cielo de borde a borde (estrellas, lluvia, nieve, bruma), suave para no tapar el título. */
function SceneAtmosphere({ scene }: { scene: Scene }) {
  switch (scene) {
    case "night":
      return <Stars points={[[40, 96, 1.2], [96, 84, 1], [150, 100, 1.3], [200, 76, 1], [120, 112, 0.9]]} />;
    case "rain":
      return <Rain />;
    case "thunder":
      return <Rain opacity={0.22} />;
    case "snow":
      return <Stars points={[[30, 96, 2], [80, 112, 1.6], [130, 90, 1.8], [178, 108, 1.5], [230, 100, 1.7], [60, 124, 1.4]]} />;
    case "sunset":
      return <circle cx="200" cy="132" r="28" fill="#FFE8D8" opacity={0.8} />;
    case "haze":
      return (
        <g fill="#fff">
          <rect x="0" y="96" width="320" height="6" opacity={0.18} />
          <rect x="0" y="110" width="320" height="6" opacity={0.14} />
        </g>
      );
    case "aurora":
      return <Stars points={[[50, 100, 1], [130, 90, 1], [190, 108, 1.1]]} />;
    default:
      return null;
  }
}

/** El detalle principal de cada clima, en su esquina (viewBox 80×80). */
function SceneCorner({ scene }: { scene: Scene }) {
  switch (scene) {
    case "night":
      return (
        <g>
          <path d="M44 14 a22 22 0 1 0 20 34 a17 17 0 1 1 -20 -34 Z" fill="#FFF7D6" opacity={0.95} />
          <Stars points={[[14, 20, 1.3], [24, 58, 1.1], [70, 70, 1]]} />
        </g>
      );
    case "sunny":
      return (
        <g>
          <circle cx="48" cy="32" r="26" fill="#fff" opacity={0.25} />
          <circle cx="48" cy="32" r="15" fill="#FFF6D6" />
        </g>
      );
    case "rain":
      return <Cloud x={14} y={14} scale={1.2} opacity={0.85} />;
    case "thunder":
      return <path d="M50 4 L32 40 L46 40 L34 76 L66 30 L50 30 L62 4 Z" fill="#fff" opacity={0.9} />;
    case "snow":
      return (
        <g>
          <Cloud x={12} y={14} scale={1.25} />
          <Stars points={[[20, 64, 2], [44, 72, 1.8], [64, 62, 1.6]]} />
        </g>
      );
    case "sunset":
      return <Cloud x={14} y={20} scale={1.1} opacity={0.75} />;
    case "haze":
      return <circle cx="44" cy="34" r="17" fill="#fff" opacity={0.55} />;
    case "cloudy":
      return (
        <g>
          <circle cx="54" cy="24" r="13" fill="#fff" opacity={0.35} />
          <Cloud x={8} y={36} scale={1} opacity={0.4} />
        </g>
      );
    case "aurora":
      return (
        <g fill="none" stroke="#fff" strokeLinecap="round" opacity={0.65}>
          <path d="M4 34 C20 16 36 46 52 26 S72 20 80 18" strokeWidth={4} />
          <path d="M6 52 C22 36 38 62 54 44 S74 38 80 36" strokeWidth={2.5} opacity={0.7} />
        </g>
      );
  }
}

function SceneLand({ scene }: { scene: Scene }) {
  // Montañas al fondo solo en los climas de montaña; colinas en dos capas en todos.
  const mountains = scene === "rain" || scene === "thunder" || scene === "haze" || scene === "cloudy";
  const snowy = scene === "snow";
  return (
    <g>
      {mountains && (
        <g fill="#fff" opacity={0.18}>
          <path d="M150 140 L205 78 L260 140 Z" />
          <path d="M215 140 L262 92 L310 140 Z" opacity={0.8} />
        </g>
      )}
      {scene === "night" && (
        <g fill="#0E2A47" opacity={0.55}>
          <rect x="226" y="104" width="10" height="22" />
          <path d="M231 96 l9 10 h-18 Z" />
          {[40, 70, 110, 160, 290].map((x) => (
            <rect key={x} x={x} y="118" width="2" height="10" />
          ))}
        </g>
      )}
      <path
        d="M0 134 C60 112 120 120 180 128 C240 136 280 116 320 110 L320 180 L0 180 Z"
        fill="#fff"
        opacity={snowy ? 0.7 : 0.16}
      />
      <path
        d="M0 154 C70 138 150 146 210 152 C260 156 290 144 320 140 L320 180 L0 180 Z"
        fill="#fff"
        opacity={snowy ? 0.85 : 0.14}
      />
    </g>
  );
}

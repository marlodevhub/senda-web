import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SCENE_CARD, sceneOf, type Scene } from "@/lib/pattern-style";
import { cn } from "@/lib/utils";

/**
 * Una frase dura como tarjeta de clima (RN-ES-13): el degradado y el paisaje de su tipo de frase, la frase grande y,
 * debajo, su tipo en lenguaje amable. Con `href` lleva a reescribir su registro (CU-04). El paisaje es decorativo y
 * queda abajo y a la derecha, sin pasar por debajo del texto.
 */
export function PhraseSceneCard({
  fragment,
  label,
  pattern,
  href,
  linkLabel,
  className,
}: {
  fragment: string;
  label: string;
  pattern: string;
  href?: string;
  /** Nombre accesible del enlace ("Reescribir: “…”"). */
  linkLabel?: string;
  className?: string;
}) {
  const scene = sceneOf(pattern);
  const body = (
    <>
      <SceneArt scene={scene} />
      <span className="relative flex flex-col gap-1.5 pr-14 pb-10">
        <span className="font-display text-lg leading-snug font-bold before:content-['“'] after:content-['”']">
          {fragment}
        </span>
        <span className="text-sm leading-snug font-medium">{label}</span>
      </span>
      {href && (
        <span
          aria-hidden
          className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#1D1D1F] shadow-card transition-transform group-hover:translate-x-0.5"
        >
          <ArrowRight className="size-4" />
        </span>
      )}
    </>
  );
  const base = cn("relative isolate flex min-h-36 overflow-hidden rounded-2xl p-4 shadow-card", SCENE_CARD[scene], className);

  return href ? (
    <Link
      href={href}
      aria-label={linkLabel}
      className={cn(
        base,
        "group transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-bloom focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

/**
 * El paisaje en dos piezas de tamaño fijo, para que nunca pase por debajo del texto: el detalle de cada clima (luna,
 * sol, lluvia, rayo, nieve, nubes…) en la esquina de arriba a la derecha y las colinas en una franja abajo.
 */
function SceneArt({ scene }: { scene: Scene }) {
  return (
    <>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 64 64"
        className="pointer-events-none absolute top-2 right-2 -z-10 size-14"
      >
        <SceneDetail scene={scene} />
      </svg>
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 320 48"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-12 w-full"
      >
        {scene === "sunset" && <circle cx="250" cy="34" r="20" fill="#FFE8D8" opacity={0.75} />}
        <path d="M0 26 C60 8 120 14 180 22 C240 30 280 12 320 8 L320 48 L0 48 Z" fill="#fff" opacity={0.16} />
        <path d="M0 38 C70 26 150 32 210 38 C260 42 290 34 320 30 L320 48 L0 48 Z" fill="#fff" opacity={0.14} />
      </svg>
    </>
  );
}

function SceneDetail({ scene }: { scene: Scene }) {
  switch (scene) {
    case "night":
      return (
        <g fill="#fff">
          <path d="M40 14 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22 Z" opacity={0.9} />
          <circle cx="12" cy="12" r="1.4" opacity={0.8} />
          <circle cx="20" cy="44" r="1.2" opacity={0.7} />
          <circle cx="56" cy="54" r="1" opacity={0.6} />
        </g>
      );
    case "sunny":
      return (
        <g>
          <circle cx="36" cy="28" r="20" fill="#fff" opacity={0.25} />
          <circle cx="36" cy="28" r="12" fill="#FFF6D6" opacity={0.95} />
        </g>
      );
    case "rain":
      return (
        <g stroke="#fff" strokeWidth={1.8} strokeLinecap="round" opacity={0.55}>
          {[18, 32, 46, 60, 25, 39, 53].map((x, i) => (
            <path key={x} d={`M${x} ${i < 4 ? 8 : 34} l-5 13`} />
          ))}
        </g>
      );
    case "thunder":
      return <path d="M40 4 L26 32 L38 32 L28 60 L52 24 L40 24 L50 4 Z" fill="#fff" opacity={0.85} />;
    case "snow":
      return (
        <g fill="#fff">
          <path d="M14 26 a10 10 0 0 1 18 -6 a12 12 0 0 1 22 6 a8 8 0 0 1 0 16 h-38 a8 8 0 0 1 -2 -16 Z" opacity={0.9} />
          <circle cx="16" cy="52" r="1.8" opacity={0.8} />
          <circle cx="36" cy="58" r="1.6" opacity={0.8} />
          <circle cx="54" cy="52" r="1.4" opacity={0.7} />
        </g>
      );
    case "sunset":
      return (
        <g fill="#fff" opacity={0.6}>
          <path d="M20 22 a7 7 0 0 1 12 -4 a9 9 0 0 1 16 4 a6 6 0 0 1 0 12 h-26 a6 6 0 0 1 -2 -12 Z" />
        </g>
      );
    case "haze":
      return (
        <g fill="#fff">
          <circle cx="36" cy="24" r="13" opacity={0.6} />
          <rect x="8" y="44" width="52" height="4" rx="2" opacity={0.4} />
          <rect x="18" y="54" width="42" height="4" rx="2" opacity={0.3} />
        </g>
      );
    case "cloudy":
      return (
        <g fill="#fff">
          <circle cx="44" cy="16" r="10" opacity={0.35} />
          <path d="M10 40 a9 9 0 0 1 16 -5 a11 11 0 0 1 20 5 a7 7 0 0 1 0 14 h-34 a7 7 0 0 1 -2 -14 Z" opacity={0.35} />
        </g>
      );
    case "aurora":
      return (
        <g fill="none" stroke="#fff" strokeLinecap="round" opacity={0.6}>
          <path d="M4 26 C18 12 32 36 46 20 S60 16 64 14" strokeWidth={3} />
          <path d="M4 40 C18 28 32 50 46 36 S60 32 64 30" strokeWidth={2} opacity={0.7} />
        </g>
      );
  }
}

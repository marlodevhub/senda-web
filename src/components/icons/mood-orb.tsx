import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type Mood = 1 | 2 | 3 | 4 | 5;

/**
 * Color de cada ánimo, de rosa (muy mal) a turquesa (muy bien), en la paleta
 * de Senda. Sin rojo: nada suena a alarma ni a error (regla de coherencia 8).
 */
const ORB_COLORS: Record<Mood, { light: string; base: string }> = {
  1: { light: "#fbc3cf", base: "#ec8aa0" },
  2: { light: "#fdd3bd", base: "#f3a27e" },
  3: { light: "#fde9a8", base: "#f2c95c" },
  4: { light: "#d4efb4", base: "#9fd27a" },
  5: { light: "#b7efe0", base: "#5ec9ae" },
};

const INK = "#3b2a3a";

/** El degradado de cada ánimo, para lo que lo acompaña (la burbuja con su nombre al elegirlo). */
export function moodGradient(mood: Mood): string {
  const { light, base } = ORB_COLORS[mood];
  return `linear-gradient(135deg, ${light}, ${base})`;
}

/** Tinta de las caras: oscura sobre cualquiera de los colores (contraste ≥ 4,5:1). */
export const MOOD_INK = INK;

/**
 * Un botón sólido en el color del ánimo elegido (Escribir en Inicio, Guardar en el Diario), con la tinta de las
 * caras: contraste ≥ 4,5:1 sobre los cinco colores. Va como `style` porque los colores salen de aquí, no del tema.
 */
export function moodSolidStyle(mood: Mood): CSSProperties {
  const { base } = ORB_COLORS[mood];
  return {
    backgroundColor: base,
    backgroundImage: "none",
    color: INK,
    boxShadow: `0 12px 24px -12px ${base}`,
  };
}

function Mouth({ mood }: { mood: Mood }) {
  const d = {
    1: "M17 33 Q24 26 31 33",
    2: "M18 31.5 Q24 28 30 31.5",
    3: "M18.5 30.5 L29.5 30.5",
    4: "M18 28.5 Q24 33.5 30 28.5",
    5: "M16 27 Q24 36 32 27",
  }[mood];
  return <path d={d} stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
}

/** Ojos: puntos que parpadean; con "muy bien", arcos de ojos sonrientes. */
function Eyes({ mood }: { mood: Mood }) {
  if (mood === 5) {
    return (
      <g stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none">
        <path d="M15.5 21 q3 -3.5 6 0" />
        <path d="M26.5 21 q3 -3.5 6 0" />
      </g>
    );
  }
  const y = mood <= 2 ? 21.5 : 20.5;
  return (
    <g className="mood-blink" fill={INK}>
      <circle cx="18.5" cy={y} r="2.3" />
      <circle cx="29.5" cy={y} r="2.3" />
      {mood === 1 && (
        <g stroke={INK} strokeWidth={2} strokeLinecap="round">
          {/* Cejas caídas hacia afuera: tristeza, no enojo. */}
          <path d="M14.5 17.5 l5 -2" />
          <path d="M33.5 17.5 l-5 -2" />
        </g>
      )}
    </g>
  );
}

/**
 * Carita de ánimo (RN-DI-03, RN-IN-05): un círculo de color con cara; el
 * estudiante nunca ve el número 1–5, solo la expresión y su nombre.
 * `animated` le da un movimiento propio a cada ánimo (solo si no se pide menos
 * movimiento; ver `.mood-anim-*` en globals.css). Sin `label`, es decorativa.
 */
export function MoodOrb({
  mood,
  animated = false,
  decorative = false,
  className,
}: {
  mood: Mood;
  animated?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  const { light, base } = ORB_COLORS[mood];
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : t(`mood.${mood}`)}
      aria-hidden={decorative || undefined}
      className={cn(
        "inline-flex shrink-0 rounded-full shadow-[inset_0_-3px_6px_rgb(0_0_0/0.08),inset_0_3px_6px_rgb(255_255_255/0.5)]",
        animated && `mood-anim-${mood}`,
        className,
      )}
      style={{ background: `radial-gradient(circle at 32% 28%, ${light}, ${base} 72%)` }}
    >
      <svg viewBox="0 0 48 48" className="size-full" aria-hidden focusable="false">
        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </svg>
    </span>
  );
}

import { useId } from "react";
import { MOOD_INK, moodBlend, type Mood } from "@/components/icons/mood-orb";
import { cn } from "@/lib/utils";

const INK = MOOD_INK;
/** Sin ánimo de hoy, la mascota va en gris claro. */
const RESTING = { light: "#f1f1f4", base: "#c9c9d1" };

/** La carita más cercana a un promedio (3,4 → 3; 3,5 → 4). */
export function nearestMood(average: number): Mood {
  return Math.min(5, Math.max(1, Math.round(average))) as Mood;
}

/** Ojos con un brillo blanco; con "muy bien", arcos sonrientes; sin ánimo, cerrados y tranquilos. */
function Eyes({ mood }: { mood: Mood | null }) {
  if (mood === null) {
    return (
      <g stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none">
        <path d="M42 70 q6 5 12 0" />
        <path d="M66 70 q6 5 12 0" />
      </g>
    );
  }
  if (mood === 5) {
    return (
      <g stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none">
        <path d="M42 71 q6 -8 12 0" />
        <path d="M66 71 q6 -8 12 0" />
      </g>
    );
  }
  const y = mood <= 2 ? 71 : 69;
  return (
    <g>
      <g className="mood-blink" fill={INK}>
        <ellipse cx="48" cy={y} rx="4.6" ry="5.4" />
        <ellipse cx="72" cy={y} rx="4.6" ry="5.4" />
      </g>
      <g fill="#ffffff">
        <circle cx="49.6" cy={y - 2} r="1.7" />
        <circle cx="73.6" cy={y - 2} r="1.7" />
      </g>
      {mood <= 2 && (
        <g stroke={INK} strokeWidth={2.6} strokeLinecap="round">
          {/* Cejas caídas hacia afuera: tristeza, no enojo. */}
          <path d={mood === 1 ? "M40 61 l8 -3.5" : "M41 61 l7 -1.5"} />
          <path d={mood === 1 ? "M80 61 l-8 -3.5" : "M79 61 l-7 -1.5"} />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood | null }) {
  if (mood === null) {
    return <path d="M55 83 Q60 86 65 83" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />;
  }
  if (mood === 5) {
    // Sonrisa abierta con lengua.
    return (
      <g>
        <path d="M49 79 Q60 80 71 79 Q69 93 60 93 Q51 93 49 79 Z" fill={INK} />
        <path d="M53.5 88 Q60 84 66.5 88 Q63 92.5 60 92.5 Q57 92.5 53.5 88 Z" fill="#f4889b" />
      </g>
    );
  }
  const d = {
    1: "M51 88 Q60 80 69 88",
    2: "M52 86 Q60 82 68 86",
    3: "M53 84 Q60 85.5 67 84",
    4: "M50 81 Q60 90 70 81",
  }[mood];
  return <path d={d} stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />;
}

/** Brazos: abiertos y arriba cuando está muy bien, a los lados en medio, caídos cuando el día pesa. */
function Arms({ mood, color }: { mood: Mood | null; color: string }) {
  const d =
    mood === 5
      ? ["M22 72 Q12 62 13 52", "M98 72 Q108 62 107 52"]
      : mood === 4
        ? ["M21 78 Q11 72 10 64", "M99 78 Q109 72 110 64"]
        : mood === null || mood === 3
          ? ["M20 82 Q11 84 9 79", "M100 82 Q109 84 111 79"]
          : ["M21 84 Q15 92 16 98", "M99 84 Q105 92 104 98"];
  return (
    <g stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
      <path d={d[0]} />
      <path d={d[1]} />
    </g>
  );
}

/**
 * La mascota de Senda: un brote redondo con dos hojas, brazos y pies. Su cuerpo lleva un degradado del ánimo
 * promedio, mezclando las dos caritas vecinas en proporción (3,5 va entre el amarillo y el verde, `moodBlend`); sin
 * ánimo, gris. Su cara y su postura son las de la carita más cercana (sin rojo ni gestos de enojo) y se mueve como ella
 * (`.mood-anim-*`, solo si no se pide menos movimiento). Decorativa: quien la acompaña dice el ánimo en texto.
 */
export function MoodMascot({ average, className }: { average: number | null; className?: string }) {
  const id = useId().replace(/:/g, "");
  const mood = average === null ? null : nearestMood(average);
  const colors = average === null ? RESTING : moodBlend(average);

  return (
    <span aria-hidden className={cn("inline-flex", mood !== null && `mood-anim-${mood}`, className)}>
      <svg viewBox="0 0 120 120" className="size-full overflow-visible" focusable="false">
        <defs>
          <radialGradient id={`${id}-body`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="28%" stopColor={colors.light} />
            <stop offset="100%" stopColor={colors.base} />
          </radialGradient>
          <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a6e3a1" />
            <stop offset="100%" stopColor="#4fae6a" />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="113" rx="32" ry="4.5" fill={INK} opacity={0.14} />
        {/* Pies. */}
        <ellipse cx="46" cy="107" rx="9" ry="5" fill={colors.base} />
        <ellipse cx="74" cy="107" rx="9" ry="5" fill={colors.base} />
        <Arms mood={mood} color={colors.base} />

        {/* Tallo y hojas. */}
        <path d="M60 31 C60 24 61 19 63 14" stroke="#4fae6a" strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M62 18 C70 5 88 7 90 14 C81 23 70 23 62 18 Z" fill={`url(#${id}-leaf)`} />
        <path d="M61 21 C52 9 36 12 35 19 C44 27 55 26 61 21 Z" fill={`url(#${id}-leaf)`} opacity={0.9} />

        {/* Cuerpo con brillo. */}
        <path
          d="M60 29 C90 29 105 52 105 78 C105 100 87 110 60 110 C33 110 15 100 15 78 C15 52 30 29 60 29 Z"
          fill={`url(#${id}-body)`}
          stroke={INK}
          strokeOpacity={0.1}
          strokeWidth={1.5}
        />
        <ellipse cx="41" cy="46" rx="10" ry="5.5" fill="#ffffff" opacity={0.6} transform="rotate(-28 41 46)" />

        {/* Mejillas. */}
        {mood !== 1 && (
          <g fill="#f48aa4" opacity={0.42}>
            <ellipse cx="37" cy="80" rx="6" ry="3.6" />
            <ellipse cx="83" cy="80" rx="6" ry="3.6" />
          </g>
        )}
        <Eyes mood={mood} />
        <Mouth mood={mood} />

        {/* Destellos cuando el día va bien. */}
        {mood !== null && mood >= 4 && (
          <g fill="#ffffff">
            <path d="M101 30 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
            <path d="M18 38 l1.4 3.6 l3.6 1.4 l-3.6 1.4 l-1.4 3.6 l-1.4 -3.6 l-3.6 -1.4 l3.6 -1.4 Z" opacity={0.85} />
          </g>
        )}
      </svg>
    </span>
  );
}

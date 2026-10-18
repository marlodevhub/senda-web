import { MOOD_INK, moodBlend, type Mood } from "@/components/icons/mood-orb";
import { cn } from "@/lib/utils";

const INK = MOOD_INK;
const SPROUT = "#6fbf73";
/** Sin ánimo de hoy, la mascota va en gris claro. */
const RESTING = "#dcdce2";

/** La carita más cercana a un promedio (3,4 → 3; 3,5 → 4). */
export function nearestMood(average: number): Mood {
  return Math.min(5, Math.max(1, Math.round(average))) as Mood;
}

/** La boca según el ánimo: de una curva hacia abajo (muy mal) a una sonrisa amplia (muy bien). */
const MOUTH: Record<Mood, string> = {
  1: "M50 89 Q60 80 70 89",
  2: "M51 87 Q60 82 69 87",
  3: "M51 86 L69 86",
  4: "M50 83 Q60 91 70 83",
  5: "M48 81 Q60 95 72 81",
};

function Face({ mood }: { mood: Mood | null }) {
  // Sin ánimo de hoy: tranquila, con los ojos cerrados y una sonrisa leve (espera, sin reproche).
  if (mood === null) {
    return (
      <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M44 71 q5 4 10 0" />
        <path d="M66 71 q5 4 10 0" />
        <path d="M54 84 Q60 88 66 84" />
      </g>
    );
  }
  return (
    <g>
      {mood === 5 ? (
        <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M44 72 q5 -6 10 0" />
          <path d="M66 72 q5 -6 10 0" />
        </g>
      ) : (
        <g className="mood-blink" fill={INK}>
          <circle cx="49" cy={mood <= 2 ? 72 : 70} r="3.4" />
          <circle cx="71" cy={mood <= 2 ? 72 : 70} r="3.4" />
        </g>
      )}
      {mood === 1 && (
        <g stroke={INK} strokeWidth={2.4} strokeLinecap="round">
          {/* Cejas caídas hacia afuera: tristeza, no enojo. */}
          <path d="M43 65 l7 -3" />
          <path d="M77 65 l-7 -3" />
        </g>
      )}
      {mood >= 3 && (
        <g fill="#f29bb0" opacity={0.45}>
          <ellipse cx="40" cy="81" rx="5" ry="3" />
          <ellipse cx="80" cy="81" rx="5" ry="3" />
        </g>
      )}
      <path d={MOUTH[mood]} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

/**
 * La mascota de Senda: un brote redondo con dos hojas. Su cuerpo toma el tono claro del ánimo promedio, mezclando las
 * dos caritas vecinas en proporción (3,5 va entre el amarillo y el verde, `moodBlend`); sin ánimo, gris. Su cara es la
 * de la carita más cercana (sin rojo ni gestos de enojo) y se mueve como ella (`.mood-anim-*`, solo si no se pide
 * menos movimiento). Decorativa: quien la acompaña dice el ánimo en texto.
 */
export function MoodMascot({ average, className }: { average: number | null; className?: string }) {
  const mood = average === null ? null : nearestMood(average);
  const body = average === null ? RESTING : moodBlend(average).light;
  return (
    <span aria-hidden className={cn("inline-flex", mood !== null && `mood-anim-${mood}`, className)}>
      <svg viewBox="0 0 120 120" className="size-full" focusable="false">
        <ellipse cx="60" cy="111" rx="30" ry="4" fill={INK} opacity={0.12} />
        {/* Tallo y hojas. */}
        <path d="M60 32 C60 24 61 19 63 14" stroke={SPROUT} strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M62 18 C70 6 86 8 88 14 C80 22 70 22 62 18 Z" fill={SPROUT} />
        <path d="M61 21 C52 10 38 13 37 19 C45 26 55 25 61 21 Z" fill={SPROUT} opacity={0.85} />
        {/* Cuerpo. */}
        <path
          d="M60 30 C89 30 104 52 104 78 C104 99 86 109 60 109 C34 109 16 99 16 78 C16 52 31 30 60 30 Z"
          fill={body}
          stroke={INK}
          strokeOpacity={0.12}
          strokeWidth={2}
        />
        <ellipse cx="44" cy="48" rx="12" ry="7" fill="#ffffff" opacity={0.45} transform="rotate(-25 44 48)" />
        <Face mood={mood} />
      </svg>
    </span>
  );
}

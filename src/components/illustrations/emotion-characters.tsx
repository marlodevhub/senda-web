import { cn } from "@/lib/utils";

/**
 * Personajes de emociones (pantallas de entrada y guías del tutorial): formas suaves con cara,
 * en la paleta de Senda. Respiran, parpadean y se mecen (solo si no se pide
 * menos movimiento; ver `.emo-*` en globals.css). Decorativos.
 *
 * Los filtros de borde suave se definen una vez en `EmotionDefs`, que debe
 * estar montado (y visible: un `display: none` los anula) donde se usen.
 */
export type Emotion = "calm" | "joy" | "sad" | "spark" | "hope" | "nerves";

const INK = "var(--emo-ink)";

export function EmotionDefs() {
  return (
    <svg aria-hidden focusable="false" width="0" height="0" className="absolute">
      <defs>
        <filter id="emo-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="emo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
    </svg>
  );
}

function OpenEyes({ y, look = [0, 0], gap = 13 }: { y: number; look?: [number, number]; gap?: number }) {
  return (
    <g className="emo-blink">
      {[60 - gap, 60 + gap].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={7.5} ry={9.5} fill="#fff" />
          <circle cx={x + look[0]} cy={y + look[1]} r={4} fill={INK} />
        </g>
      ))}
    </g>
  );
}

/** Ojos cerrados: hacia arriba (alegría) o hacia abajo (calma, tristeza). */
function ClosedEyes({ y, up = false, gap = 13 }: { y: number; up?: boolean; gap?: number }) {
  const bend = up ? -7 : 6;
  return (
    <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
      <path d={`M${60 - gap - 7} ${y} q 7 ${bend} 14 0`} />
      <path d={`M${60 + gap - 7} ${y} q 7 ${bend} 14 0`} />
    </g>
  );
}

function Mouth({ y, kind }: { y: number; kind: "smile" | "frown" | "o" | "flat" }) {
  if (kind === "o") {
    return <ellipse cx={60} cy={y} rx={3.5} ry={4.5} fill={INK} />;
  }
  const d = { smile: "q 6 6 12 0", frown: "q 6 -6 12 0", flat: "q 6 1 12 0" }[kind];
  return <path d={`M54 ${y} ${d}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
}

/** Sol con picos de la ilusión, calculado una vez. */
const SPARK_PATH = (() => {
  const points = 18;
  const coords = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 52 : 43;
    const angle = (Math.PI * i) / points;
    return `${(60 + r * Math.cos(angle)).toFixed(1)} ${(60 + r * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${coords.join(" L")} Z`;
})();

const BODIES: Record<Emotion, { color: string; body: React.ReactNode; face: React.ReactNode; motion: string }> = {
  calm: {
    color: "#f6c35f",
    body: <rect x="24" y="24" width="72" height="72" rx="20" transform="rotate(45 60 60)" />,
    face: (
      <>
        <ClosedEyes y={56} />
        <Mouth y={70} kind="smile" />
      </>
    ),
    motion: "emo-breathe",
  },
  joy: {
    color: "#f4a0b2",
    body: (
      <>
        <circle cx="60" cy="38" r="24" />
        <circle cx="36" cy="52" r="22" />
        <circle cx="84" cy="52" r="22" />
        <circle cx="40" cy="78" r="22" />
        <circle cx="80" cy="78" r="22" />
        <circle cx="60" cy="84" r="22" />
        <circle cx="60" cy="60" r="30" />
      </>
    ),
    face: (
      <>
        <ClosedEyes y={58} up />
        <Mouth y={70} kind="smile" />
      </>
    ),
    motion: "emo-bounce",
  },
  sad: {
    color: "#aab0f4",
    body: (
      <path
        d="M24 26 C 46 34, 74 34, 96 26 C 88 50, 88 70, 96 94 C 74 86, 46 86, 24 94 C 32 70, 32 50, 24 26 Z"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinejoin="round"
      />
    ),
    face: (
      <>
        <ClosedEyes y={54} />
        <path className="emo-tear" d="M44 62 q -4 7 0 9 q 4 -2 0 -9 Z" fill="#5f8fe8" />
        <Mouth y={74} kind="frown" />
      </>
    ),
    motion: "emo-breathe",
  },
  spark: {
    color: "#f8a273",
    body: <path d={SPARK_PATH} />,
    face: (
      <>
        <OpenEyes y={54} look={[1.5, -2]} gap={12} />
        <Mouth y={74} kind="smile" />
      </>
    ),
    motion: "emo-spin",
  },
  hope: {
    color: "#c5dc79",
    body: (
      <path d="M32 26 h50 a14 14 0 0 1 14 14 v32 a28 28 0 0 1 -28 28 h-36 a12 12 0 0 1 -12 -12 v-48 a14 14 0 0 1 14 -14 z" />
    ),
    face: (
      <>
        <g stroke={INK} strokeWidth={3.5} strokeLinecap="round">
          <path d="M40 38 l10 -2" />
          <path d="M70 36 l10 2" />
        </g>
        <OpenEyes y={52} look={[0, -3]} />
        <Mouth y={74} kind="flat" />
      </>
    ),
    motion: "emo-bounce",
  },
  nerves: {
    color: "#ccb3ee",
    body: (
      <>
        <rect x="24" y="28" width="72" height="24" rx="12" />
        <rect x="30" y="48" width="66" height="24" rx="12" />
        <rect x="24" y="68" width="72" height="24" rx="12" />
      </>
    ),
    face: (
      <>
        <OpenEyes y={50} look={[-1, 1]} gap={11} />
        <Mouth y={74} kind="o" />
      </>
    ),
    motion: "emo-shiver",
  },
};

/** `delay` desfasa la animación para que los personajes no se muevan al unísono. */
export function EmotionCharacter({
  emotion,
  delay,
  className,
}: {
  emotion: Emotion;
  delay?: string;
  className?: string;
}) {
  const { color, body, face, motion } = BODIES[emotion];
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
      overflow="visible"
      className={cn(motion, className)}
      style={delay ? { animationDelay: delay } : undefined}
    >
      {/* Halo difuso del mismo color, como luz detrás de la forma */}
      <g fill={color} color={color} filter="url(#emo-glow)" opacity="0.55" transform="translate(0 8)">
        {body}
      </g>
      <g fill={color} color={color} filter="url(#emo-soft)">
        {body}
      </g>
      {face}
    </svg>
  );
}

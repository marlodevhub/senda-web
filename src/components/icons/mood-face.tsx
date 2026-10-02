/**
 * Las 5 caras de ánimo de Senda (RN-DI-03, RN-IN-05): el estudiante nunca ve
 * el número 1-5, solo la expresión. Dibujadas a mano, no emoji ni librería de
 * íconos genérica, para que el trazo combine con Baloo 2 / Figtree.
 */
export type Mood = 1 | 2 | 3 | 4 | 5;

const MOOD_LABEL: Record<Mood, string> = {
  1: "Muy mal",
  2: "Mal",
  3: "Regular",
  4: "Bien",
  5: "Muy bien",
};

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 1:
      return <path d="M11,30 Q20,18 29,30" />;
    case 2:
      return <path d="M12,29 Q20,22 28,29" />;
    case 3:
      return <path d="M13,26.5 L27,26.5" />;
    case 4:
      return <path d="M12,24 Q20,32 28,24" />;
    case 5:
      return <path d="M10,23 Q20,34 30,23" />;
  }
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 5) {
    return (
      <>
        <path d="M11,16 Q14,12.5 17,16" />
        <path d="M23,16 Q26,12.5 29,16" />
      </>
    );
  }
  const cy = mood === 4 ? 16 : 17;
  return (
    <>
      <circle cx="14" cy={cy} r="2" fill="currentColor" stroke="none" />
      <circle cx="26" cy={cy} r="2" fill="currentColor" stroke="none" />
    </>
  );
}

export function MoodFace({
  mood,
  active = false,
  className,
}: {
  mood: Mood;
  active?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      role="img"
      aria-label={MOOD_LABEL[mood]}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        opacity={active ? 1 : 0.45}
      />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
    </svg>
  );
}

export { MOOD_LABEL };

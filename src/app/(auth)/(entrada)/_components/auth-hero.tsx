import { getTranslations } from "next-intl/server";
import { Check, Sparkles } from "lucide-react";
import { MoodFace, type Mood } from "@/components/icons/mood-face";
import { EmotionCharacter, EmotionDefs, type Emotion } from "@/components/illustrations/emotion-characters";
import { cn } from "@/lib/utils";

/** Dónde va cada personaje alrededor del círculo y su etiqueta (en % del cuadro). */
const CAST: { emotion: Emotion; labelKey: string; className: string; delay: string }[] = [
  { emotion: "joy", labelKey: "access.emotionJoy", className: "top-[30%] left-[33%] w-[36%]", delay: "0s" },
  { emotion: "calm", labelKey: "access.emotionCalm", className: "top-[6%] left-[14%] w-[22%]", delay: "-1.2s" },
  { emotion: "sad", labelKey: "access.emotionSad", className: "top-[10%] right-[10%] w-[21%]", delay: "-2.1s" },
  { emotion: "spark", labelKey: "access.emotionSpark", className: "bottom-[11%] left-[6%] w-[22%]", delay: "-0.6s" },
  { emotion: "hope", labelKey: "access.emotionHope", className: "right-[6%] bottom-[16%] w-[22%]", delay: "-1.8s" },
  { emotion: "nerves", labelKey: "access.emotionNerves", className: "top-[35%] left-[3%] w-[15%]", delay: "-2.6s" },
];

const LABEL_TONE: Record<Emotion, string> = {
  joy: "bg-bloom-tint text-bloom-ink",
  calm: "bg-root-tint text-root-ink",
  sad: "bg-flow-tint text-flow-ink",
  spark: "bg-root-tint text-root-ink",
  hope: "bg-sprout-tint text-sprout-ink",
  nerves: "bg-flow-tint text-flow-ink",
};

const POINTS = ["access.showcasePoint1", "access.showcasePoint2", "access.showcasePoint3"] as const;

/**
 * Escritorio: los personajes de emociones alrededor de un círculo suave, con
 * tarjetas que flotan (el check-in de ánimo, lo que ofrece la app y una frase
 * del frasco). Todo decorativo: lo importante está en el formulario.
 */
export async function AuthHero({ className }: { className?: string }) {
  const t = await getTranslations();

  return (
    <div aria-hidden className={cn("relative aspect-square w-full max-w-[36rem]", className)}>
      <EmotionDefs />
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--card),var(--bloom-tint)_55%,var(--flow-tint))] opacity-90" />

      {CAST.map(({ emotion, labelKey, className: place, delay }) => (
        <div key={emotion} className={cn("absolute flex flex-col items-center gap-1", place)}>
          <EmotionCharacter emotion={emotion} delay={delay} className="w-full" />
          <span
            className={cn(
              "rounded-full px-3 py-0.5 text-sm font-semibold whitespace-nowrap shadow-card",
              LABEL_TONE[emotion],
            )}
          >
            {t(labelKey)}
          </span>
        </div>
      ))}

      <div className="auth-float absolute top-[-2%] right-[30%] rounded-[1.25rem] bg-card/90 px-4 py-3 shadow-card backdrop-blur-md">
        <p className="text-sm font-semibold text-foreground">{t("access.showcaseMood")}</p>
        <div className="mt-2 flex gap-1.5 text-flow-ink">
          {([1, 2, 3, 4, 5] as Mood[]).map((mood) => (
            <MoodFace key={mood} mood={mood} active={mood === 4} className="size-7" />
          ))}
        </div>
      </div>

      <ul className="auth-float absolute -bottom-[6%] left-[30%] flex flex-col gap-1.5 rounded-[1.25rem] bg-card/90 px-4 py-3 text-sm text-foreground shadow-card backdrop-blur-md [animation-delay:-3s]">
        {POINTS.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <Check className="size-4 text-sprout-ink" />
            {t(key)}
          </li>
        ))}
      </ul>

      <div className="auth-float absolute top-[38%] -right-[8%] w-48 rounded-[1.25rem] bg-card/90 p-4 text-foreground shadow-card backdrop-blur-md [animation-delay:-1.5s]">
        <p className="flex items-center gap-1.5 font-heading text-base font-bold">
          <Sparkles className="size-4 text-bloom-ink" />
          {t("access.showcaseJarTitle")}
        </p>
        <p className="mt-1 text-sm leading-snug">{t("access.showcaseJarPhrase")}</p>
      </div>
    </div>
  );
}

/** Móvil y tablet: los personajes en fila sobre el formulario. */
export function AuthCast({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative flex items-end justify-center gap-1", className)}>
      <EmotionDefs />
      {(["calm", "sad", "joy", "spark", "hope"] as Emotion[]).map((emotion, index) => (
        <EmotionCharacter
          key={emotion}
          emotion={emotion}
          delay={`${-index * 0.7}s`}
          className={emotion === "joy" ? "w-24 sm:w-32" : "w-16 sm:w-24"}
        />
      ))}
    </div>
  );
}

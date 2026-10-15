import { Sparkles } from "lucide-react";
import { EmotionCharacter, EmotionDefs, type Emotion } from "@/components/illustrations/emotion-characters";

/**
 * Un resultado del Espejo sin hallazgos que mostrar (refuerzo, todavía
 * analizando, no se pudo leer): centrado en la pantalla, con una emoción que
 * acompaña y una entrada suave en cascada (personaje, mensaje, acciones).
 * Las animaciones solo corren si no se pide menos movimiento.
 */
export function MirrorMoment({
  emotion,
  message,
  celebrate = false,
  children,
}: {
  emotion: Emotion;
  message: string;
  /** Destellos alrededor de la emoción: solo para el refuerzo (RN-ES-12). */
  celebrate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] flex-col items-center justify-center gap-6 py-6 text-center">
      <EmotionDefs />
      <div className="relative motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in-0 motion-safe:duration-500 motion-safe:ease-[cubic-bezier(.34,1.56,.64,1)]">
        <div aria-hidden className="absolute inset-0 -z-10 scale-150 rounded-full bg-bloom-tint/70 blur-2xl" />
        <EmotionCharacter emotion={emotion} className="w-32 md:w-36" />
        {celebrate && (
          <div aria-hidden>
            <Sparkles className="auth-float absolute -top-2 -left-6 size-6 text-root" />
            <Sparkles className="auth-float absolute top-4 -right-7 size-5 text-bloom [animation-delay:-2s]" />
            <Sparkles className="auth-float absolute -bottom-1 -left-3 size-4 text-flow [animation-delay:-4s]" />
          </div>
        )}
      </div>
      <p
        role="status"
        className="max-w-md font-heading text-2xl leading-snug font-bold text-balance text-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 motion-safe:duration-500 motion-safe:fill-mode-backwards"
      >
        {message}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:delay-400 motion-safe:duration-500 motion-safe:fill-mode-backwards">
        {children}
      </div>
    </div>
  );
}

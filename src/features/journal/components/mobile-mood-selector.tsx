"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { MoodPicker } from "@/components/forms/mood-picker";
import { cn } from "@/lib/utils";

/** Respaldo por si la animación de cierre no avisa al terminar (pestaña en segundo plano). */
const CLOSE_FALLBACK_MS = 300;

/**
 * El estado de ánimo del Diario en móvil (RN-DI-03): una barra con un libro, "¿Cómo te sientes?" y la carita elegida
 * (la de Inicio si llegó con Escribir). Sin elegir, la carita va en gris con un halo que invita a tocarla. Al tocar la
 * barra, las 5 caritas se abren encima como agua que se expande desde la carita (`.mood-liquid-open`); al elegir una,
 * se contraen al instante hacia la carita de la barra (`.mood-liquid-close`, sin salto ni burbuja) y la barra muestra
 * la nueva. En escritorio sigue la fila de 5 caritas de siempre.
 */
export function MobileMoodSelector({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string;
  value: Mood | undefined;
  onChange: (mood: Mood) => void;
  invalid?: boolean;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  // Contrayéndose (animación de cierre): ya no se puede elegir otra.
  const [closing, setClosing] = useState(false);
  const fallbackRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Abierto: el foco va a la carita elegida (o la primera); Escape o tocar fuera lo cierran.
  useEffect(() => {
    if (!open) {
      return;
    }
    const radios = pickerRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    const selected = pickerRef.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
    (selected ?? radios?.[0])?.focus();

    const close = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  function finishClosing() {
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    setClosing(false);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(mood: Mood) {
    if (closing) return;
    onChange(mood);
    setClosing(true);
    fallbackRef.current = window.setTimeout(finishClosing, CLOSE_FALLBACK_MS);
  }

  return (
    <div ref={rootRef} className="relative md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={`${label} ${value ? t(`mood.${value}`) : t("journal.moodPick")}`}
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-16 w-full items-center gap-3 rounded-lg bg-card/90 px-4 py-2.5 text-left shadow-card",
          "touch-manipulation transition-transform focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99]",
          invalid && "ring-2 ring-destructive",
        )}
      >
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-flow-tint">
          <BookOpen className="size-5 text-foreground" />
        </span>
        <span className="min-w-0 flex-1 text-base font-semibold text-foreground">{label}</span>
        <span aria-hidden className="relative flex size-12 shrink-0 items-center justify-center">
          {value === undefined && (
            // El halo: invita a tocar la carita mientras no hay una elegida.
            <span className="mood-pick-halo absolute inset-0 rounded-full ring-4 ring-(--prompt-red)/35" />
          )}
          <MoodOrb mood={value ?? 3} muted={value === undefined} animated decorative className="relative size-11" />
        </span>
      </button>

      {open && (
        // Encima de la barra, como agua que sale de la carita y se extiende.
        // Centrada sobre la barra (sin desplazamientos: la animación usa transform y no deben sumarse).
        <div className="absolute inset-0 z-30 flex items-center">
          <div
            ref={pickerRef}
            onAnimationEnd={(event) => {
              if (closing && event.target === event.currentTarget) finishClosing();
            }}
            className={cn(
              "w-full rounded-lg bg-card shadow-card",
              closing ? "mood-liquid-close pointer-events-none" : "mood-liquid-open",
            )}
          >
            <MoodPicker
              label={label}
              value={value}
              onChange={choose}
              feedback={false}
              className="bg-transparent shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

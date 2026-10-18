"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "@/components/forms/field-error";
import { GenderPicker } from "@/components/forms/gender-picker";
import { resetTourSeen } from "@/components/tour/tour-seen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteWelcome } from "@/features/welcome/api/use-welcome";
import { applyPalette } from "@/lib/palette";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SendaLogo } from "@/components/brand/senda-logo";
import { IllustrationArt } from "@/features/welcome/components/illustration-art";
import { WelcomeBackdrop } from "@/features/welcome/components/welcome-backdrop";
import { LANDSCAPES, type Landscape } from "@/features/welcome/components/welcome-landscapes";
import { TourLaunch } from "@/features/welcome/components/tour-launch";
import {
  BOOK_LOVER,
  DEEP_WORK,
  MOONLIGHT,
  WAITING_FOR_YOU,
  type Illustration,
} from "@/features/welcome/illustrations/undraw";
import { PROFILE_CARD } from "@/features/welcome/illustrations/profile-card";
import type { Gender } from "@/types/gender";

const SCREENS = ["whatItIs", "whatItIsNot", "howToUse"] as const;
const MAX_STARTING_POINT = 500;
const MAX_NAME = 30;
/** Cuánto hay que deslizar (px) para pasar de pantalla. */
const SWIPE_THRESHOLD = 50;

type Step = (typeof SCREENS)[number] | "question" | "identity";

/**
 * Cada pantalla con su color vivo y su ilustración. El degradado va de claro (arriba, la ilustración y el título) a
 * oscuro (abajo, donde va el texto): el blanco sobre el tono oscuro cumple contraste AA, y el botón blanco lleva el
 * texto en ese mismo tono oscuro. La ilustración se pinta con `accent` (y `accent2`, un tono que combina).
 */
const SLIDE_STYLE: Record<
  Step,
  { from: string; to: string; ink: string; accent: string; accent2: string; art: Illustration; land: Landscape }
> = {
  whatItIs: {
    from: "#7CC98C",
    to: "#2F8550",
    ink: "#24693F",
    accent: "#3E9B5B",
    accent2: "#F59A5E",
    art: DEEP_WORK,
    land: LANDSCAPES.MEADOW,
  },
  whatItIsNot: {
    from: "#F59A5E",
    to: "#C2531F",
    ink: "#A2441A",
    accent: "#E07A3E",
    accent2: "#6FB6EC",
    art: WAITING_FOR_YOU,
    land: LANDSCAPES.DESERT,
  },
  howToUse: {
    from: "#6FB6EC",
    to: "#1F6FB8",
    ink: "#1A5D9A",
    accent: "#2B86D1",
    accent2: "#F2C95C",
    art: MOONLIGHT,
    land: LANDSCAPES.SEA,
  },
  question: {
    from: "#A78BE0",
    to: "#6440AE",
    ink: "#56379A",
    accent: "#7A55C7",
    accent2: "#F2C95C",
    art: BOOK_LOVER,
    land: LANDSCAPES.MOUNTAINS,
  },
  identity: {
    from: "#EC8DB0",
    to: "#A63A64",
    ink: "#8E3156",
    accent: "#C04A78",
    accent2: "#6FB6EC",
    art: PROFILE_CARD,
    land: LANDSCAPES.CITY,
  },
};

/** Cuánto dura la animación que presenta el recorrido antes de entrar a Inicio (TourLaunch). */
const TOUR_LAUNCH_MS = 2900;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * CU-17 Completar bienvenida, como un carrusel a pantalla completa: 3 pantallas fijas (RN-AC-09) — qué es, qué no es
 * (con Línea 113 y SAMU 106) y cómo se usa —, la pregunta opcional "Mi punto de partida" y, la primera vez, "Cuéntanos
 * de ti" al final (cómo quiere que lo llamen y su sexo, obligatorios; el sexo elige el tema de color). Se pasa con
 * "Continuar" o deslizando. "Empezar" la marca como vista y lleva a Inicio, donde arranca el tutorial.
 * - Cada pantalla tiene su ilustración (unDraw y una del mismo estilo), pintada con su color. Entre pantallas, la
 *   ilustración entra deslizándose (según se avance o se vuelva) y el texto aparece escalonado.
 * - De fondo, a pantalla completa, un paisaje de noche (WelcomeBackdrop) en el color de cada pantalla.
 * - Escritorio: el texto y los botones a la izquierda; la ilustración grande a la derecha, delante de la luna.
 * - Al tocar "Empezar", una animación presenta el recorrido por la interfaz (TourLaunch) y luego entra a Inicio,
 *   donde arranca el tutorial.
 * - `review` (desde Perfil, RN-AC-13): solo las 3 pantallas; "Listo" vuelve a Perfil sin guardar nada.
 */
export function WelcomeFlow({
  mode = "first-time",
  initialStartingPoint,
  identityRequired = false,
}: {
  mode?: "first-time" | "review";
  initialStartingPoint?: string | null;
  identityRequired?: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const complete = useCompleteWelcome();
  const review = mode === "review";
  const askIdentity = !review && identityRequired;
  const steps: Step[] = [
    ...SCREENS,
    ...(review ? [] : (["question"] as const)),
    ...(askIdentity ? (["identity"] as const) : []),
  ];

  const [index, setIndex] = useState(0);
  const [startingPoint, setStartingPoint] = useState(initialStartingPoint ?? "");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>();
  const [showIdentityErrors, setShowIdentityErrors] = useState(false);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  // Escritorio: el texto a la izquierda y el paisaje a la derecha (en vez del carrusel del móvil).
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Hacia dónde se movió la última vez: la ilustración entra desde la derecha al avanzar y desde la izquierda al volver.
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [launching, setLaunching] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const moved = useRef(false);

  const step = steps[index];
  const style = SLIDE_STYLE[step];
  const onLastScreen = index === steps.length - 1;
  const nameMissing = name.trim() === "";
  const questionIndex = steps.indexOf("question");

  // Al cambiar de pantalla, el lector de pantalla y el teclado empiezan por su título (no al abrir).
  useEffect(() => {
    if (moved.current) {
      // Sin desplazar: si el navegador lo hiciera, correría todo el carrusel (y sus controles) fuera de lugar.
      headingRefs.current[index]?.focus({ preventScroll: true });
    }
  }, [index]);

  function goTo(target: number) {
    moved.current = true;
    setDirection(target >= index ? "next" : "prev");
    setIndex(Math.max(0, Math.min(steps.length - 1, target)));
  }

  async function start() {
    if (askIdentity) {
      if (nameMissing || !gender) {
        setShowIdentityErrors(true);
        return;
      }
      applyPalette(gender);
    }
    try {
      await complete.mutateAsync({
        startingPoint,
        ...(askIdentity && { preferredName: name, gender }),
      });
      // Recién llega: el tutorial de Inicio arranca aunque este navegador ya lo haya mostrado a otra cuenta.
      resetTourSeen();
      // La animación que presenta el recorrido; al terminar, a Inicio (con menos movimiento, casi de inmediato).
      router.prefetch("/inicio");
      setLaunching(true);
      window.setTimeout(() => router.push("/inicio"), prefersReducedMotion() ? 300 : TOUR_LAUNCH_MS);
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  }

  function primaryAction() {
    if (!onLastScreen) {
      goTo(index + 1);
    } else if (review) {
      router.push("/perfil");
    } else {
      void start();
    }
  }

  function onPointerUp(event: React.PointerEvent) {
    if (pointerStartX.current === null) return;
    const dx = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (dx <= -SWIPE_THRESHOLD && !onLastScreen) goTo(index + 1);
    if (dx >= SWIPE_THRESHOLD && index > 0) goTo(index - 1);
  }

  /** Lo de cada pantalla debajo del título: su texto o sus campos (los mismos en móvil y en escritorio). */
  function slideBody(slide: Step) {
    return slide === "question" ? (
      <div className="flex flex-col gap-3">
        <Label htmlFor="startingPoint" className="text-base leading-snug font-semibold text-white">
          {t("welcome.startingPoint")}
        </Label>
        <Textarea
          id="startingPoint"
          value={startingPoint}
          maxLength={MAX_STARTING_POINT}
          onChange={(e) => setStartingPoint(e.target.value)}
          aria-describedby="startingPointHint"
          rows={4}
          className="bg-card focus-visible:ring-white"
        />
        <p id="startingPointHint" className="text-base text-white">
          {t("welcome.startingPointHint")}
        </p>
      </div>
    ) : slide === "identity" ? (
      <div className="flex flex-col gap-4">
        <p className="text-base leading-relaxed text-white">{t("welcome.identityIntro")}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="preferredName" className="text-base font-semibold text-white">
            {t("welcome.nameLabel")}
          </Label>
          <Input
            id="preferredName"
            value={name}
            maxLength={MAX_NAME}
            autoComplete="given-name"
            className="bg-card focus-visible:ring-white"
            aria-invalid={(showIdentityErrors && nameMissing) || undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {showIdentityErrors && nameMissing && (
            <FieldError message="welcome.nameRequired" className="font-semibold text-white" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p id="genderLabel" className="text-base font-semibold text-white">
            {t("welcome.genderLabel")}
          </p>
          <GenderPicker
            labelledBy="genderLabel"
            value={gender}
            onChange={setGender}
            invalid={showIdentityErrors && !gender}
            onColor
          />
          {showIdentityErrors && !gender && (
            <FieldError message="welcome.genderRequired" className="font-semibold text-white" />
          )}
        </div>
      </div>
    ) : (
      <p className="text-base leading-relaxed text-white sm:text-lg">{t(`welcome.${slide}Body`)}</p>
    );
  }

  function slideTitle(slide: Step) {
    return slide === "question"
      ? t("welcome.startingPointTitle")
      : slide === "identity"
        ? t("welcome.identityTitle")
        : t(`welcome.${slide}Title`);
  }

  const primaryLabel = !onLastScreen
    ? t("welcome.continue")
    : review
      ? t("welcome.done")
      : complete.isPending
        ? t("welcome.starting")
        : t("welcome.start");

  if (launching) {
    return <TourLaunch background={style.to} accent={style.accent} />;
  }

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex overflow-clip text-white">
        <WelcomeBackdrop
          from={style.from}
          to={style.to}
          landscapes={steps.map((slide) => SLIDE_STYLE[slide].land)}
          index={index}
          desktop
        />
        <div className="relative z-10 flex w-1/2 shrink-0 flex-col overflow-y-auto px-14 py-10 xl:px-20">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-heading text-xl font-extrabold">
              <SendaLogo className="size-7" />
              Senda
            </span>
            <ol
              className="flex gap-2"
              aria-label={t("welcome.progressLabel", { step: index + 1, total: steps.length })}
            >
              {steps.map((slide, i) => (
                <li
                  key={slide}
                  aria-current={i === index ? "step" : undefined}
                  className={cn(
                    "h-2 rounded-full bg-white transition-all duration-300",
                    i === index ? "w-6" : "w-2 opacity-50",
                  )}
                />
              ))}
            </ol>
          </div>

          {/*
            El texto y sus botones juntos, centrados en la mitad izquierda (a lo alto y a lo ancho). Cada pantalla entra
            con un leve deslizamiento (key: se vuelve a montar al cambiar).
          */}
          <div className="mx-auto my-auto flex w-full max-w-xl flex-col gap-9 py-10">
            <section key={step} aria-live="polite" className="welcome-desk-in flex flex-col gap-5">
              <h2
                ref={(el) => {
                  headingRefs.current[index] = el;
                }}
                tabIndex={-1}
                className="font-heading text-5xl leading-[1.05] font-extrabold outline-none xl:text-6xl"
              >
                {slideTitle(step)}
              </h2>
              <span aria-hidden className="h-1 w-16 rounded-full bg-white/70" />
              <div className="max-w-lg [&_p]:text-lg">{slideBody(step)}</div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              {index > 0 && (
                <button
                  type="button"
                  aria-label={t("common.back")}
                  onClick={() => goTo(index - 1)}
                  className="flex size-14 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ArrowLeft className="size-5" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={primaryAction}
                disabled={complete.isPending}
                className="h-14 min-w-48 rounded-full bg-white px-8 text-lg font-bold shadow-lg transition-[transform,color] duration-300 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:opacity-80 motion-reduce:transition-none"
                style={{ color: style.ink }}
              >
                {primaryLabel}
              </button>
              {!review && questionIndex > index && (
                <button
                  type="button"
                  onClick={() => goTo(questionIndex)}
                  className="min-h-11 rounded-full px-4 text-base font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                >
                  {t("welcome.skip")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* La ilustración, delante de la luna del paisaje (a la derecha). */}
        <div className="pointer-events-none absolute top-[46%] left-[70%] w-[min(40vw,38rem)] -translate-x-1/2 -translate-y-1/2">
          <div key={step} className={direction === "next" ? "welcome-art-in-next" : "welcome-art-in-prev"}>
            <IllustrationArt
              art={style.art}
              accent={style.accent}
              accent2={style.accent2}
              className="h-auto max-h-[62vh] w-full drop-shadow-[0_30px_40px_rgb(0_0_0/0.25)]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-clip text-white">
      {/* Un solo paisaje detrás del carrusel: cambia de color al pasar de pantalla. */}
      <WelcomeBackdrop
        from={style.from}
        to={style.to}
        landscapes={steps.map((slide) => SLIDE_STYLE[slide].land)}
        index={index}
      />
      <div
        className="flex h-full touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onPointerDown={(event) => {
          pointerStartX.current = event.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        {steps.map((slide, i) => {
          const slideStyle = SLIDE_STYLE[slide];
          const active = i === index;
          const isForm = slide === "question" || slide === "identity";
          return (
            <section
              key={slide}
              aria-roledescription="slide"
              aria-label={t("welcome.progressLabel", { step: i + 1, total: steps.length })}
              aria-hidden={!active || undefined}
              inert={!active}
              className="relative h-full w-full shrink-0 overflow-hidden"
            >
              <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto px-6 pt-20 pb-32">
                {/* La ilustración, sin caja: delante de una luna que la ilumina. */}
                <div className={cn("flex items-center justify-center", isForm ? "py-2" : "flex-1 py-4")}>
                  <div
                    className={cn(
                      "relative w-full",
                      isForm ? "max-w-[10rem]" : "max-w-[17rem]",
                      active && "welcome-art-pop",
                    )}
                  >
                    <span aria-hidden className="welcome-moon-inline absolute top-1/2 left-1/2 aspect-square w-[92%]" />
                    <IllustrationArt
                      art={slideStyle.art}
                      accent={slideStyle.accent}
                      accent2={slideStyle.accent2}
                      className={cn(
                        "relative h-auto w-full drop-shadow-[0_18px_24px_rgb(0_0_0/0.25)]",
                        isForm ? "max-h-24" : "max-h-[26vh]",
                      )}
                    />
                  </div>
                </div>

                <h2
                  ref={(el) => {
                    headingRefs.current[i] = el;
                  }}
                  tabIndex={-1}
                  className="text-center font-heading text-3xl leading-tight font-extrabold drop-shadow-sm outline-none sm:text-4xl"
                >
                  {slideTitle(slide)}
                </h2>

                <div className="mt-5 rounded-3xl bg-black/15 p-5 backdrop-blur-sm">{slideBody(slide)}</div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Arriba: volver, en qué pantalla va y saltar (solo en las pantallas informativas, la primera vez). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-md items-center justify-between px-4 pt-4">
        <span className="pointer-events-auto size-11">
          {index > 0 && (
            <button
              type="button"
              aria-label={t("common.back")}
              onClick={() => goTo(index - 1)}
              className="flex size-11 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
          )}
        </span>
        <ol className="flex gap-2" aria-label={t("welcome.progressLabel", { step: index + 1, total: steps.length })}>
          {steps.map((slide, i) => (
            <li
              key={slide}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "h-2 rounded-full bg-white transition-all duration-300",
                i === index ? "w-6" : "w-2 opacity-50",
              )}
            />
          ))}
        </ol>
        <span className="pointer-events-auto flex min-w-11 justify-end">
          {!review && questionIndex > index && (
            <button
              type="button"
              onClick={() => goTo(questionIndex)}
              className="min-h-11 rounded-full px-3 text-base font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              {t("welcome.skip")}
            </button>
          )}
        </span>
      </div>

      {/* Abajo: un solo botón, blanco con el texto en el tono de la pantalla. */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={primaryAction}
          disabled={complete.isPending}
          className="h-14 w-full rounded-full bg-white text-lg font-bold shadow-lg transition-[transform,color] duration-300 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:opacity-80 motion-reduce:transition-none"
          style={{ color: style.ink }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, History, Home, Sprout, User, type LucideIcon } from "lucide-react";
import { SendaLogo } from "@/components/brand/senda-logo";

const NAV: { key: string; icon: LucideIcon }[] = [
  { key: "nav.home", icon: Home },
  { key: "nav.journal", icon: BookOpen },
  { key: "nav.progress", icon: Sprout },
  { key: "nav.history", icon: History },
  { key: "nav.profile", icon: User },
];

/**
 * Al terminar la bienvenida (CU-17), antes del tutorial: una maqueta de la app aparece, sus secciones se encienden
 * una por una (Inicio, Diario, Progreso, Historial, Perfil) y un círculo se expande hacia Inicio, donde arranca el
 * recorrido guiado. En escritorio la maqueta es una ventana con barra lateral; en móvil, un teléfono con la barra de
 * abajo. Solo CSS (`.tour-launch-*` en globals.css); con menos movimiento, solo aparece. La maqueta es decorativa:
 * el lector de pantalla oye el título.
 */
export function TourLaunch({ background, accent }: { background: string; accent: string }) {
  const t = useTranslations();
  const vars = { "--launch-accent": accent } as CSSProperties;

  return (
    <div
      role="status"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-6 text-white"
      style={{ backgroundColor: background, ...vars }}
    >
      <div className="tour-launch-stage flex w-full max-w-3xl flex-col items-center gap-10">
        {/* Escritorio: ventana con barra lateral. */}
        <div
          aria-hidden
          className="tour-launch-device hidden aspect-[16/10] w-full max-w-2xl gap-4 rounded-[1.75rem] bg-white p-4 shadow-2xl lg:flex"
        >
          <div className="flex w-[30%] flex-col gap-2 rounded-2xl bg-[#F4F2F6] p-4">
            <span className="mb-3 flex items-center gap-2 font-heading text-base font-extrabold text-[#2B2430]">
              <span style={{ color: accent }}>
                <SendaLogo className="size-5" />
              </span>
              Senda
            </span>
            {NAV.map(({ key, icon: Icon }, i) => (
              <span
                key={key}
                className="tour-launch-nav flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#2B2430]"
                style={{ "--i": i } as CSSProperties}
              >
                <Icon className="size-4" />
                {t(key)}
              </span>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <span
              className="tour-launch-block h-8 w-1/2 rounded-xl bg-[#EDEAF0]"
              style={{ "--i": 0 } as CSSProperties}
            />
            <span className="tour-launch-block h-24 rounded-2xl bg-[#F4F2F6]" style={{ "--i": 1 } as CSSProperties} />
            <div className="grid flex-1 grid-cols-2 gap-3">
              <span className="tour-launch-block rounded-2xl bg-[#F4F2F6]" style={{ "--i": 2 } as CSSProperties} />
              <span
                className="tour-launch-block rounded-2xl"
                style={{ "--i": 3, backgroundColor: accent, opacity: 0.25 } as CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Móvil: teléfono con la barra de abajo. */}
        <div
          aria-hidden
          className="tour-launch-device flex aspect-[9/17] w-[min(15rem,62vw)] flex-col gap-3 rounded-[2.25rem] bg-white p-3 shadow-2xl lg:hidden"
        >
          <span className="mx-auto h-1.5 w-14 rounded-full bg-[#EDEAF0]" />
          <span className="tour-launch-block h-6 w-2/3 rounded-lg bg-[#EDEAF0]" style={{ "--i": 0 } as CSSProperties} />
          <span className="tour-launch-block h-20 rounded-2xl bg-[#F4F2F6]" style={{ "--i": 1 } as CSSProperties} />
          <span className="tour-launch-block flex-1 rounded-2xl bg-[#F4F2F6]" style={{ "--i": 2 } as CSSProperties} />
          <div className="flex justify-between rounded-2xl bg-[#F4F2F6] p-1.5">
            {NAV.map(({ key, icon: Icon }, i) => (
              <span
                key={key}
                className="tour-launch-nav flex size-9 items-center justify-center rounded-xl text-[#2B2430]"
                style={{ "--i": i } as CSSProperties}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="tour-launch-text flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-3xl font-extrabold lg:text-4xl">{t("welcome.launchTitle")}</h2>
          <p className="max-w-md text-base text-white/90 lg:text-lg">{t("welcome.launchBody")}</p>
        </div>
      </div>

      {/* Al final, un círculo del color de la app se expande y deja ver Inicio. */}
      <span aria-hidden className="tour-launch-reveal absolute inset-0 bg-background" />
    </div>
  );
}

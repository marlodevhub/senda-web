import { getTranslations } from "next-intl/server";
import { Sprout } from "lucide-react";
import { AuthCast, AuthHero } from "@/app/(auth)/(entrada)/_components/auth-hero";

/**
 * Entrada del estudiante (login, activar, recuperar): los personajes de
 * emociones a la izquierda y el formulario en una tarjeta a la derecha; en
 * móvil y tablet, los personajes en fila sobre la tarjeta.
 */
export default async function EntradaLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-dvh bg-[linear-gradient(135deg,var(--bloom-tint),var(--background)_45%,var(--flow-tint))]">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col p-4 sm:p-8 lg:p-10">
        <p className="flex items-center gap-2 font-heading text-2xl font-extrabold text-foreground">
          <span className="flex size-10 items-center justify-center rounded-full bg-card text-sprout-ink shadow-card">
            <Sprout className="size-5" aria-hidden />
          </span>
          Senda
        </p>
        <div className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="hidden flex-col items-center gap-10 lg:flex">
            <AuthHero />
            <p className="max-w-md text-center font-heading text-2xl font-bold text-balance text-foreground">
              {t("access.showcaseTagline")}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AuthCast className="lg:hidden" />
            {/* Móvil: el formulario va directo sobre el fondo; desde tablet, en una tarjeta. */}
            <main className="w-full max-w-md px-1 pt-2 sm:rounded-[2rem] sm:bg-card sm:p-10 sm:shadow-card">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

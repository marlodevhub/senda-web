import { getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { MessagesBell, MessagesCenterProvider } from "@/components/layout/messages-center";
import { Sprout } from "lucide-react";

/**
 * Móvil (≥ 360 px, RS-TR): barra inferior. Tablet (`md`): riel lateral de
 * iconos. Escritorio (`lg`): barra lateral completa y contenido más ancho.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <MessagesCenterProvider>
      <div className="min-h-screen bg-background md:flex">
        <a
          href="#contenido"
          className="sr-only z-20 rounded-md bg-card px-4 py-2 font-semibold text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          {t("nav.skipToContent")}
        </a>
        <StudentSidebar />
        {/* Tablet y escritorio: la campana flota arriba a la derecha. */}
        <div className="fixed top-5 right-6 z-20 hidden md:block">
          <MessagesBell />
        </div>
        <div className="min-w-0 flex-1 pb-28 md:pb-0">
          {/* Móvil: la marca a la izquierda y la campana a la derecha. */}
          <header className="flex items-center justify-between px-4 pt-4 md:hidden">
            <span className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[image:var(--grad-dawn)] text-primary-foreground">
                <Sprout className="size-4" aria-hidden />
              </span>
              <span className="font-heading text-xl font-extrabold text-foreground">Senda</span>
            </span>
            <MessagesBell />
          </header>
          <main
            id="contenido"
            className="mx-auto w-full max-w-md px-4 pt-4 pb-6 md:max-w-2xl md:px-8 md:py-8 lg:max-w-3xl lg:px-10 lg:py-10 xl:max-w-4xl"
          >
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </MessagesCenterProvider>
  );
}

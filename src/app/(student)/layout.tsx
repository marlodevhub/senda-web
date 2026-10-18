import { getTranslations } from "next-intl/server";
import { BottomNav } from "./_components/bottom-nav";
import { StudentSidebar } from "./_components/student-sidebar";
import { MessagesBell, MessagesCenterProvider } from "./_components/messages-center";
import { TourProvider } from "@/components/tour/app-tour";
import { PaletteSync } from "./_components/palette-sync";
import { GlassSync } from "./_components/glass-sync";
import { MobileHeaderBackdrop } from "./_components/mobile-header-backdrop";
import { ParticipantNoSelect } from "@/components/layout/participant-no-select";
import { SendaLogo } from "@/components/brand/senda-logo";

/**
 * Móvil (≥ 360 px, RS-TR): barra inferior. Tablet (`md`): riel lateral de
 * iconos. Escritorio (`lg`): barra lateral completa y contenido más ancho.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <MessagesCenterProvider>
      <TourProvider>
        <PaletteSync />
        <GlassSync />
        <ParticipantNoSelect />
        {/* overflow-x-clip: lo que sale a pantalla completa (jardín) no crea scroll horizontal. */}
        {/* group/shell: si la pantalla trae un panel derecho fijo (Inicio en escritorio), el contenido y la campana le
            dejan su espacio. */}
        <div className="student-shell participant-no-select group/shell min-h-screen overflow-x-clip bg-background md:flex">
          <a
            href="#contenido"
            className="sr-only z-20 rounded-md bg-card px-4 py-2 font-semibold text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {t("nav.skipToContent")}
          </a>
          <StudentSidebar />
          {/*
            Tablet y escritorio: un solo margen de 1,25rem, como en una app nativa: del borde de la ventana a la barra
            lateral, de la barra al contenido, del contenido al panel derecho y de ese panel al borde (el mismo espacio
            que hay entre tarjetas). La campana flota arriba a la derecha, en esa misma línea.
          */}
          <div className="fixed top-5 right-5 z-20 hidden md:block lg:group-has-[[data-right-rail]]/shell:right-[23.25rem] xl:group-has-[[data-right-rail]]/shell:right-[25.25rem]">
            <MessagesBell />
          </div>
          <div className="min-w-0 flex-1 pb-28 md:pb-0 lg:group-has-[[data-right-rail]]/shell:pr-[22rem] xl:group-has-[[data-right-rail]]/shell:pr-[24rem]">
            {/* Móvil: la marca a la izquierda y la campana a la derecha. */}
            {/* Fija arriba y sobre los fondos a pantalla completa (cielo del Diario, jardín): transparente arriba del todo;
                al bajar toma fondo con desenfoque (MobileHeaderBackdrop). */}
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:hidden">
              <MobileHeaderBackdrop />
              <span className="flex items-center gap-2">
                {/* El logotipo solo, en el color de acento del tema (rosado; azul con Hombre). */}
                <SendaLogo className="size-7 text-(--prompt-red)" />
                <span className="font-brand text-xl font-extrabold text-foreground">Senda</span>
              </span>
              <MessagesBell />
            </header>
            <main
              id="contenido"
              className="mx-auto w-full max-w-md px-4 pt-1 pb-6 md:max-w-2xl md:p-5 lg:max-w-3xl xl:max-w-4xl lg:group-has-[[data-right-rail]]/shell:max-w-5xl"
            >
              {children}
            </main>
          </div>
          {/*
            Tablet y escritorio: el contenido se desvanece en el color del fondo al llegar al borde de abajo de la
            ventana, en vez de cortarse en seco. Queda debajo de la barra lateral y del panel del calendario (z-10).
          */}
          <div
            aria-hidden
            className="page-bottom-fade pointer-events-none fixed inset-x-0 bottom-0 z-[5] hidden h-12 md:block"
          />
          <BottomNav />
        </div>
      </TourProvider>
    </MessagesCenterProvider>
  );
}

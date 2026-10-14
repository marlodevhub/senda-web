import { getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StudentSidebar } from "@/components/layout/student-sidebar";

/**
 * Móvil (≥ 360 px, RS-TR): barra inferior. Tablet (`md`): riel lateral de
 * iconos. Escritorio (`lg`): barra lateral completa y contenido más ancho.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-background md:flex">
      <a
        href="#contenido"
        className="sr-only z-20 rounded-md bg-card px-4 py-2 font-semibold text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t("nav.skipToContent")}
      </a>
      <StudentSidebar />
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <main
          id="contenido"
          className="mx-auto w-full max-w-md px-4 py-6 md:max-w-2xl md:px-8 md:py-8 lg:max-w-3xl lg:px-10 lg:py-10 xl:max-w-4xl"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

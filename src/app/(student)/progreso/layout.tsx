import { getTranslations } from "next-intl/server";
import { ProgressTabs } from "@/app/(student)/progreso/_components/progress-tabs";

export default async function ProgresoLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      {/* Encima del jardín a pantalla completa (tablet y escritorio). En móvil no se ve (más espacio); queda para lectores de pantalla. */}
      <h1 className="relative z-10 sr-only font-heading text-xl font-bold text-foreground md:not-sr-only">
        {t("progress.title")}
      </h1>
      <ProgressTabs />
      {children}
    </div>
  );
}

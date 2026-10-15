import { getTranslations } from "next-intl/server";
import { ProgressTabs } from "@/app/(student)/progreso/_components/progress-tabs";

export default async function ProgresoLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      {/* Encima del jardín a pantalla completa (tablet y escritorio). */}
      <h1 className="relative z-10 font-heading text-xl font-bold text-foreground">{t("progress.title")}</h1>
      <ProgressTabs />
      {children}
    </div>
  );
}

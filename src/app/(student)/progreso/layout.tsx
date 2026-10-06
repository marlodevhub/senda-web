import { getTranslations } from "next-intl/server";
import { ProgressTabs } from "@/app/(student)/progreso/_components/progress-tabs";

export default async function ProgresoLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-xl font-bold text-foreground">{t("progress.title")}</h1>
      <ProgressTabs />
      {children}
    </div>
  );
}

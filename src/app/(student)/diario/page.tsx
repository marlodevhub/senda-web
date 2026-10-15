import { getTranslations } from "next-intl/server";
import { JournalForm } from "@/features/journal/components/journal-form";

export default async function DiarioPage() {
  const t = await getTranslations();

  return (
    <>
      {/* Cielo suave detrás de todo el Diario; la barra lateral (z-10) y el dock (z-20) quedan encima. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_0%,var(--flow-tint),transparent_55%),radial-gradient(ellipse_at_90%_10%,var(--bloom-tint),transparent_50%)]"
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col items-center gap-1 pt-2 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-foreground md:text-4xl">{t("journal.subtitle")}</h1>
          <p className="text-base text-muted-foreground">{t("journal.tagline")}</p>
        </header>
        <JournalForm />
      </div>
    </>
  );
}

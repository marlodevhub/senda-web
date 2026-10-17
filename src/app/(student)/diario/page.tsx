import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { JournalWithCheckIn } from "./_components/journal-with-check-in";

export default async function DiarioPage() {
  const t = await getTranslations();

  return (
    <>
      {/* Cielo suave detrás de todo el Diario (.journal-sky); la barra lateral (z-10) y el dock (z-20) quedan encima. */}
      <div aria-hidden className="journal-sky pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-[1] mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* En móvil no se muestra ni ocupa lugar (más espacio para escribir); queda para lectores de pantalla. */}
        <header className="sr-only md:not-sr-only md:flex md:flex-col md:items-center md:gap-1 md:pt-2 md:text-center">
          <h1 className="font-heading text-4xl font-extrabold text-foreground">{t("journal.subtitle")}</h1>
          <p className="text-base text-muted-foreground">{t("journal.tagline")}</p>
        </header>
        {/* Suspense: lee `?animo=` de la URL (useSearchParams). */}
        <Suspense>
          <JournalWithCheckIn />
        </Suspense>
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { MirrorPageClient } from "./_components/mirror-page-client";
import { BackLink } from "@/components/layout/back-link";
import { routes } from "@/lib/routes";

/** CU-03: el Espejo de un registro (al guardar en el Diario se llega aquí). */
export default async function EspejoPage({ params }: { params: Promise<{ entryId: string }> }) {
  const journalEntryId = Number((await params).entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }
  return (
    <div className="flex flex-col gap-4">
      <BackLink href={routes.entry(journalEntryId)} />
      <MirrorPageClient journalEntryId={journalEntryId} />
    </div>
  );
}

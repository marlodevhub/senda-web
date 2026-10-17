import { notFound } from "next/navigation";
import { MirrorPageClient } from "./_components/mirror-page-client";

/** CU-03: el Espejo de un registro (al guardar en el Diario se llega aquí). */
export default async function EspejoPage({ params }: { params: Promise<{ entryId: string }> }) {
  const journalEntryId = Number((await params).entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }
  return <MirrorPageClient journalEntryId={journalEntryId} />;
}

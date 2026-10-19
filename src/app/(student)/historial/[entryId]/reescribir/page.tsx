import { notFound } from "next/navigation";
import { RewriteWithContext } from "./_components/rewrite-with-context";

/** CU-04: reescribir el registro completo (todas sus frases duras en una sola reescritura). */
export default async function ReescribirPage({ params }: { params: Promise<{ entryId: string }> }) {
  const journalEntryId = Number((await params).entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }
  return <RewriteWithContext journalEntryId={journalEntryId} />;
}

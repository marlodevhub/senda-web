import { notFound } from "next/navigation";
import { RewriteWithContext } from "./_components/rewrite-with-context";
import { parseFindingId } from "@/lib/routes";

/** CU-04: reescribir una frase del registro (`?frase=` elige cuál; sin él, la que propone el servidor). */
export default async function ReescribirPage({
  params,
  searchParams,
}: {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ frase?: string }>;
}) {
  const journalEntryId = Number((await params).entryId);
  if (!Number.isInteger(journalEntryId)) {
    notFound();
  }
  return <RewriteWithContext journalEntryId={journalEntryId} findingId={parseFindingId((await searchParams).frase)} />;
}

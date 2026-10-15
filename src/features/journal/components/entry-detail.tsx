"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoodOrb, type Mood } from "@/components/icons/mood-orb";
import { FindingCard } from "@/components/feedback/finding-card";
import { CareMessage } from "@/components/feedback/care-message";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEntryDetail, useDeleteEntry } from "@/features/journal/api/use-entries";
import type { EntryMirrorFinding, EntryRewrite } from "@/features/journal/api/get-entry-detail";
import { patternLabelKey } from "@/lib/pattern-labels";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";

const RESULT_KEY: Record<string, string> = {
  SOFTENED: "history.resultSoftened",
  ALMOST: "history.resultAlmost",
  STILL_HARD: "history.resultStillHard",
  PENDING: "history.resultPending",
};

function fragmentOf(
  finding: EntryMirrorFinding,
  texts: { q1: string | null; q2: string | null; q3: string | null; freeText: string | null },
) {
  const source =
    finding.field === "Q1"
      ? texts.q1
      : finding.field === "Q2"
        ? texts.q2
        : finding.field === "Q3"
          ? texts.q3
          : texts.freeText;
  return (source ?? "").slice(finding.start, finding.end);
}

function RewriteRow({ rewrite }: { rewrite: EntryRewrite }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{t("history.attemptLabel", { n: rewrite.attemptNumber })}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {t(RESULT_KEY[rewrite.result ?? "PENDING"])}
        </span>
      </div>
      {rewrite.moodAfter != null && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{t("history.moodAfterLabel")}</span>
          <MoodOrb mood={rewrite.moodAfter as Mood} className="size-6" />
        </div>
      )}
      {rewrite.inJar && <span className="text-xs text-muted-foreground">{t("history.inJar")}</span>}
    </div>
  );
}

/** CU-11 Consultar detalle (RN-HI-03/04), CU-12 Eliminar registro (RN-HI-05/06). */
export function EntryDetail({ journalEntryId }: { journalEntryId: number }) {
  const t = useTranslations();
  const router = useRouter();
  const { data: entry, isPending } = useEntryDetail(journalEntryId);
  const deleteMutation = useDeleteEntry();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(journalEntryId);
      toast.success(t("history.deleted"));
      router.push("/historial");
    } catch (error) {
      setConfirmOpen(false);
      if (error instanceof BffError) {
        toast.error(t(errorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  if (isPending || !entry) {
    return <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  const isRisk = entry.status === "RISK";
  const findings = entry.mirror?.findings ?? [];
  const canRewrite = !isRisk && entry.status === "COMPLETED" && entry.rewrites.length < 2;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 shadow-card">
        <div className="flex items-center gap-3">
          <MoodOrb mood={entry.moodBefore as Mood} className="size-10" />
          <span className="text-sm font-semibold text-foreground">
            {t("history.dayLabel", { day: entry.interventionDay })}
          </span>
        </div>
        {canRewrite && (
          <Button variant="hero" onClick={() => router.push(`/reescritura/${entry.id}`)}>
            {t("home.pendingRewrite")}
          </Button>
        )}
      </div>

      {entry.mode === "GUIDED" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">{t("history.q1Label")}</span>
            <p className="text-sm text-foreground">{entry.q1}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">{t("history.q2Label")}</span>
            <p className="text-sm text-foreground">{entry.q2}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">{t("history.q3Label")}</span>
            <p className="text-sm text-foreground">{entry.q3}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">{t("history.freeTextLabel")}</span>
          <p className="text-sm text-foreground">{entry.freeText}</p>
        </div>
      )}

      {isRisk && <CareMessage />}

      {!isRisk && entry.status === "COMPLETED" && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("history.mirrorTitle")}</h3>
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("history.noFindings")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {findings.map((finding) => (
                <FindingCard
                  key={finding.findingId}
                  fragment={fragmentOf(finding, entry)}
                  label={t(patternLabelKey(finding.pattern))}
                  dimension={finding.dimension}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!isRisk && entry.rewrites.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("history.rewritesTitle")}</h3>
          <div className="flex flex-col gap-2">
            {entry.rewrites.map((rewrite) => (
              <RewriteRow key={rewrite.id} rewrite={rewrite} />
            ))}
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">{t("history.deleteCta")}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("history.deleteConfirmBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={handleDelete}>
              {deleteMutation.isPending ? t("history.deleting") : t("history.deleteConfirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

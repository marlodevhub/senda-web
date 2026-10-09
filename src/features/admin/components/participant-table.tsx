"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { useAccessReset } from "@/features/admin/api/use-participants";
import type { AdminParticipant } from "@/features/admin/api/participants";

const STATUS_KEY: Record<string, string> = {
  PENDING: "admin.participants.statusPending",
  ACTIVE: "admin.participants.statusActive",
  READ_ONLY: "admin.participants.statusReadOnly",
  WITHDRAWN: "admin.participants.statusWithdrawn",
};

/** CU-26: restablecer acceso opera siempre por código, nunca por id interno (RN-AD-04). */
export function ParticipantTable({ participants }: { participants: AdminParticipant[] }) {
  const t = useTranslations();
  const [target, setTarget] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const accessReset = useAccessReset();

  async function handleConfirmReset() {
    if (!target) return;
    try {
      const result = await accessReset.mutateAsync(target);
      setResetCode(result.resetCode);
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(adminErrorMessageKey(error.code)));
        setTarget(null);
        return;
      }
      toast.error(t("common.unexpectedError"));
      setTarget(null);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTarget(null);
      setResetCode(null);
    }
  }

  if (participants.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("admin.participants.empty")}</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.participants.codeColumn")}</TableHead>
            <TableHead>{t("admin.participants.statusColumn")}</TableHead>
            <TableHead>{t("admin.participants.daysWithEntryColumn")}</TableHead>
            <TableHead>{t("admin.participants.weeklyGoalColumn")}</TableHead>
            <TableHead>{t("admin.participants.lastActivityColumn")}</TableHead>
            <TableHead>{t("admin.participants.actionsColumn")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.code}>
              <TableCell className="font-mono">{participant.code}</TableCell>
              <TableCell>
                <Badge variant={participant.status === "WITHDRAWN" ? "secondary" : "default"}>
                  {t(STATUS_KEY[participant.status] ?? "admin.participants.statusPending")}
                </Badge>
              </TableCell>
              <TableCell>{participant.daysWithEntry}</TableCell>
              <TableCell>
                {participant.weeklyGoalMet.filter(Boolean).length} / {participant.weeklyGoalMet.length}
              </TableCell>
              <TableCell>
                {participant.lastActivityAt
                  ? new Date(participant.lastActivityAt).toLocaleDateString("es-PE")
                  : t("admin.participants.never")}
              </TableCell>
              <TableCell>
                {participant.status !== "WITHDRAWN" && (
                  <Button variant="outline" size="sm" onClick={() => setTarget(participant.code)}>
                    {t("admin.participants.resetCta")}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={target !== null} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.participants.resetConfirmTitle")}</DialogTitle>
            {!resetCode && (
              <DialogDescription>
                {t("admin.participants.resetConfirmBody", { code: target ?? "" })}
              </DialogDescription>
            )}
          </DialogHeader>

          {resetCode ? (
            <p className="rounded-md border border-border bg-muted px-3 py-3 text-center font-mono text-lg">
              {resetCode}
            </p>
          ) : null}
          {resetCode && <p className="text-sm text-muted-foreground">{t("admin.participants.resetCodeHint")}</p>}

          <DialogFooter>
            {resetCode ? null : (
              <Button onClick={handleConfirmReset} disabled={accessReset.isPending}>
                {accessReset.isPending ? t("admin.participants.resetting") : t("admin.participants.resetConfirm")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

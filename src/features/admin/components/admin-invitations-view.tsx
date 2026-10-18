"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BffError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dates";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import type { AdminInvitationCode } from "@/features/admin/api/invitations";
import { useAdminInvitations, useCreateAdminInvitation } from "@/features/admin/api/use-invitations";

/**
 * CU-28: generar un código de invitación (se ve una sola vez, para copiarlo) y la lista de invitaciones con su estado,
 * quién la creó y quién la usó.
 */
export function AdminInvitationsView() {
  const t = useTranslations();
  const { data: invitations, isError } = useAdminInvitations();
  const createInvitation = useCreateAdminInvitation();
  const [newCode, setNewCode] = useState<AdminInvitationCode | null>(null);

  async function handleCreate() {
    try {
      setNewCode(await createInvitation.mutateAsync());
    } catch (error) {
      toast.error(t(error instanceof BffError ? adminErrorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("admin.invitations.copied"));
    } catch {
      // Sin permiso para el portapapeles: el código queda a la vista y seleccionable.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold text-foreground">{t("admin.invitations.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("admin.invitations.subtitle")}</p>
      </div>

      <div>
        <Button onClick={handleCreate} disabled={createInvitation.isPending}>
          {createInvitation.isPending ? t("admin.invitations.creating") : t("admin.invitations.create")}
        </Button>
      </div>

      {newCode && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              {t("admin.invitations.newCodeTitle")}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <code
                data-testid="invitation-code"
                className="rounded-md bg-muted px-4 py-2 font-mono text-lg tracking-widest text-foreground select-all"
              >
                {newCode.code}
              </code>
              <Button variant="outline" onClick={() => handleCopy(newCode.code)}>
                <Copy className="size-4" aria-hidden />
                {t("admin.invitations.copy")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("admin.invitations.newCodeHint", { expiresAt: formatDateTime(newCode.expiresAt) })}
            </p>
          </CardContent>
        </Card>
      )}

      {isError && <p className="text-sm text-destructive">{t("common.unexpectedError")}</p>}

      {invitations && (
        <Card>
          <CardContent>
            {invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.invitations.empty")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.invitations.statusColumn")}</TableHead>
                    <TableHead>{t("admin.invitations.createdByColumn")}</TableHead>
                    <TableHead>{t("admin.invitations.createdAtColumn")}</TableHead>
                    <TableHead>{t("admin.invitations.expiresAtColumn")}</TableHead>
                    <TableHead>{t("admin.invitations.usedByColumn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{t(`admin.invitations.status${invitation.status}`)}</TableCell>
                      <TableCell>{invitation.createdBy ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTime(invitation.createdAt)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateTime(invitation.expiresAt)}</TableCell>
                      <TableCell>{invitation.usedBy ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

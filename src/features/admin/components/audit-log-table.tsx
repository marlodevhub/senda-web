"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLogEntry } from "@/features/admin/api/audit";
import { formatDateTime } from "@/lib/format/dates";

/** CU-27 paso 2: fecha, actor, acción, entidad y código del participante. Nunca textos (RN-AD-04). */
export function AuditLogTable({ items }: { items: AuditLogEntry[] }) {
  const t = useTranslations();

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("admin.audit.empty")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.audit.dateColumn")}</TableHead>
          <TableHead>{t("admin.audit.actorColumn")}</TableHead>
          <TableHead>{t("admin.audit.actionColumn")}</TableHead>
          <TableHead>{t("admin.audit.entityColumn")}</TableHead>
          <TableHead>{t("admin.audit.participantColumn")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={`${item.createdAt}-${index}`}>
            <TableCell className="whitespace-nowrap">{formatDateTime(item.createdAt)}</TableCell>
            <TableCell>{item.actor}</TableCell>
            <TableCell>{t(`admin.audit.actions.${item.action}`)}</TableCell>
            <TableCell>
              {item.entity}
              {item.entityId ? ` · ${item.entityId}` : ""}
            </TableCell>
            <TableCell className="font-mono">{item.participantCode ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

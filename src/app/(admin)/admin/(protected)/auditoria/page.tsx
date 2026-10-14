"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AUDIT_ACTIONS, type AuditAction } from "@/features/admin/api/audit";
import { useAuditLogs } from "@/features/admin/api/use-audit";
import { AuditLogTable } from "@/features/admin/components/audit-log-table";
import { ConfigStatusCard } from "@/features/admin/components/config-status-card";
import { limaIsoDay } from "@/lib/format/dates";

const ALL_ACTIONS = "ALL";
/** RS-AD-08. */
const MAX_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
}

/** CU-27 Consultar auditoría y configuración vigente (solo lectura, RN-AD-10). */
export default function AdminAuditPage() {
  const t = useTranslations();
  const [from, setFrom] = useState(() => limaIsoDay(-29));
  const [to, setTo] = useState(() => limaIsoDay());
  const [action, setAction] = useState<AuditAction | undefined>(undefined);
  const [page, setPage] = useState(1);

  const days = from && to ? daysBetween(from, to) : 0;
  const validRange = days >= 1 && days <= MAX_DAYS;
  const { data, isFetching, isError } = useAuditLogs({ from, to, action, page }, validRange);

  function changeFilter(update: () => void) {
    update();
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-foreground">{t("admin.audit.title")}</h1>

      <ConfigStatusCard />

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-from">{t("admin.audit.fromLabel")}</Label>
          <Input id="audit-from" type="date" value={from} onChange={(e) => changeFilter(() => setFrom(e.target.value))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-to">{t("admin.audit.toLabel")}</Label>
          <Input id="audit-to" type="date" value={to} onChange={(e) => changeFilter(() => setTo(e.target.value))} />
        </div>
        <div className="flex min-w-60 flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("admin.audit.actionLabel")}</span>
          <Select
            value={action ?? ALL_ACTIONS}
            onValueChange={(next) =>
              changeFilter(() => setAction(next === ALL_ACTIONS ? undefined : (next as AuditAction)))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ACTIONS}>{t("admin.audit.allActions")}</SelectItem>
              {AUDIT_ACTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`admin.audit.actions.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!validRange && <p className="text-sm text-destructive">{t("admin.audit.invalidRange")}</p>}
      {isError && <p className="text-sm text-destructive">{t("common.unexpectedError")}</p>}

      {validRange && data && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <AuditLogTable items={data.items} />
            {(page > 1 || data.hasMore) && (
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)}>
                  {t("admin.audit.previous")}
                </Button>
                <span className="text-sm text-muted-foreground">{t("admin.audit.pageLabel", { page })}</span>
                <Button variant="outline" disabled={!data.hasMore || isFetching} onClick={() => setPage(page + 1)}>
                  {t("admin.audit.next")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

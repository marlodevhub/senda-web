"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStartingPoint, useWelcome } from "@/features/welcome/api/use-welcome";

/** RN-AC-13: editar "Mi punto de partida" (hasta el día 28). */
export function StartingPointForm() {
  const t = useTranslations();
  const { data: welcome } = useWelcome();
  const update = useUpdateStartingPoint();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? welcome?.startingPoint ?? "";

  async function save() {
    try {
      await update.mutateAsync(value);
      setDraft(null);
      toast.success(t("profile.saved"));
    } catch {
      toast.error(t("common.unexpectedError"));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="profileStartingPoint">{t("welcome.startingPoint")}</Label>
      <Textarea
        id="profileStartingPoint"
        value={value}
        maxLength={500}
        rows={3}
        disabled={!welcome?.startingPointEditable}
        onChange={(e) => setDraft(e.target.value)}
      />
      {welcome?.startingPointEditable && (
        <Button variant="outline" disabled={update.isPending || draft === null} onClick={save}>
          {update.isPending ? t("profile.saving") : t("profile.saveStartingPoint")}
        </Button>
      )}
    </div>
  );
}

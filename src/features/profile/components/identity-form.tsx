"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FieldError } from "@/components/forms/field-error";
import { GenderPicker } from "@/components/forms/gender-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateIdentity } from "@/features/profile/api/use-profile";
import { BffError } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/error-messages";
import { applyPalette } from "@/lib/palette";
import type { Gender } from "@/types/gender";

const MAX_NAME = 30;

/** CU-20: cambiar cómo quiere que lo llamen y su sexo; el tema de color cambia al guardar. */
export function IdentityForm({
  preferredName,
  gender: initialGender,
}: {
  preferredName: string | null;
  gender: Gender | null;
}) {
  const t = useTranslations();
  const update = useUpdateIdentity();
  const [name, setName] = useState(preferredName ?? "");
  const [gender, setGender] = useState<Gender | undefined>(initialGender ?? undefined);
  const [showErrors, setShowErrors] = useState(false);
  const nameMissing = name.trim() === "";

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (nameMissing || !gender) {
      setShowErrors(true);
      return;
    }
    try {
      await update.mutateAsync({ preferredName: name, gender });
      applyPalette(gender);
      toast.success(t("profile.saved"));
    } catch (error) {
      toast.error(t(error instanceof BffError ? errorMessageKey(error.code) : "common.unexpectedError"));
    }
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profilePreferredName" className="text-base">
            {t("welcome.nameLabel")}
          </Label>
          <Input
            id="profilePreferredName"
            value={name}
            maxLength={MAX_NAME}
            autoComplete="given-name"
            aria-invalid={(showErrors && nameMissing) || undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {showErrors && nameMissing && <FieldError message="welcome.nameRequired" />}
        </div>
        <div className="flex flex-col gap-2">
          <p id="profileGenderLabel" className="text-base font-medium text-foreground">
            {t("welcome.genderLabel")}
          </p>
          <GenderPicker
            labelledBy="profileGenderLabel"
            value={gender}
            onChange={setGender}
            invalid={showErrors && !gender}
          />
          {showErrors && !gender && <FieldError message="welcome.genderRequired" />}
        </div>
      </div>
      <p className="text-base text-muted-foreground">{t("profile.identityHint")}</p>
      <Button type="submit" variant="outline" className="self-start" disabled={update.isPending}>
        {update.isPending ? t("profile.saving") : t("profile.identitySave")}
      </Button>
    </form>
  );
}

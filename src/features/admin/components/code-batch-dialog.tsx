"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BffError } from "@/lib/api/client";
import { adminErrorMessageKey } from "@/features/admin/api/error-messages";
import { useGenerateCodes } from "@/features/admin/api/use-cohorts";
import { generateCodesFormSchema, type GenerateCodesFormValues } from "@/features/admin/schemas/admin.schema";

/** CU-24 paso 2 (RN-AD-06): generar de 1 a 150 códigos; se muestran una sola vez (RS-AD-07). */
export function CodeBatchDialog({ cohortId }: { cohortId: number }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const generateCodes = useGenerateCodes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof generateCodesFormSchema>, unknown, GenerateCodesFormValues>({
    resolver: zodResolver(generateCodesFormSchema),
  });

  async function onSubmit(values: GenerateCodesFormValues) {
    try {
      const generated = await generateCodes.mutateAsync({ cohortId, count: values.count });
      setCodes(generated);
    } catch (error) {
      if (error instanceof BffError) {
        toast.error(t(adminErrorMessageKey(error.code)));
        return;
      }
      toast.error(t("common.unexpectedError"));
    }
  }

  async function handleCopyAll() {
    if (!codes) return;
    await navigator.clipboard.writeText(codes.join("\n"));
    toast.success(t("admin.cohorts.codesCopied"));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCodes(null);
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>{t("admin.cohorts.codesGenerateSubmit")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.cohorts.codesTitle")}</DialogTitle>
          {!codes && <DialogDescription>{t("admin.cohorts.codesCountLabel")}</DialogDescription>}
        </DialogHeader>

        {codes ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("admin.cohorts.codesGeneratedHint")}</p>
            <ul className="max-h-64 overflow-y-auto rounded-md border border-border font-mono text-sm">
              {codes.map((code) => (
                <li key={code} className="border-b border-border px-3 py-1.5 last:border-0">
                  {code}
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={handleCopyAll}>
                {t("admin.cohorts.codesCopyAll")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="count">{t("admin.cohorts.codesCountLabel")}</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={150}
                aria-invalid={Boolean(errors.count)}
                {...register("count")}
              />
              {errors.count && <p className="text-sm text-destructive">{errors.count.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("admin.cohorts.codesGenerating") : t("admin.cohorts.codesGenerateSubmit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

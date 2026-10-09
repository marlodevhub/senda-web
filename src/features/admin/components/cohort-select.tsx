"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCohorts } from "@/features/admin/api/use-cohorts";
import type { Cohort } from "@/features/admin/api/cohorts";

/** Selector de cohorte compartido entre participantes y adherencia (sección 16: solo admin). */
export function CohortSelect({
  value,
  onChange,
  placeholder,
}: {
  value: number | null;
  onChange: (cohortId: number) => void;
  placeholder: string;
}) {
  const { data: cohorts } = useCohorts();

  return (
    <Select value={value ? String(value) : undefined} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(cohorts ?? []).map((cohort: Cohort) => (
          <SelectItem key={cohort.id} value={String(cohort.id)}>
            {cohort.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

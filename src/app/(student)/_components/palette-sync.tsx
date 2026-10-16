"use client";

import { useEffect } from "react";
import { useProfile } from "@/features/profile/api/use-profile";
import { applyPalette, paletteFor } from "@/lib/palette";

/**
 * El tema de color sigue al sexo guardado en el perfil (CU-20). La cookie lo pinta desde el servidor; esto solo
 * corrige el caso en que no coincide (otro navegador, o la cookie se borró).
 */
export function PaletteSync() {
  const { data: profile } = useProfile();
  const gender = profile?.gender;

  useEffect(() => {
    if (profile && document.documentElement.dataset.palette !== paletteFor(gender)) {
      applyPalette(gender);
    }
  }, [profile, gender]);

  return null;
}

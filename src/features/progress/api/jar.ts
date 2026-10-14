import { callBff } from "@/lib/api/client";
import type { Dimension } from "@/types/dimension";

/** CU-09: una tarjeta del frasco (RN-PR-09). */
export type JarCard = {
  rewriteId: number;
  text: string;
  originalPhrase: string;
  dimension: Dimension;
  date: string;
  favorite: boolean;
};

export async function getJar(): Promise<JarCard[]> {
  return callBff<JarCard[]>("/api/v1/jar");
}

/** RS-PR-05: `{favorite}` para marcar o desmarcar, `{inJar: false}` para quitarla. */
export async function updateJarCard(
  rewriteId: number,
  change: { favorite: boolean } | { inJar: false },
): Promise<void> {
  await callBff<void>(`/api/v1/jar/${rewriteId}`, { method: "PATCH", body: JSON.stringify(change) });
}

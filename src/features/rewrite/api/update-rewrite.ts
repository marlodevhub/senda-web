import { callBff } from "@/lib/api/client";

/** RS-RE-04: solo guardar (o no) en el frasco; la carita la pone la IA. */
export async function updateRewrite(rewriteId: number, inJar: boolean): Promise<void> {
  await callBff<null>(`/api/v1/rewrites/${rewriteId}`, {
    method: "PATCH",
    body: JSON.stringify({ inJar }),
  });
}

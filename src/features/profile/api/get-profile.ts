import { callBff } from "@/lib/api/client";
import type { Gender } from "@/types/gender";

export type Profile = {
  notificationsEnabled: boolean;
  hasEmail: boolean;
  /** El correo de los avisos enmascarado ("es***@correo.pe"); el completo nunca llega al navegador. */
  maskedEmail: string | null;
  /** Cómo quiere que lo llamen y su sexo (elige el tema de color); null hasta que los da en la bienvenida. */
  preferredName: string | null;
  gender: Gender | null;
};

export async function getProfile(): Promise<Profile> {
  return callBff<Profile>("/api/v1/profile");
}

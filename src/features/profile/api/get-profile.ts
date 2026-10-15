import { callBff } from "@/lib/api/client";

export type Profile = {
  notificationsEnabled: boolean;
  hasEmail: boolean;
  /** El correo de los avisos enmascarado ("es***@correo.pe"); el completo nunca llega al navegador. */
  maskedEmail: string | null;
};

export async function getProfile(): Promise<Profile> {
  return callBff<Profile>("/api/v1/profile");
}

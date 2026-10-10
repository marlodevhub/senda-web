import { callBff } from "@/lib/api/client";

export type Profile = {
  notificationsEnabled: boolean;
  hasEmail: boolean;
};

export async function getProfile(): Promise<Profile> {
  return callBff<Profile>("/api/v1/profile");
}

import { callBff } from "@/lib/api/client";

export type ConsentContent = { version: string; text: string };

export async function acceptConsent(input: { version: string; useForEvaluation: boolean }): Promise<void> {
  await callBff<void>("/api/v1/consent-acceptances", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

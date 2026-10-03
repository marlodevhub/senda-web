import { z } from "zod";

const envSchema = z.object({
  BACKEND_URL: z.string().url().default("http://localhost:8080"),
});

export const env = envSchema.parse({
  BACKEND_URL: process.env.BACKEND_URL,
});

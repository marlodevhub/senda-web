import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de los flujos principales (DoD de release). Levanta su propio entorno
 * aislado: LLM simulado (4010), senda-api con la base `senda_e2e` (8081) y
 * senda-web compilado (3100), para no chocar con el entorno de desarrollo.
 * Requiere Docker encendido. `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "estudiante-movil", testMatch: /student\..*spec\.ts/, use: { ...devices["Pixel 5"], viewport: { width: 360, height: 740 } } },
    { name: "admin-escritorio", testMatch: /admin\..*spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node e2e/mock-llm.mjs",
      url: "http://localhost:4010/health",
      stdout: "pipe",
      reuseExistingServer: false,
      ignoreHTTPSErrors: true,
    },
    {
      command: "./e2e/start-backend.sh",
      // 401 sin sesión = el backend ya responde.
      url: "http://localhost:8081/api/v1/home",
      timeout: 240_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run build && npx next start -p 3100",
      url: "http://localhost:3100/login",
      timeout: 240_000,
      reuseExistingServer: false,
      env: { BACKEND_URL: "http://localhost:8081", ADMIN_INVITES_ENABLED: "true" },
    },
  ],
});

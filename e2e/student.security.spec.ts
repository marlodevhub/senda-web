import { expect, test } from "@playwright/test";

// Seguridad y usabilidad listas para desplegar: cabeceras, CSRF, 404 y borrador.

test("las páginas llevan las cabeceras de seguridad", async ({ page }) => {
  const response = await page.goto("/login");
  const headers = response!.headers();

  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("el BFF rechaza peticiones que cambian datos desde otro origen (CSRF)", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    headers: { Origin: "https://sitio-malicioso.example" },
    data: { username: "estudiante", password: "x" },
  });

  expect(response.status()).toBe(403);
  expect((await response.json()).code).toBe("FORBIDDEN_ORIGIN");
});

test("una dirección inexistente muestra un 404 en español con salida", async ({ page }) => {
  const response = await page.goto("/esta-pagina-no-existe");

  expect(response!.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir al inicio" })).toBeVisible();
});

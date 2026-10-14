import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// El ingreso completo exige el segundo factor (TOTP, CU-23), cuyo secreto solo
// se muestra una vez al sembrar la cuenta: aquí se cubre lo que no lo necesita.

test("sin sesión de administrador, el panel lleva al ingreso", async ({ page }) => {
  for (const route of ["/admin/cohortes", "/admin/adherencia", "/admin/auditoria"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
});

test("credenciales incorrectas muestran el error sin revelar cuál falló", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill("nadie@senda.pe");
  await page.getByLabel("Contraseña").fill("ClaveIncorrecta1");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
  // axe mide colores reales: se espera a que el aviso termine su animación de entrada.
  await expect(page.locator("[data-sonner-toast]")).toHaveAttribute("data-mounted", "true");
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const details = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${n.target.join(" ")} — ${n.failureSummary?.split("\n").slice(1).join(" ")}`),
  );
  expect(details).toEqual([]);
});

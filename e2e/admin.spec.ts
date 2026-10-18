import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHmac } from "node:crypto";
import { seedAdminInvitation } from "./db";

// El ingreso completo exige el segundo factor (TOTP, CU-23), cuyo secreto solo
// se muestra una vez al sembrar la cuenta: aquí se cubre lo que no lo necesita.

test("sin sesión de administrador, el panel lleva al ingreso", async ({ page }) => {
  for (const route of ["/admin/cohortes", "/admin/adherencia", "/admin/auditoria"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  // A diferencia de las pantallas del participante, el panel deja seleccionar y copiar (p. ej. códigos generados).
  expect(await page.evaluate(() => getComputedStyle(document.body).userSelect)).not.toBe("none");
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

/** RFC 6238: el código de 6 dígitos que mostraría la app autenticadora con este secreto (base32). */
function totp(base32Secret: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of base32Secret.replace(/\s/g, "")) {
    buffer = (buffer << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000 / 30)));
  const hash = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  return String((hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

test("con un código de invitación se crea una cuenta de administrador, se vincula el TOTP y se puede invitar a otro (CU-28)", async ({
  page,
}) => {
  const code = seedAdminInvitation();
  const email = `nueva-${Date.now()}@senda.test`;
  const password = "Compasion12!";

  await page.goto("/admin/login");
  await page.getByRole("link", { name: "¿Te invitaron? Crea tu cuenta con el código" }).click();
  await page.getByLabel("Código de invitación").fill(code.toLowerCase());
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Repite tu contraseña").fill(password);
  await page.getByRole("button", { name: "Continuar" }).click();

  // Vincula su app autenticadora: QR y clave, y confirma con un código.
  await expect(page.getByRole("img", { name: "Código QR para tu app autenticadora" })).toBeVisible();
  const secret = (await page.getByTestId("totp-secret").textContent()) ?? "";
  await page.getByLabel("Código de 6 dígitos").fill(totp(secret));
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByText("Tu cuenta está lista")).toBeVisible();

  // Entra como cualquier administrador: correo, contraseña y TOTP.
  await page.getByRole("link", { name: "Ir al ingreso" }).click();
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Código de 6 dígitos").fill(totp(secret));
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin\/cohortes/);

  // Y puede invitar a otra persona.
  await page.getByRole("link", { name: "Invitaciones" }).click();
  await page.getByRole("button", { name: "Generar código de invitación" }).click();
  await expect(page.getByTestId("invitation-code")).toHaveText(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  await expect(page.getByRole("cell", { name: "Vigente" })).toBeVisible();
});

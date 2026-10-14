import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedPendingParticipant } from "./db";

const PASSWORD = "Compasion1";
const ENTRY =
  "Hoy en la práctica de cálculo me equivoqué en casi todos los ejercicios. Soy un inútil. " +
  "Me fui a casa pensando que no sirvo para esta carrera.";

/** WCAG 2.1 AA (RS-TR): sin violaciones de axe en la pantalla actual. */
async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const details = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${n.target.join(" ")} — ${n.failureSummary?.split("\n").slice(1).join(" ")}`),
  );
  expect(details).toEqual([]);
}

async function activateAndConsent(page: Page): Promise<string> {
  const code = seedPendingParticipant();

  // CU-15: activar la cuenta con el código y crear la contraseña.
  await page.goto("/activar");
  await page.getByLabel("Código de participante").fill(code);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Repite tu contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Activar cuenta" }).click();
  await expect(page.getByTestId("recovery-code")).toBeVisible();
  await page.getByRole("button", { name: "Ya lo guardé" }).click();

  // CU-16: el consentimiento solo se acepta después de leerlo hasta el final.
  await expect(page).toHaveURL(/\/consentimiento/);
  await page.locator("div.overflow-y-auto").first().evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event("scroll"));
  });
  await page.getByLabel("Leí y acepto").check();
  await page.getByRole("button", { name: "Acepto", exact: true }).click();

  // CU-17: bienvenida de 3 pantallas y punto de partida opcional.
  await expect(page).toHaveURL(/\/bienvenida/);
  await expect(page.getByRole("heading", { name: "Qué es Senda" })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText(/Línea 113, opción 5/)).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel("¿Qué te gustaría cambiar en cómo te hablas? (opcional)").fill("Dejar de llamarme inútil");
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page).toHaveURL(/\/inicio/);
  return code;
}

test("ciclo diario completo: activar → diario → espejo → reescritura → frasco", async ({ page }) => {
  await activateAndConsent(page);

  // CU-05/CU-06: Inicio con el check-in del día.
  await expect(page.getByText("Hola. Hoy es tu día 3 de 28.")).toBeVisible();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await expect(page.getByText("Gracias por contarnos.")).toBeVisible();
  await expectAccessible(page);

  // CU-01: registro en modo libre.
  await page.getByRole("link", { name: "Escribir" }).first().click();
  await expect(page).toHaveURL(/\/diario/);
  await page.getByRole("radio", { name: "Mal", exact: true }).click();
  await page.getByRole("radio", { name: "Libre" }).click();
  await page.getByLabel("Escribe lo que quieras contar").fill(ENTRY);
  await expectAccessible(page);
  await page.getByRole("button", { name: "Enviar" }).click();

  // CU-02/CU-03: el espejo muestra la frase real (aunque el LLM contó mal las posiciones).
  await expect(page).toHaveURL(/\/espejo\/\d+/);
  await expect(page.getByText("Esto es lo que noté en tu voz interna", { exact: false })).toBeVisible();
  await expect(page.getByText("Soy un inútil", { exact: true })).toBeVisible();
  await expect(page.getByText("Aquí te hablaste con dureza por un error.")).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("radio", { name: "Sí", exact: true }).click();

  // CU-04: reescribir la frase.
  await page.getByRole("link", { name: "Reescribir esta frase" }).click();
  await expect(page).toHaveURL(/\/reescritura\/\d+/);
  await page.getByLabel("Tu reescritura").fill("Hoy me costó, pero equivocarme no me hace inútil; puedo repasar con calma.");
  await page.getByRole("button", { name: "Listo" }).click();
  await expect(page.getByText("Se suavizó.", { exact: false })).toBeVisible();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page.getByRole("button", { name: "Guardar en mi frasco" }).click();

  // CU-09: la frase queda en el frasco.
  await page.goto("/progreso/frasco");
  await expect(page.getByText("Hoy me costó, pero equivocarme no me hace inútil", { exact: false })).toBeVisible();
  await expectAccessible(page);
});

test("la bienvenida es solo la primera vez y se repasa desde Ayuda e información", async ({ page }) => {
  const code = await activateAndConsent(page);

  // RN-AC-13: repaso desde Perfil, sin la pregunta inicial.
  await page.goto("/perfil");
  await page.getByRole("link", { name: "¿Qué es Senda? Ver la bienvenida" }).click();
  await expect(page.getByRole("heading", { name: "Qué es Senda" })).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Listo" }).click();
  await expect(page).toHaveURL(/\/perfil$/);

  await page.getByRole("link", { name: "Leer el consentimiento" }).click();
  await expect(page.getByRole("heading", { name: "Consentimiento" })).toBeVisible();
  await expectAccessible(page);

  // Usuario habitual: al volver a iniciar sesión va directo a Inicio, sin bienvenida.
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Código de participante").fill(code);
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/inicio/);
});

test("sin sesión, las pantallas del estudiante llevan al inicio de sesión", async ({ page }) => {
  for (const route of ["/inicio", "/progreso/frasco", "/perfil", "/mensajes"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  }
  await expectAccessible(page);
});

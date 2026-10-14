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

test("con la sesión iniciada, las pantallas de ingreso llevan a Inicio", async ({ page }) => {
  await activateAndConsent(page);

  for (const route of ["/login", "/", "/activar"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/inicio/);
  }
});

test("al vencer la cookie de acceso (30 min), la sesión se renueva sola", async ({ page, context }) => {
  await activateAndConsent(page);
  const accessCookie = (await context.cookies()).find((c) => c.name === "senda_access_token");
  expect(accessCookie).toBeDefined();

  // Simula los 30 minutos: queda solo la cookie de renovación (7 días).
  await context.clearCookies({ name: "senda_access_token" });
  await page.goto("/inicio");

  await expect(page.getByText("Hola. Hoy es tu día 3 de 28.")).toBeVisible();
  expect((await context.cookies()).some((c) => c.name === "senda_access_token")).toBe(true);
});

test("el modo oscuro se elige en Perfil, se mantiene y es accesible", async ({ page }) => {
  await activateAndConsent(page);

  await page.goto("/perfil");
  await page.getByRole("radio", { name: "Oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expectAccessible(page);

  // Se guarda en el dispositivo: sigue oscuro al navegar y recargar.
  await page.goto("/inicio");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expectAccessible(page);
  await page.goto("/diario");
  await expectAccessible(page);

  await page.goto("/perfil");
  await page.getByRole("radio", { name: "Claro" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("en escritorio la navegación es una barra lateral accesible", async ({ page }) => {
  await activateAndConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/inicio");

  const sidebar = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(sidebar).toHaveCount(1); // la barra inferior queda oculta en escritorio
  await expect(page.getByText("Tu senda")).toBeVisible();
  await expect(page.getByText("Día 3 de 28", { exact: true })).toBeVisible();
  await sidebar.getByRole("link", { name: "Historial" }).click();
  await expect(page).toHaveURL(/\/historial/);
  await expect(sidebar.getByRole("link", { name: "Historial" })).toHaveAttribute("aria-current", "page");
  await expectAccessible(page);
  await page.goto("/inicio");
  await expectAccessible(page);
});

test("en tablet la barra lateral es un riel de iconos con nombres accesibles", async ({ page }) => {
  await activateAndConsent(page);
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto("/inicio");

  const rail = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(rail).toHaveCount(1); // sin barra inferior en tablet
  // Los textos no se ven, pero cada ícono conserva su nombre (lector de pantalla y tooltip).
  const journeyTitle = await page.getByText("Tu senda").boundingBox();
  expect(journeyTitle?.width ?? 0).toBeLessThanOrEqual(1); // solo para lectores de pantalla
  await expect(rail.getByRole("link", { name: "Historial" })).toHaveAttribute("title", "Historial");
  await rail.getByRole("link", { name: "Progreso" }).click();
  await expect(page).toHaveURL(/\/progreso/);
  await expectAccessible(page);
});

test("los mensajes para ti se abren desde la campana: pantalla completa en móvil, panel en escritorio", async ({ page }) => {
  await activateAndConsent(page);

  // Móvil: la bandeja ocupa toda la pantalla, sobre el vidrio del dock.
  await page.getByRole("button", { name: "Mensajes para ti" }).click();
  const sheet = page.getByRole("dialog", { name: "Mensajes para ti" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveClass(/glass/);
  await expect(sheet.getByText("Aún no tienes mensajes.")).toBeVisible();
  const box = await sheet.boundingBox();
  expect(box?.width).toBe(360);
  // axe mide colores reales: se espera a que termine la animación de entrada.
  await sheet.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  await expectAccessible(page);
  await sheet.getByRole("button", { name: "Cerrar mensajes" }).click();
  await expect(sheet).toBeHidden();

  // Escritorio: panel flotante junto a la campana, con acceso a la bandeja completa.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Mensajes para ti" }).click();
  await page.getByRole("link", { name: "Ver todos los mensajes" }).click();
  await expect(page).toHaveURL(/\/mensajes/);
});

test("la barra de vidrio se ajusta desde Perfil y se recuerda", async ({ page }) => {
  await activateAndConsent(page);
  await page.goto("/perfil");

  await page.getByLabel("Opacidad").fill("90");
  await page.getByLabel("Línea de luz en el borde").uncheck();

  const bar = page.getByRole("navigation", { name: "Navegación principal" }).locator(".glass");
  await expect(bar).toHaveAttribute("data-sheen", "false");
  await expect(bar).toHaveAttribute("style", /--glass-alpha: 90%/);
  await page.reload();
  await expect(bar).toHaveAttribute("style", /--glass-alpha: 90%/);
  await expect(page.getByLabel("Desenfoque")).toHaveCount(0);
  await expectAccessible(page);
});

test("el diario guarda un borrador y lo recupera; al cerrar sesión se borra (RS-DI-03)", async ({ page }) => {
  await activateAndConsent(page);
  await page.goto("/diario");
  await page.getByRole("radio", { name: "Libre" }).click();
  await page.getByLabel("Escribe lo que quieras contar").fill("Un texto que todavía no envío");

  // El borrador se guarda cada 10 s en este dispositivo.
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("senda:journal-draft")), { timeout: 15_000 })
    .toContain("Un texto que todavía no envío");
  await page.reload();
  await expect(page.getByText("Recuperamos lo que estabas escribiendo.")).toBeVisible();
  await expect(page.getByLabel("Escribe lo que quieras contar")).toHaveValue("Un texto que todavía no envío");

  // Privacidad: al cerrar sesión no queda texto en el navegador.
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => window.localStorage.getItem("senda:journal-draft"))).toBeNull();
});

test("sin sesión, las pantallas del estudiante llevan al inicio de sesión", async ({ page }) => {
  for (const route of ["/inicio", "/progreso/frasco", "/perfil", "/mensajes"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  }
  await expectAccessible(page);
});

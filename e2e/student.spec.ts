import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedPendingParticipant, seedSentMessage } from "./db";

const PASSWORD = "Compasion1";
const ENTRY =
  "Hoy en la práctica de cálculo me equivoqué en casi todos los ejercicios. Soy un inútil. " +
  "Me fui a casa pensando que no sirvo para esta carrera.";

/** WCAG 2.1 AA (RS-TR): sin violaciones de axe en la pantalla actual. */
const NAME = "Lucía";
const GREETING = `Hola, ${NAME}, ¿cómo estás hoy?`;

async function expectAccessible(page: Page) {
  // axe mide colores reales: espera a que terminen las animaciones finitas (toasts, drawers, temas).
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const details = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id}: ${n.target.join(" ")} — ${n.failureSummary?.split("\n").slice(1).join(" ")}`),
  );
  expect(details).toEqual([]);
}

// El tutorial se abre solo la primera vez en Inicio: los demás flujos lo dan por visto.
let skipTour = true;
test.beforeEach(async ({ context }, testInfo) => {
  skipTour = !testInfo.tags.includes("@tutorial");
  if (skipTour) {
    await context.addInitScript(() => window.localStorage.setItem("senda:tour-seen", "1"));
  }
});

/** El usuario de cada participante de prueba: su código sin guiones, en minúsculas (único y con formato válido). */
function usernameFor(code: string): string {
  return code.toLowerCase().replaceAll("-", "");
}

async function activateAndConsent(page: Page): Promise<string> {
  const code = seedPendingParticipant();

  // CU-15: activar la cuenta con el código (solo esta vez). Sin Google real en E2E, por el camino del usuario y la
  // contraseña (si el build tiene Google configurado, la pantalla abre con Google y hay que elegir el otro camino).
  await page.goto("/activar");
  await page.getByLabel("Código de participante").fill(code);
  const withPassword = page.getByRole("button", { name: "Prefiero crear un usuario y una contraseña" });
  if (await withPassword.isVisible()) {
    await withPassword.click();
  }
  await page.getByLabel("Usuario").fill(usernameFor(code));
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Repite tu contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Activar cuenta" }).click();
  await expect(page.getByTestId("recovery-code")).toBeVisible();
  await page.getByRole("button", { name: "Ya lo guardé" }).click();

  // CU-16: el consentimiento solo se acepta después de leerlo hasta el final.
  await expect(page).toHaveURL(/\/consentimiento/);
  await page
    .locator("div.overflow-y-auto")
    .first()
    .evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      el.dispatchEvent(new Event("scroll"));
    });
  await page.getByLabel("Leí y acepto").check();
  await page.getByRole("button", { name: "Acepto", exact: true }).click();

  // CU-17: bienvenida a pantalla completa (3 pantallas), punto de partida opcional y, al final, cómo quiere que lo
  // llamen y su sexo (obligatorios).
  await expect(page).toHaveURL(/\/bienvenida/);
  await expect(page.getByRole("heading", { name: "Qué es Senda" })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText(/Línea 113, opción 5/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("¿Qué te gustaría cambiar en cómo te hablas? (opcional)").fill("Dejar de llamarme inútil");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Cuéntanos de ti" })).toBeVisible();
  await page.getByLabel("¿Cómo quieres que te llamemos?").fill(NAME);
  await page.getByRole("radio", { name: "Mujer" }).click();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page).toHaveURL(/\/inicio/);
  // La bienvenida vuelve a abrir el tutorial; los flujos que no lo prueban recargan para darlo por visto.
  if (skipTour) {
    await page.reload();
  }
  return code;
}

test("ciclo diario completo: activar → diario → espejo → reescritura → frasco → jardín", async ({ page }) => {
  await activateAndConsent(page);

  // CU-05/CU-06: Inicio con el check-in del día.
  await expect(page.getByRole("heading", { name: GREETING })).toBeVisible();
  // El día de la senda va en la tarjeta "Tu senda", al pie del calendario.
  await expect(page.getByRole("main").getByText("Día 3 de 28", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await expect(page.getByText("Qué bueno. Si quieres, cuéntale a tu diario qué te hizo bien hoy.")).toBeVisible();
  await expectAccessible(page);
  // Como una app: el texto no se selecciona al hacer clic y arrastrar.
  expect(await page.evaluate(() => getComputedStyle(document.body).userSelect)).toBe("none");

  // CU-01: registro en modo libre.
  // Cambia de cara antes de escribir: el Diario abre con la última elegida.
  await page.getByRole("radio", { name: "Regular", exact: true }).click();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page.getByRole("link", { name: "Escribir" }).first().click();
  await expect(page).toHaveURL(/\/diario\?animo=4/);
  await expect(page.getByRole("radio", { name: "Bien", exact: true })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Mal", exact: true }).click();
  await page.getByRole("radio", { name: "Libre" }).click();
  await page.getByLabel("Escribe lo que quieras contar").fill(ENTRY);
  // Donde se escribe, sí (para editar).
  expect(await page.getByLabel("Escribe lo que quieras contar").evaluate((el) => getComputedStyle(el).userSelect)).toBe(
    "text",
  );
  // RN-DI-05: sin contexto no se envía.
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Elige con qué tiene que ver lo que escribiste.")).toBeVisible();
  await page.getByRole("radio", { name: "Estudios" }).click();
  await expectAccessible(page);
  await page.getByRole("button", { name: "Guardar" }).click();

  // CU-02/CU-03: el espejo muestra la frase real (aunque el LLM contó mal las posiciones).
  await expect(page).toHaveURL(/\/historial\/\d+\/espejo$/);
  await expect(page.getByText("Esto es lo que noté en tu voz interna", { exact: false })).toBeVisible();
  await expect(page.getByText("Soy un inútil", { exact: true })).toBeVisible();
  await expect(page.getByText("Aquí te hablaste con dureza por un error.")).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("radio", { name: "Sí", exact: true }).click();

  // CU-04: reescribir la frase.
  await page.getByRole("link", { name: "Reescribir esta frase" }).click();
  await expect(page).toHaveURL(/\/historial\/\d+\/reescribir\?frase=\d+$/);
  await page
    .getByLabel("Tu reescritura")
    .fill("Hoy me costó, pero equivocarme no me hace inútil; puedo repasar con calma.");
  await page.getByRole("button", { name: "Listo" }).click();
  await expect(page.getByText("Se suavizó.", { exact: false })).toBeVisible();
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page.getByRole("button", { name: "Guardar en mi frasco" }).click();

  // CU-09: la frase queda en el frasco.
  await page.goto("/progreso/frasco");
  await expect(page.getByText("Hoy me costó, pero equivocarme no me hace inútil", { exact: false })).toBeVisible();
  await expectAccessible(page);

  // CU-07: el registro riega todo el jardín y la reescritura de D1 hace brotar Raíces.
  await page.getByRole("tab", { name: "Jardín" }).click();
  await expect(page.getByRole("heading", { name: "Mi jardín" })).toBeVisible();
  await expect(page.getByText("Lo regaste con")).toBeVisible();
  await expect(page.getByText(/Brote · 1 brote/)).toBeVisible();
  await expectAccessible(page);
});

test("la bienvenida es solo la primera vez y se repasa desde Ayuda e información", async ({ page }) => {
  const code = await activateAndConsent(page);

  // RN-AC-13: repaso desde Perfil, sin la pregunta inicial.
  await page.goto("/perfil");
  await page.getByRole("link", { name: "¿Qué es Senda? Ver la bienvenida" }).click();
  await expect(page.getByRole("heading", { name: "Qué es Senda" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Listo" }).click();
  await expect(page).toHaveURL(/\/perfil$/);

  await page.getByRole("link", { name: "Leer el consentimiento" }).click();
  await expect(page.getByRole("heading", { name: "Consentimiento" })).toBeVisible();
  await expectAccessible(page);

  // Usuario habitual: al volver a iniciar sesión va directo a Inicio, sin bienvenida.
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
  // CU-18: con el usuario, sin el código.
  await page.getByLabel("Usuario").fill(usernameFor(code));
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/inicio/);
});

test(
  "el tutorial se abre la primera vez en Inicio, avanza, retrocede y se repite desde Perfil",
  { tag: "@tutorial" },
  async ({ page }) => {
    await activateAndConsent(page);

    const tour = page.getByRole("dialog");
    await expect(tour.getByRole("heading", { name: "¡Hola! Te acompañamos en tu senda" })).toBeVisible();
    await expectAccessible(page);

    // Cada paso ilumina la pestaña de la que habla (en móvil, la del dock).
    await tour.getByRole("button", { name: "Siguiente" }).click();
    await expect(tour.getByRole("heading", { name: "1. Empieza en Inicio" })).toBeVisible();
    await expectAccessible(page);
    await tour.getByRole("button", { name: "Atrás" }).click();
    await expect(tour.getByRole("heading", { name: "¡Hola! Te acompañamos en tu senda" })).toBeVisible();

    for (let i = 0; i < 9; i++) {
      await tour.getByRole("button", { name: "Siguiente" }).click();
    }
    await expect(tour.getByRole("heading", { name: "¡Listo para empezar!" })).toBeVisible();
    await tour.getByRole("button", { name: "¡Empezar!" }).click();
    await expect(tour).toBeHidden();

    // Ya visto: no vuelve a abrirse solo.
    await page.reload();
    await expect(page.getByRole("heading", { name: GREETING })).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(page.getByRole("dialog")).toBeHidden();

    // Se repite desde Perfil y se puede omitir.
    await page.goto("/perfil");
    await page.getByRole("button", { name: "Ver el tutorial" }).click();
    await expect(tour.getByRole("heading", { name: "¡Hola! Te acompañamos en tu senda" })).toBeVisible();
    await tour.getByRole("button", { name: "Omitir" }).click();
    await expect(tour).toBeHidden();
  },
);

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

  await expect(page.getByRole("heading", { name: GREETING })).toBeVisible();
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
  // "Tu senda" también titula la tarjeta al pie del calendario: aquí, el de la barra lateral.
  const sidebarPanel = page.locator("aside:not([data-right-rail])");
  await expect(sidebarPanel.getByText("Tu senda", { exact: true })).toBeVisible();
  await expect(sidebarPanel.getByText("Día 3 de 28", { exact: true })).toBeVisible();
  await sidebar.getByRole("link", { name: "Historial" }).click();
  await expect(page).toHaveURL(/\/historial/);
  await expect(sidebar.getByRole("link", { name: "Historial" })).toHaveAttribute("aria-current", "page");
  await expectAccessible(page);
  await page.goto("/inicio");
  await expectAccessible(page);
});

test("en escritorio, la cara elegida en Inicio llega al Diario por cualquier Escribir, aun con un borrador", async ({
  page,
}) => {
  await activateAndConsent(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  // Un borrador del Diario con otra cara.
  await page.goto("/diario");
  await page.getByRole("radio", { name: "Bien", exact: true }).click();
  await page.getByLabel("¿Qué pasó?").fill("Empecé a escribir algo y lo dejé");
  await page.waitForTimeout(800);

  // En Inicio elige otra cara y entra por el Escribir de la barra lateral.
  await page.goto("/inicio");
  await page.getByRole("radio", { name: "Muy mal", exact: true }).click();
  await page.locator("aside:not([data-right-rail])").getByRole("link", { name: "Escribir" }).click();
  await expect(page).toHaveURL(/\/diario/);
  await expect(page.getByRole("radio", { name: "Muy mal", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByLabel("¿Qué pasó?")).toHaveValue("Empecé a escribir algo y lo dejé");
});

test("Senda se puede instalar como app, con su nombre, su ícono y abriendo en Inicio (PWA)", async ({ page }) => {
  const response = await page.request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({ name: "Senda", start_url: "/inicio", display: "standalone" });
  for (const icon of manifest.icons as { src: string }[]) {
    expect((await page.request.get(icon.src)).ok()).toBe(true);
  }

  // Chrome confirma que es instalable (sin errores de instalabilidad).
  await page.goto("/login");
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = (await cdp.send("Page.getInstallabilityErrors")) as {
    installabilityErrors: { errorId: string }[];
  };
  expect(installabilityErrors.map((error) => error.errorId)).toEqual([]);
});

test("Volver sube un nivel: del Espejo al registro y del registro al Historial, sin dar vueltas", async ({ page }) => {
  await activateAndConsent(page);
  await page.goto("/diario");
  await page.getByRole("radio", { name: "Mal", exact: true }).click();
  await page.getByRole("radio", { name: "Libre" }).click();
  await page.getByLabel("Escribe lo que quieras contar").fill(ENTRY);
  await page.getByRole("radio", { name: "Estudios" }).click();
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/historial\/\d+\/espejo$/);

  await page.getByRole("link", { name: "Volver" }).click();
  await expect(page).toHaveURL(/\/historial\/\d+$/);
  await page.getByRole("link", { name: "Ver el espejo" }).click();
  await expect(page).toHaveURL(/\/espejo$/);
  await page.getByRole("link", { name: "Volver" }).click();
  await expect(page).toHaveURL(/\/historial\/\d+$/);
  // Del registro, al Historial (no de vuelta al Espejo).
  await page.getByRole("link", { name: "Volver" }).click();
  await expect(page).toHaveURL(/\/historial$/);
});

test("en tablet la barra lateral es un riel de iconos con nombres accesibles", async ({ page }) => {
  await activateAndConsent(page);
  await page.setViewportSize({ width: 834, height: 1112 });
  await page.goto("/inicio");

  const rail = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(rail).toHaveCount(1); // sin barra inferior en tablet
  // Los textos no se ven, pero cada ícono conserva su nombre (lector de pantalla y tooltip).
  const journeyTitle = await page
    .locator("aside:not([data-right-rail])")
    .getByText("Tu senda", { exact: true })
    .boundingBox();
  expect(journeyTitle?.width ?? 0).toBeLessThanOrEqual(1); // solo para lectores de pantalla
  await expect(rail.getByRole("link", { name: "Historial" })).toHaveAttribute("title", "Historial");
  await rail.getByRole("link", { name: "Progreso" }).click();
  await expect(page).toHaveURL(/\/progreso/);
  await expectAccessible(page);
});

test("los mensajes para ti se abren en un drawer: desde abajo en móvil, desde la derecha en escritorio", async ({
  page,
}) => {
  await activateAndConsent(page);

  // Móvil: la bandeja sube desde abajo y flota, sobre el vidrio del dock.
  await page.getByRole("button", { name: "Mensajes para ti" }).click();
  const drawer = page.getByRole("dialog", { name: "Mensajes para ti" });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveClass(/glass/);
  await expect(drawer).toHaveAttribute("data-vaul-drawer-direction", "bottom");
  await expect(drawer.getByText("Aún no tienes mensajes.")).toBeVisible();
  await expectAccessible(page);
  await drawer.getByRole("button", { name: "Cerrar mensajes" }).click();
  await expect(drawer).toBeHidden();

  // Escritorio: la misma bandeja entra desde la derecha, flotando a 12 px del borde.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Mensajes para ti" }).click();
  await expect(drawer).toHaveAttribute("data-vaul-drawer-direction", "right");
  await drawer.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const box = await drawer.boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeCloseTo(1440 - 12, 0);
});

test("un mensaje nuevo se avisa con un toast una sola vez; su acción lleva a la pantalla y cierra la bandeja", async ({
  page,
}) => {
  const code = await activateAndConsent(page);
  seedSentMessage(code);
  await page.reload();

  const toast = page.locator("[data-sonner-toast]").filter({ hasText: "Tu diario te espera cuando tengas 5 minutos." });
  await expect(toast).toBeVisible();
  await expect(page.getByRole("button", { name: "Mensajes para ti, 1 nuevo" })).toBeVisible();
  await toast.getByRole("button", { name: "Ver" }).click();
  const drawer = page.getByRole("dialog", { name: "Mensajes para ti" });
  await expect(drawer.getByText("Tu diario te espera cuando tengas 5 minutos.")).toBeVisible();

  // Ya avisado: al volver no se repite.
  await page.reload();
  await expect(page.getByRole("button", { name: "Mensajes para ti, 1 nuevo" })).toBeVisible();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);

  // Su acción lleva al Diario, cierra la bandeja y cuenta como abrir el mensaje.
  await page.getByRole("button", { name: "Mensajes para ti, 1 nuevo" }).click();
  await drawer.getByRole("link", { name: "Escribir" }).click();
  await expect(page).toHaveURL(/\/diario/);
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("button", { name: "Mensajes para ti", exact: true })).toBeVisible();
});

test("las notificaciones por correo muestran a qué correo llegan, enmascarado, y se puede cambiar", async ({
  page,
}) => {
  await activateAndConsent(page);
  await page.goto("/perfil");

  const card = page.getByRole("region", { name: "Notificaciones por correo" });
  await card.getByLabel("Tu correo").fill("estudiante@correo.pe");
  await card.getByRole("button", { name: "Activar notificaciones" }).click();
  // El servidor lo devuelve enmascarado: el correo completo nunca llega al navegador.
  await expect(card.getByText("es***@correo.pe")).toBeVisible();
  await expect(page.getByText("estudiante@correo.pe")).toHaveCount(0);
  await expectAccessible(page);

  await card.getByRole("button", { name: "Cambiar correo" }).click();
  await card.getByLabel("Tu correo").fill("otro@senda.pe");
  await card.getByRole("button", { name: "Guardar correo" }).click();
  await expect(card.getByText("ot***@senda.pe")).toBeVisible();

  await card.getByRole("button", { name: "Desactivar y borrar mi correo" }).click();
  await expect(card.getByRole("button", { name: "Activar notificaciones" })).toBeVisible();
});

test("el vidrio de la app se ajusta desde Perfil y se recuerda", async ({ page }) => {
  await activateAndConsent(page);
  await page.goto("/perfil");

  await page.getByLabel("Opacidad").fill("90");
  await page.getByLabel("Línea de luz en el borde").uncheck();

  const bar = page.getByRole("navigation", { name: "Navegación principal" }).locator(".glass");
  await expect(bar).toHaveAttribute("data-sheen", "false");
  // Un solo vidrio para toda la app: la opacidad se aplica en <html> y la leen todas las superficies de vidrio.
  const html = page.locator("html");
  await expect(html).toHaveAttribute("style", /--glass-alpha: 90%/);
  await page.reload();
  await expect(html).toHaveAttribute("style", /--glass-alpha: 90%/);
  await expect(page.getByLabel("Desenfoque")).toHaveCount(0);

  // Las barras de desplazamiento: ocultas por defecto; se activan aquí y se recuerda.
  const scrollbarWidth = () => page.evaluate(() => getComputedStyle(document.body).scrollbarWidth);
  expect(await scrollbarWidth()).toBe("none");
  await page.getByLabel("Mostrar las barras de desplazamiento").check();
  await expect(html).toHaveClass(/show-scrollbars/);
  expect(await scrollbarWidth()).not.toBe("none");
  await page.reload();
  await expect(html).toHaveClass(/show-scrollbars/);
  await expectAccessible(page);
});

test("el diario guarda un borrador y lo recupera; al cerrar sesión se borra (RS-DI-03)", async ({ page }) => {
  await activateAndConsent(page);
  await page.goto("/diario");
  await page.getByRole("radio", { name: "Libre" }).click();
  await page.getByLabel("Escribe lo que quieras contar").fill("Un texto que todavía no envío");

  // El borrador se guarda en este dispositivo al dejar de escribir (no hay que esperar los 10 s).
  await expect(page.getByRole("img", { name: "Borrador guardado" })).toBeVisible({ timeout: 3_000 });
  expect(await page.evaluate(() => window.localStorage.getItem("senda:journal-draft"))).toContain(
    "Un texto que todavía no envío",
  );
  await page.reload();
  await expect(page.getByText("Recuperamos tu borrador.")).toBeVisible();
  // Al moverse entre pestañas (sin recargar) el borrador vuelve en silencio: el aviso es solo al entrar.
  await expect(page.getByText("Recuperamos tu borrador.")).toBeHidden({ timeout: 8_000 });
  await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Inicio" }).click();
  await expect(page).toHaveURL(/\/inicio/);
  await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Diario" }).click();
  await expect(page.getByLabel("Escribe lo que quieras contar")).toHaveValue("Un texto que todavía no envío");
  await page.waitForTimeout(800);
  await expect(page.getByText("Recuperamos tu borrador.")).toHaveCount(0);
  await expect(page.getByLabel("Escribe lo que quieras contar")).toHaveValue("Un texto que todavía no envío");

  // Si se sale de golpe (cerrar la pestaña, cambiar de app) sin esperar, también se guarda.
  await page.getByLabel("Escribe lo que quieras contar").fill("Escribí esto y cerré enseguida");
  await page.goto("/inicio");
  await page.goto("/diario");
  await expect(page.getByLabel("Escribe lo que quieras contar")).toHaveValue("Escribí esto y cerré enseguida");

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

test("el nombre sale en el saludo y con Hombre la app usa el tema azul; se cambia desde Perfil (CU-17, CU-20)", async ({
  page,
}) => {
  await activateAndConsent(page);
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-palette");

  await page.goto("/perfil");
  await page.getByLabel("¿Cómo quieres que te llamemos?").fill("Mario");
  await page.getByRole("radio", { name: "Hombre" }).click();
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Listo, guardamos tus cambios.")).toBeVisible();
  await expect(html).toHaveAttribute("data-palette", "ocean");

  // Al recargar se pinta desde el servidor, sin pasar por el rosado.
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Hola, Mario, ¿cómo estás hoy?" })).toBeVisible();
  await expect(html).toHaveAttribute("data-palette", "ocean");
  await expectAccessible(page);

  await page.goto("/perfil");
  await page.getByRole("radio", { name: "Otro" }).click();
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(html).not.toHaveAttribute("data-palette");
});

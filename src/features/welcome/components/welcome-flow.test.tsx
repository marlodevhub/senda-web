import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "@/testing/test-utils";
import { WelcomeFlow } from "@/features/welcome/components/welcome-flow";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, prefetch: vi.fn() }) }));

describe("WelcomeFlow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("muestra las 3 pantallas, con Línea 113 y SAMU 106 en 'Qué no es' (RN-AC-09)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    expect(screen.getByRole("heading", { name: "Qué es Senda" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Qué no es" })).toBeInTheDocument();
    expect(screen.getByText(/Línea 113, opción 5/)).toBeInTheDocument();
    expect(screen.getByText(/SAMU 106/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Cómo se usa" })).toBeInTheDocument();
  });

  it("deja omitir el punto de partida y al empezar lleva a Inicio (CU-17 4a)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole("button", { name: "Continuar" }));
    }
    await user.click(screen.getByRole("button", { name: "Empezar" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/welcome/completion",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ startingPoint: null }) }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/inicio"), { timeout: 4000 });
  });

  it("la primera vez pide al final nombre y sexo, aplica el tema y los envía al empezar (CU-17)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow identityRequired />);

    expect(screen.getByRole("heading", { name: "Qué es Senda" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Saltar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Cuéntanos de ti" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Saltar" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Empezar" }));
    expect(screen.getByText("Escribe cómo quieres que te llamemos.")).toBeInTheDocument();
    expect(screen.getByText("Elige una opción.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("¿Cómo quieres que te llamemos?"), "Mario");
    await user.click(screen.getByRole("radio", { name: "Hombre" }));
    await user.click(screen.getByRole("button", { name: "Empezar" }));

    expect(document.documentElement.dataset.palette).toBe("ocean");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/welcome/completion",
      expect.objectContaining({
        body: JSON.stringify({ startingPoint: null, preferredName: "Mario", gender: "MALE" }),
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/inicio"), { timeout: 4000 });
    delete document.documentElement.dataset.palette;
  });

  it("al terminar vuelve a abrir el tutorial en Inicio aunque este navegador ya lo mostró", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    window.localStorage.setItem("senda:tour-seen", "1");
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    await user.click(screen.getByRole("button", { name: "Saltar" }));
    await user.click(screen.getByRole("button", { name: "Empezar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/inicio"), { timeout: 4000 });
    expect(window.localStorage.getItem("senda:tour-seen")).toBeNull();
  });

  it("deja saltar las pantallas directo a la pregunta opcional", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    await user.click(screen.getByRole("button", { name: "Saltar" }));

    expect(screen.getByLabelText("¿Qué te gustaría cambiar en cómo te hablas? (opcional)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Saltar" })).not.toBeInTheDocument();
  });

  it("en escritorio pone el texto y Continuar a la izquierda y la ilustración toma el color de cada pantalla", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("min-width: 1024px"),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          onchange: null,
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    const user = userEvent.setup();
    const { container } = renderWithProviders(<WelcomeFlow />);

    expect(screen.getByRole("heading", { name: "Qué es Senda" })).toBeInTheDocument();
    const accent = () =>
      (container.querySelector("svg[style*='--illu-accent']") as SVGElement).style.getPropertyValue("--illu-accent");
    expect(accent()).toBe("#3E9B5B");

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Qué no es" })).toBeInTheDocument();
    expect(accent()).toBe("#E07A3E");
  });

  it("al empezar presenta el recorrido por la app antes de entrar a Inicio", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    await user.click(screen.getByRole("button", { name: "Saltar" }));
    await user.click(screen.getByRole("button", { name: "Empezar" }));

    expect(await screen.findByRole("heading", { name: "Ahora, un recorrido por tu app" })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/inicio"), { timeout: 4000 });
  });

  it("en modo repaso muestra solo las 3 pantallas y vuelve al perfil sin guardar (RN-AC-13)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow mode="review" />);

    expect(screen.queryByRole("button", { name: "Saltar" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Cómo se usa" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Listo" }));

    expect(push).toHaveBeenCalledWith("/perfil");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

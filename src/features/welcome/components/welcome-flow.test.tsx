import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { WelcomeFlow } from "@/features/welcome/components/welcome-flow";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("WelcomeFlow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("muestra las 3 pantallas, con Línea 113 y SAMU 106 en 'Qué no es' (RN-AC-09)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    expect(screen.getByRole("heading", { name: "Qué es Senda" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("heading", { name: "Qué no es" })).toBeInTheDocument();
    expect(screen.getByText(/Línea 113, opción 5/)).toBeInTheDocument();
    expect(screen.getByText(/SAMU 106/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("heading", { name: "Cómo se usa" })).toBeInTheDocument();
  });

  it("deja omitir el punto de partida y al empezar lleva a Inicio (CU-17 4a)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<WelcomeFlow />);

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole("button", { name: "Siguiente" }));
    }
    await user.click(screen.getByRole("button", { name: "Empezar" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/welcome/completion",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ startingPoint: null }) }),
    );
    expect(push).toHaveBeenCalledWith("/inicio");
  });
});

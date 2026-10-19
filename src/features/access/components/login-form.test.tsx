import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { LoginForm } from "@/features/access/components/login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("LoginForm (CU-18)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("con la contraseña correcta muestra la pantalla de carga hasta abrir Inicio (no vuelve al formulario)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ destination: "HOME" }), { status: 200 }),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Usuario"), "lucia.rojas");
    await user.type(screen.getByLabelText("Contraseña"), "Compasion1");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Entrando…");
    expect(push).toHaveBeenCalledWith("/inicio");
  });

  it("con la contraseña incorrecta no muestra la pantalla de carga", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "INVALID_CREDENTIALS", message: "x" }), { status: 401 }),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Usuario"), "lucia.rojas");
    await user.type(screen.getByLabelText("Contraseña"), "otra-clave");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await screen.findByText("Usuario o contraseña incorrectos.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

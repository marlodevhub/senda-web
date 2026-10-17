import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { AccountForm } from "@/features/profile/components/account-form";

describe("AccountForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el usuario con el que entra y lo cambia (CU-20)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<AccountForm username="lucia.r" googleLinked={false} />);

    expect(screen.getByText("lucia.r")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cambiar usuario" }));
    const input = screen.getByLabelText("Usuario");
    await user.clear(input);
    await user.type(input, "Lucia.Rojas");
    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/profile/username",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ username: "lucia.rojas" }) }),
    );
  });

  it("no deja guardar un usuario con un formato inválido, como un código de participante", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderWithProviders(<AccountForm username={null} googleLinked={false} />);

    expect(screen.getByText(/Todavía entras con tu código de participante/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));
    await user.type(screen.getByLabelText("Usuario"), "C1-7KQ4-9");
    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(await screen.findByText(/Tu usuario necesita de 3 a 30/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("al dejar de escribir avisa si el usuario está libre (check) u ocupado (X roja)", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const taken = String(input).includes("username=mario");
      return new Response(JSON.stringify({ status: taken ? "TAKEN" : "AVAILABLE" }), { status: 200 });
    });
    const user = userEvent.setup();
    renderWithProviders(<AccountForm username="lucia.r" googleLinked={false} />);

    await user.click(screen.getByRole("button", { name: "Cambiar usuario" }));
    const input = screen.getByLabelText("Usuario");
    await user.clear(input);
    await user.type(input, "Lucia.Nueva");
    expect(await screen.findByText("¡Ese nombre de usuario está libre!", {}, { timeout: 2000 })).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "mario");
    expect(
      await screen.findByText("Ese usuario ya está en uso. Prueba con otro.", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("no consulta el usuario actual", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderWithProviders(<AccountForm username="lucia.r" googleLinked={false} />);

    await user.click(screen.getByRole("button", { name: "Cambiar usuario" }));
    await new Promise((resolve) => setTimeout(resolve, 700));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sin el client ID de Google configurado no ofrece vincular Google", () => {
    renderWithProviders(<AccountForm username="lucia.r" googleLinked={false} />);

    expect(screen.queryByText("Ingresar con Google")).not.toBeInTheDocument();
  });
});

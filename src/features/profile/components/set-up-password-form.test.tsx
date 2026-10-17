import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { SetUpPasswordForm } from "@/features/profile/components/set-up-password-form";

describe("SetUpPasswordForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("pide crear antes el usuario (CU-20)", () => {
    renderWithProviders(<SetUpPasswordForm hasUsername={false} />);

    expect(screen.getByText(/Primero crea tu usuario/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });

  it("crea la primera contraseña y muestra el código de recuperación una sola vez", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response(JSON.stringify({ recoveryCode: "K7QM4XPA" }), { status: 201 }));
    const user = userEvent.setup();
    renderWithProviders(<SetUpPasswordForm hasUsername />);

    await user.type(screen.getByLabelText("Contraseña"), "Compasion1");
    await user.type(screen.getByLabelText("Repite tu contraseña"), "Compasion1");
    await user.click(screen.getByRole("button", { name: "Crear contraseña" }));

    expect(await screen.findByTestId("recovery-code")).toHaveTextContent("K7QM4XPA");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/profile/password-setup");
    expect(JSON.parse(String(init?.body))).toEqual({ newPassword: "Compasion1" });
  });

  it("no envía si las contraseñas no coinciden", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderWithProviders(<SetUpPasswordForm hasUsername />);

    await user.type(screen.getByLabelText("Contraseña"), "Compasion1");
    await user.type(screen.getByLabelText("Repite tu contraseña"), "Compasion2");
    await user.click(screen.getByRole("button", { name: "Crear contraseña" }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { InstallApp } from "@/components/pwa/install-app";

function stubDisplayMode(standalone: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: standalone && query.includes("standalone"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

describe("InstallApp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("si el navegador ofrece instalar, el botón abre su ventana de instalación", async () => {
    stubDisplayMode(false);
    const user = userEvent.setup();
    renderWithProviders(<InstallApp />);
    expect(screen.queryByRole("button", { name: "Instalar Senda" })).not.toBeInTheDocument();

    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);

    await user.click(screen.getByRole("button", { name: "Instalar Senda" }));
    expect(prompt).toHaveBeenCalled();
    // Instalada: el botón ya no aparece.
    expect(screen.queryByRole("button", { name: "Instalar Senda" })).not.toBeInTheDocument();
  });

  it("en iPhone explica cómo instalarla desde Safari", async () => {
    stubDisplayMode(false);
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1",
    );
    const user = userEvent.setup();
    renderWithProviders(<InstallApp intro />);

    expect(screen.getByRole("heading", { name: "Instala Senda" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Instalar Senda" }));
    expect(screen.getByText(/Añadir a pantalla de inicio/)).toBeInTheDocument();
  });

  it("si ya se abre como app instalada, no ofrece instalarla", () => {
    stubDisplayMode(true);
    renderWithProviders(<InstallApp intro />);

    expect(screen.queryByRole("button", { name: "Instalar Senda" })).not.toBeInTheDocument();
    expect(screen.queryByText("Instala Senda")).not.toBeInTheDocument();
  });
});

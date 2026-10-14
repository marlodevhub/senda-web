import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { JarView } from "@/features/progress/components/jar-view";
import type { JarCard } from "@/features/progress/api/jar";

const CARD: JarCard = {
  rewriteId: 7,
  text: "Me equivoqué, y con eso basta.",
  originalPhrase: "Soy un inútil",
  dimension: "D1",
  date: "2026-10-14",
  favorite: false,
};

describe("JarView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra `frasco.vacio` cuando no hay frases (CU-09 1a)", () => {
    renderWithProviders(<JarView cards={[]} />);

    expect(screen.getByText(/Tu frasco está vacío/)).toBeInTheDocument();
  });

  it("muestra la frase y, al desplegar, de dónde salió", async () => {
    const user = userEvent.setup();
    renderWithProviders(<JarView cards={[CARD]} />);

    expect(screen.getByText("Me equivoqué, y con eso basta.")).toBeInTheDocument();
    await user.click(screen.getByText("Ver de dónde salió"));
    expect(screen.getByText("Soy un inútil")).toBeVisible();
  });

  it("marca como favorita con PATCH /jar/{id}", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<JarView cards={[CARD]} />);

    await user.click(screen.getByRole("button", { name: "Marcar como favorita" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/jar/7",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ favorite: true }) }),
    );
  });

  it("pide confirmar antes de quitar una frase (CU-09 3a)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    renderWithProviders(<JarView cards={[CARD]} />);

    await user.click(screen.getByRole("button", { name: "Quitar del frasco" }));
    expect(screen.getByText("¿Quitar esta frase del frasco? Seguirá en tu historial.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    const buttons = screen.getAllByRole("button", { name: "Quitar del frasco" });
    await user.click(buttons[buttons.length - 1]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/jar/7",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ inJar: false }) }),
    );
  });
});

import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { PhraseSceneCard } from "@/components/feedback/phrase-scene-card";

describe("PhraseSceneCard", () => {
  it("toda la tarjeta se toca para darla vuelta; atrás muestra la frase y Reescribir, y el foco pasa a Ocultar", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PhraseSceneCard
        fragment="Soy un inútil"
        title="Etiqueta dura"
        pattern="self_disqualification"
        href="/historial/7/reescribir"
        linkLabel="Reescribir: “Soy un inútil”"
      />,
    );

    // De frente: el título y "Ver"; la frase y "Reescribir" están atrás, fuera de alcance.
    const front = screen.getByRole("button", { name: "Ver la frase: Etiqueta dura" });
    expect(front).toHaveTextContent("Etiqueta dura");
    expect(screen.getByText("Soy un inútil").closest("[inert]")).not.toBeNull();
    expect(screen.getByText("Reescribir").closest("[inert]")).not.toBeNull();

    await user.click(front);

    expect(screen.getByText("Soy un inútil").closest("[inert]")).toBeNull();
    expect(screen.getByRole("button", { name: "Ocultar la frase: Etiqueta dura" })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Reescribir: “Soy un inútil”" })).toHaveAttribute(
      "href",
      "/historial/7/reescribir",
    );
  });

  it("sin href no tiene Reescribir", () => {
    renderWithProviders(<PhraseSceneCard fragment="Soy un inútil" title="Etiqueta dura" pattern="self_disqualification" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

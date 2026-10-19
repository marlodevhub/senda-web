import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { PhraseSceneCard } from "@/components/feedback/phrase-scene-card";

describe("PhraseSceneCard", () => {
  it("de frente solo muestra el título; con Ver se da vuelta, muestra la frase y el foco pasa a Ocultar", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PhraseSceneCard
        fragment="Soy un inútil"
        title="Etiqueta dura"
        label="Aquí te hablaste con dureza por un error."
        pattern="self_disqualification"
        href="/historial/7"
        linkLabel="Ver el registro de “Soy un inútil”"
      />,
    );

    expect(screen.getByRole("heading", { name: "Etiqueta dura" })).toBeInTheDocument();
    // La frase está en la cara de atrás, fuera del alcance mientras la tarjeta no se dé vuelta.
    expect(screen.getByText("Soy un inútil").closest("[inert]")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Ver la frase: Etiqueta dura" }));

    expect(screen.getByText("Soy un inútil").closest("[inert]")).toBeNull();
    expect(screen.getByRole("button", { name: "Ocultar la frase: Etiqueta dura" })).toHaveFocus();
    // Una sola flechita, que lleva al registro de esa frase.
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Ver el registro de “Soy un inútil”" })).toHaveAttribute(
      "href",
      "/historial/7",
    );
  });

  it("sin href (móvil) no tiene flechita", () => {
    renderWithProviders(
      <PhraseSceneCard fragment="Soy un inútil" title="Etiqueta dura" label="…" pattern="self_disqualification" />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { MoodTodayCard } from "@/features/home/components/mood-today-card";

describe("MoodTodayCard (RN-IN-08)", () => {
  it("muestra el ánimo de hoy en el color sólido de esa carita", () => {
    renderWithProviders(<MoodTodayCard mood={4} />);

    const card = screen.getByRole("region", { name: "Así va tu día" });
    expect(card).toHaveTextContent("Bien");
    expect(card).toHaveTextContent("Es el promedio de las caritas que marcaste hoy.");
    expect(card).toHaveStyle({ backgroundColor: "#9fd27a" });
  });

  it("sin ánimo de hoy invita sin reproche y no nombra ningún ánimo", () => {
    renderWithProviders(<MoodTodayCard mood={null} />);

    const card = screen.getByRole("region", { name: "Así va tu día" });
    expect(card).toHaveTextContent("Aún no marcas cómo estás hoy.");
    expect(card).not.toHaveTextContent("Bien");
  });
});

import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { MoodTodayCard } from "@/features/home/components/mood-today-card";

describe("MoodTodayCard (RN-IN-08)", () => {
  it("muestra el ánimo de hoy en un degradado del color de esa carita", () => {
    renderWithProviders(<MoodTodayCard average={4} />);

    const card = screen.getByRole("region", { name: "Así va tu día" });
    expect(card).toHaveTextContent("Bien");
    expect(card).toHaveTextContent("Es el promedio de los estados de ánimo que marcaste hoy.");
    // De #d4efb4 a #9fd27a (el navegador los guarda en rgb).
    expect(card.style.backgroundImage).toBe(
      "linear-gradient(135deg, rgb(212, 239, 180) 0%, rgb(159, 210, 122) 100%)",
    );
  });

  it("sin ánimo de hoy invita sin reproche y no nombra ningún ánimo", () => {
    renderWithProviders(<MoodTodayCard average={null} />);

    const card = screen.getByRole("region", { name: "Así va tu día" });
    expect(card).toHaveTextContent("Aún no marcas cómo estás hoy.");
    expect(card).not.toHaveTextContent("Bien");
  });

  it("con un promedio entre dos caritas mezcla sus colores y nombra la más cercana", () => {
    renderWithProviders(<MoodTodayCard average={3.5} />);

    const card = screen.getByRole("region", { name: "Así va tu día" });
    // A medio camino entre el amarillo (#f2c95c) y el verde (#9fd27a).
    expect(card.style.backgroundImage).toContain("rgb(201, 206, 107) 100%");
    expect(card).toHaveTextContent("Bien");
  });
});

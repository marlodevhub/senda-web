import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/testing/test-utils";
import { DayPartChart, lightestDayPart } from "@/features/progress/components/charts/day-part-chart";
import type { MoodDayPartPoint } from "@/features/progress/api/get-stats";

const DATA: MoodDayPartPoint[] = [
  { interventionDay: 1, dayPart: "MORNING", averageMood: 2, marks: 2 },
  { interventionDay: 1, dayPart: "NIGHT", averageMood: 4.4, marks: 1 },
  { interventionDay: 3, dayPart: "MORNING", averageMood: 3, marks: 1 },
  { interventionDay: 3, dayPart: "NIGHT", averageMood: 5, marks: 2 },
];

describe("DayPartChart (RN-PR-06, \"Mi día\")", () => {
  it("pone una fila por día, del más reciente, y lee el ánimo de cada franja", () => {
    renderWithProviders(<DayPartChart data={DATA} />);

    const rows = within(screen.getByRole("table", { name: "Mi día" })).getAllByRole("row");
    // Encabezado + días 3, 2 y 1 (el 2, sin ánimo, también aparece).
    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("3");
    expect(within(rows[1]).getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "Sin marcar",
      "Regular",
      "Sin marcar",
      "Muy bien",
    ]);
    expect(within(rows[2]).getAllByRole("cell").every((cell) => cell.textContent === "Sin marcar")).toBe(true);
    // 4,4 se redondea a "Bien".
    expect(within(rows[3]).getAllByRole("cell")[3]).toHaveTextContent("Bien");
  });

  it("nombra la franja más liviana cuando hay datos para comparar", () => {
    renderWithProviders(<DayPartChart data={DATA} />);

    expect(screen.getByText("Tus noches suelen ser tus momentos más livianos.")).toBeInTheDocument();
  });

  it("no nombra ninguna franja con una sola franja, pocos ánimos o un empate", () => {
    expect(lightestDayPart([{ interventionDay: 1, dayPart: "MORNING", averageMood: 4, marks: 3 }])).toBeNull();
    expect(
      lightestDayPart([
        { interventionDay: 1, dayPart: "MORNING", averageMood: 4, marks: 1 },
        { interventionDay: 1, dayPart: "NIGHT", averageMood: 2, marks: 1 },
      ]),
    ).toBeNull();
    expect(
      lightestDayPart([
        { interventionDay: 1, dayPart: "MORNING", averageMood: 3, marks: 2 },
        { interventionDay: 1, dayPart: "NIGHT", averageMood: 3, marks: 2 },
      ]),
    ).toBeNull();
  });
});

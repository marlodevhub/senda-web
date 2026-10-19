import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { MoodPicker } from "./mood-picker";

describe("MoodPicker", () => {
  it("muestra las 5 caras y marca la seleccionada como activa", () => {
    renderWithProviders(<MoodPicker label="¿Cómo te sientes ahora?" value={3} onChange={() => {}} />);

    expect(screen.getByRole("radiogroup", { name: "¿Cómo te sientes ahora?" })).toBeInTheDocument();
    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(5);
    expect(options[2]).toHaveAttribute("aria-checked", "true");
    expect(options[0]).toHaveAttribute("aria-checked", "false");
  });

  it("llama a onChange con el ánimo tocado (RN-DI-03)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<MoodPicker label="¿Cómo te sientes ahora?" value={3} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Muy bien" }));

    expect(onChange).toHaveBeenCalledWith(5);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("no tiene un ánimo activo cuando value es undefined (check-in del día sin responder)", () => {
    renderWithProviders(<MoodPicker label="¿Cómo te sientes ahora?" onChange={() => {}} />);

    const options = screen.getAllByRole("radio");
    options.forEach((opt) => expect(opt).toHaveAttribute("aria-checked", "false"));
  });
});

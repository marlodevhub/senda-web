import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "@/testing/test-utils";
import { ThemeSelector } from "@/features/profile/components/theme-selector";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "system", setTheme }) }));

describe("ThemeSelector", () => {
  it("marca 'Según el sistema' por defecto y cambia a oscuro al tocarlo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSelector />);

    expect(screen.getByRole("radio", { name: "Según el sistema" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "Oscuro" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});

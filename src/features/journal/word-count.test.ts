import { describe, expect, it } from "vitest";
import { countWords } from "@/features/journal/word-count";

describe("countWords", () => {
  it("cuenta palabras separadas por cualquier espacio", () => {
    expect(countWords("  Hoy   me fue\nbien  ")).toBe(4);
  });

  it("da cero sin texto", () => {
    expect(countWords("   ")).toBe(0);
  });
});

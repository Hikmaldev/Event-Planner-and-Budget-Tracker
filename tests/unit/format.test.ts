import { describe, expect, it } from "vitest";
import { formatRupiah } from "@/lib/format";

describe("formatRupiah", () => {
  it("formats full Rupiah amounts with dot separators", () => {
    expect(formatRupiah(40_000_000)).toBe("Rp 40.000.000");
    expect(formatRupiah(38_678_900)).toBe("Rp 38.678.900");
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("rounds fractional amounts to whole Rupiah", () => {
    expect(formatRupiah(1500.5)).toBe("Rp 1.501");
    expect(formatRupiah(1500.4)).toBe("Rp 1.500");
  });

  it("never returns NaN for invalid input", () => {
    expect(formatRupiah(Number.NaN)).toBe("Rp 0");
  });
});

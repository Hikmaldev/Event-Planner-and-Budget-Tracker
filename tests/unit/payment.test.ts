import { describe, expect, it } from "vitest";
import {
  expectedPaymentStatus,
  isPaymentStatusConsistent,
} from "@/lib/domain/payment";

describe("expectedPaymentStatus", () => {
  it("maps zero paid to UNPAID", () => {
    expect(expectedPaymentStatus(40_000_000, 0)).toBe("UNPAID");
    expect(expectedPaymentStatus(0, 0)).toBe("UNPAID");
  });

  it("maps partial payments to DOWN_PAYMENT", () => {
    expect(expectedPaymentStatus(40_000_000, 10)).toBe("DOWN_PAYMENT");
    expect(expectedPaymentStatus(40_000_000, 39_999_999)).toBe(
      "DOWN_PAYMENT"
    );
  });

  it("maps full and over payments to PAID_IN_FULL", () => {
    expect(expectedPaymentStatus(40_000_000, 40_000_000)).toBe(
      "PAID_IN_FULL"
    );
    expect(expectedPaymentStatus(40_000_000, 45_000_000)).toBe(
      "PAID_IN_FULL"
    );
  });

  it("treats a payment without an agreed price as PAID_IN_FULL", () => {
    expect(expectedPaymentStatus(0, 5)).toBe("PAID_IN_FULL");
  });
});

describe("isPaymentStatusConsistent", () => {
  it("accepts matching status/amount pairs", () => {
    expect(isPaymentStatusConsistent(40, 0, "UNPAID")).toBe(true);
    expect(isPaymentStatusConsistent(40, 10, "DOWN_PAYMENT")).toBe(true);
    expect(isPaymentStatusConsistent(40, 40, "PAID_IN_FULL")).toBe(true);
    expect(isPaymentStatusConsistent(0, 0, "UNPAID")).toBe(true);
  });

  it("rejects mismatching status/amount pairs", () => {
    expect(isPaymentStatusConsistent(40, 0, "PAID_IN_FULL")).toBe(false);
    expect(isPaymentStatusConsistent(40, 10, "PAID_IN_FULL")).toBe(false);
    expect(isPaymentStatusConsistent(40, 10, "UNPAID")).toBe(false);
    expect(isPaymentStatusConsistent(40, 40, "DOWN_PAYMENT")).toBe(false);
    expect(isPaymentStatusConsistent(0, 0, "PAID_IN_FULL")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  computeBudgetStatus,
  computeCategoryActual,
  computeChecklistCompletion,
  computeDaysUntilEvent,
  computeEventTotals,
  isNonNegativeMoney,
  roundMoney,
} from "@/lib/domain/budget";

describe("computeBudgetStatus", () => {
  it("returns under below 80% of planned", () => {
    expect(computeBudgetStatus(100, 79.99)).toBe("under");
  });

  it("returns near between 80% and 100% (inclusive)", () => {
    expect(computeBudgetStatus(100, 80)).toBe("near");
    expect(computeBudgetStatus(100, 100)).toBe("near");
  });

  it("returns over when actual exceeds planned", () => {
    expect(computeBudgetStatus(100, 100.01)).toBe("over");
  });

  it("handles a zero planned budget", () => {
    expect(computeBudgetStatus(0, 0)).toBe("under");
    expect(computeBudgetStatus(0, 1)).toBe("over");
  });
});

describe("computeCategoryActual", () => {
  it("sums vendor payments and standalone entries", () => {
    const actual = computeCategoryActual(
      [{ amountPaid: 10 }, { amountPaid: 5.5 }],
      [{ amount: 2 }]
    );
    expect(actual).toBe(17.5);
  });

  it("returns 0 with no data", () => {
    expect(computeCategoryActual([], [])).toBe(0);
  });

  it("rounds floating point noise to money precision", () => {
    expect(
      computeCategoryActual([{ amountPaid: 0.1 }, { amountPaid: 0.2 }], [])
    ).toBe(0.3);
  });
});

describe("computeEventTotals", () => {
  it("computes planned, actual, and remaining from the target budget", () => {
    const totals = computeEventTotals({
      totalTargetBudget: 1000,
      categories: [
        { plannedBudget: 600, actual: 700 },
        { plannedBudget: 500, actual: 100 },
      ],
    });
    expect(totals).toEqual({
      totalPlanned: 1100,
      totalActual: 800,
      remaining: 200,
    });
  });

  it("allows a negative remaining when over target", () => {
    const totals = computeEventTotals({
      totalTargetBudget: 100,
      categories: [{ plannedBudget: 100, actual: 150 }],
    });
    expect(totals.remaining).toBe(-50);
  });
});

describe("computeChecklistCompletion", () => {
  it("counts completed tasks and rounds the percentage", () => {
    const result = computeChecklistCompletion([
      { isComplete: true },
      { isComplete: true },
      { isComplete: false },
    ]);
    expect(result).toEqual({ done: 2, total: 3, pct: 67 });
  });

  it("returns 0% for an empty checklist", () => {
    expect(computeChecklistCompletion([])).toEqual({
      done: 0,
      total: 0,
      pct: 0,
    });
  });
});

describe("computeDaysUntilEvent", () => {
  it("counts whole days between today and the event date", () => {
    expect(
      computeDaysUntilEvent(
        new Date("2026-12-20T00:00:00.000Z"),
        new Date("2026-12-01T15:30:00.000Z")
      )
    ).toBe(19);
  });

  it("returns 0 on the event day and negative after it", () => {
    expect(
      computeDaysUntilEvent(
        new Date("2026-12-20T00:00:00.000Z"),
        new Date("2026-12-20T23:00:00.000Z")
      )
    ).toBe(0);
    expect(
      computeDaysUntilEvent(
        new Date("2026-12-20T00:00:00.000Z"),
        new Date("2026-12-25T00:00:00.000Z")
      )
    ).toBe(-5);
  });
});

describe("isNonNegativeMoney and roundMoney", () => {
  it("rejects negative, NaN, and infinite values", () => {
    expect(isNonNegativeMoney(0)).toBe(true);
    expect(isNonNegativeMoney(1500.5)).toBe(true);
    expect(isNonNegativeMoney(-0.01)).toBe(false);
    expect(isNonNegativeMoney(Number.NaN)).toBe(false);
    expect(isNonNegativeMoney(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("rounds to two decimal places", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(1500.555)).toBe(1500.56);
  });
});

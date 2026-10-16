export type BudgetStatus = "under" | "near" | "over";

export const NEAR_LIMIT_THRESHOLD = 0.8;

export function computeBudgetStatus(
  planned: number,
  actual: number
): BudgetStatus {
  if (actual > planned) {
    return "over";
  }
  if (planned > 0 && actual >= planned * NEAR_LIMIT_THRESHOLD) {
    return "near";
  }
  return "under";
}

export function computeCategoryActual(
  vendors: ReadonlyArray<{ amountPaid: number }>,
  entries: ReadonlyArray<{ amount: number }>
): number {
  const paid = vendors.reduce((sum, vendor) => sum + vendor.amountPaid, 0);
  const standalone = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return roundMoney(paid + standalone);
}

export type EventTotals = {
  totalPlanned: number;
  totalActual: number;
  remaining: number;
};

export function computeEventTotals(input: {
  totalTargetBudget: number;
  categories: ReadonlyArray<{ plannedBudget: number; actual: number }>;
}): EventTotals {
  const totalPlanned = roundMoney(
    input.categories.reduce((sum, category) => sum + category.plannedBudget, 0)
  );
  const totalActual = roundMoney(
    input.categories.reduce((sum, category) => sum + category.actual, 0)
  );
  return {
    totalPlanned,
    totalActual,
    remaining: roundMoney(input.totalTargetBudget - totalActual),
  };
}

export function computeChecklistCompletion(
  tasks: ReadonlyArray<{ isComplete: boolean }>
): { done: number; total: number; pct: number } {
  const total = tasks.length;
  const done = tasks.filter((task) => task.isComplete).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

export function computeDaysUntilEvent(eventDate: Date, now: Date): number {
  const dayMs = 86_400_000;
  const eventDay = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate()
  );
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return Math.round((eventDay - today) / dayMs);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isNonNegativeMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

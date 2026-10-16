"use client";

import { Card } from "@/components/ui/card";
import type { EventWorkspace } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";

export function OverviewTab({ workspace }: { workspace: EventWorkspace }) {
  const { event, summary } = workspace;
  const isPast = event.daysUntilEvent < 0;
  const isToday = event.daysUntilEvent === 0;

  const daysLabel = isToday
    ? "Hari ini (H-day)"
    : isPast
      ? `${Math.abs(event.daysUntilEvent)} hari berlalu`
      : `${event.daysUntilEvent} hari lagi`;

  const budgetPct =
    event.totalTargetBudget > 0
      ? Math.round((summary.totalActual / event.totalTargetBudget) * 100)
      : 0;
  const statusText =
    summary.budgetStatus === "over"
      ? "Melebihi target"
      : summary.budgetStatus === "near"
        ? "Mendekati batas"
        : "Dalam anggaran";

  return (
    <section aria-label="Event Overview" className="grid gap-4 sm:grid-cols-3">
      <Card className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm">
        <span className="type-caption text-muted-foreground">
          Days Remaining
        </span>
        <span
          className={
            isPast
              ? "type-metric-xl text-task-overdue"
              : "type-metric-xl text-foreground"
          }
        >
          {daysLabel}
        </span>
        <span className="type-caption text-muted-foreground">
          Dihitung ulang setiap kali halaman dimuat.
        </span>
      </Card>

      <Card className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm">
        <span className="type-caption text-muted-foreground">
          Budget Used vs. Target
        </span>
        <span
          className={
            summary.budgetStatus === "over"
              ? "type-metric-xl text-budget-over"
              : summary.budgetStatus === "near"
                ? "type-metric-xl text-budget-near"
                : "type-metric-xl text-foreground"
          }
        >
          {formatRupiah(summary.totalActual)} /{" "}
          {formatRupiah(event.totalTargetBudget)}
        </span>
        <span className="type-body text-muted-foreground">
          {budgetPct}% budget terpakai · {statusText} · Sisa{" "}
          <span className="type-body-numeric">
            {formatRupiah(summary.remaining)}
          </span>
        </span>
      </Card>

      <Card className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-sm">
        <span className="type-caption text-muted-foreground">
          Checklist Completion
        </span>
        <span className="type-metric-xl text-foreground">
          {summary.checklistPct}%
        </span>
        <span className="type-body text-muted-foreground">
          {summary.checklistDone}/{summary.checklistTotal} tugas selesai
        </span>
      </Card>
    </section>
  );
}

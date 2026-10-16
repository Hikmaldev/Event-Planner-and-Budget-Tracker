"use client";

import * as React from "react";
import type { EventWorkspace, MilestoneKey } from "@/lib/data/types";

const STATE_LABEL: Record<string, string> = {
  past: "Berlalu",
  current: "Posisi saat ini",
  future: "Akan datang",
};

function milestoneCircleClass(state: string): string {
  switch (state) {
    case "current":
      return "border-timeline-current bg-timeline-current text-white";
    case "past":
      return "border-timeline-past bg-timeline-past text-foreground";
    default:
      return "border-timeline-future bg-card text-timeline-future";
  }
}

export function TimelineTab({
  milestones,
}: {
  milestones: EventWorkspace["milestones"];
}) {
  const defaultKey =
    milestones.find((milestone) => milestone.state === "current")?.key ??
    milestones[milestones.length - 1]?.key ??
    "H-day";
  const [selected, setSelected] = React.useState<MilestoneKey>(defaultKey);

  const active =
    milestones.find((milestone) => milestone.key === selected) ?? milestones[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-lg text-foreground">Timeline View</h2>
        <p className="type-body text-muted-foreground">
          Posisi saat ini dihitung dari tanggal hari ini; klik milestone untuk
          melihat tugas yang jatuh di sekitarnya.
        </p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-4"
        aria-label="Timeline milestones"
      >
        {milestones.map((milestone) => {
          const isSelected = milestone.key === selected;
          return (
            <button
              key={milestone.key}
              type="button"
              data-action-id="ACT-12"
              aria-pressed={isSelected}
              onClick={() => setSelected(milestone.key)}
              className={`flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors ${
                isSelected ? "border-primary" : "border-border hover:border-primary/60"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 type-caption font-semibold ${milestoneCircleClass(
                    milestone.state
                  )}`}
                >
                  {milestone.label}
                </span>
                <span className="type-caption text-muted-foreground">
                  {STATE_LABEL[milestone.state]}
                </span>
              </div>
              <span className="type-caption text-muted-foreground">
                {milestone.date ? milestone.date.slice(0, 10) : "—"}
              </span>
              <span className="type-body text-foreground">
                {milestone.tasks.length} tugas
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="type-heading-sm text-foreground">
            Tugas di sekitar {active.label}
          </h3>
          <span className="type-caption text-muted-foreground">
            {active.tasks.length} tugas
          </span>
        </div>

        {active.tasks.length === 0 ? (
          <p className="type-body text-muted-foreground">
            Belum ada tugas pada rentang {active.label}. Tambahkan tugas di
            Checklist Tab agar muncul di sini.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {active.tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-1 rounded-sm border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span
                  className={
                    task.isOverdue
                      ? "type-body text-task-overdue font-semibold"
                      : task.isComplete
                        ? "type-body text-task-complete line-through"
                        : "type-body text-foreground"
                  }
                >
                  {task.title}
                </span>
                <span
                  className={
                    task.isOverdue
                      ? "type-caption font-semibold text-task-overdue"
                      : "type-caption text-muted-foreground"
                  }
                >
                  {task.deadline.slice(0, 10)}
                  {task.isOverdue ? " (overdue)" : ""}
                  {task.isComplete ? " · selesai" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { NewEventDialog } from "@/components/events/new-event-dialog";
import { Card } from "@/components/ui/card";
import { listEventItems } from "@/lib/data/events";
import type { EventListItem } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { requireUser } from "@/lib/session";

export default async function EventsDashboardPage() {
  await connection();
  const user = await requireUser();
  const events = await listEventItems(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="type-heading-lg text-foreground">Events Dashboard</h1>
          <p className="type-body text-muted-foreground">
            Kelola acara, vendor, anggaran Rupiah, checklist, dan timeline.
            Masuk sebagai {user.email}.
          </p>
        </div>
        <NewEventDialog />
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="type-heading-sm text-foreground">
              No events created yet
            </h2>
            <p className="type-body text-muted-foreground">
              You haven&apos;t created any events yet. Click &apos;New
              Event&apos; to get started.
            </p>
          </div>
          <NewEventDialog />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EventCard({ event }: { event: EventListItem }) {
  const pct =
    event.totalTargetBudget > 0
      ? Math.round((event.totalActual / event.totalTargetBudget) * 100)
      : 0;
  const barClass =
    event.budgetStatus === "over"
      ? "bg-budget-over"
      : event.budgetStatus === "near"
        ? "bg-budget-near"
        : "bg-budget-under";

  const daysLabel =
    event.daysUntilEvent === 0
      ? "Hari ini (H-day)"
      : event.daysUntilEvent > 0
        ? `${event.daysUntilEvent} hari lagi`
        : `${Math.abs(event.daysUntilEvent)} hari berlalu`;
  const isPast = event.daysUntilEvent < 0;

  return (
    <li>
      <Link href={`/events/${event.id}`} className="block">
        <Card className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary">
          <div className="flex flex-col gap-1">
            <h2
              className={
                event.budgetStatus === "over"
                  ? "type-heading-sm text-budget-over"
                  : "type-heading-sm text-foreground"
              }
            >
              {event.name}
            </h2>
            <p className="type-caption text-muted-foreground">
              {event.eventDate.slice(0, 10)} ·{" "}
              <span className={isPast ? "text-task-overdue" : undefined}>
                {daysLabel}
              </span>
              {event.location ? ` · ${event.location}` : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="type-body text-muted-foreground">Budget</span>
              <span className="type-body-numeric text-foreground">
                {formatRupiah(event.totalActual)} /{" "}
                {formatRupiah(event.totalTargetBudget)} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${barClass}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>

          <p className="type-body text-muted-foreground">
            Checklist: {event.checklistDone}/{event.checklistTotal} selesai (
            {event.checklistPct}%)
          </p>
        </Card>
      </Link>
    </li>
  );
}

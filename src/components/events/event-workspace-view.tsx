"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventWorkspace } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { BudgetTab } from "./budget-tab";
import { ChecklistTab } from "./checklist-tab";
import { EventHeaderActions } from "./event-header-actions";
import { OverviewTab } from "./overview-tab";
import { TimelineTab } from "./timeline-tab";
import { VendorsTab } from "./vendors-tab";

export function EventWorkspaceView({
  workspace,
}: {
  workspace: EventWorkspace;
}) {
  const { event } = workspace;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1">
          <Link
            href="/events"
            className="type-caption text-primary hover:underline"
          >
            ← Events Dashboard
          </Link>
          <h1 className="type-heading-lg text-foreground">{event.name}</h1>
          <p className="type-body text-muted-foreground">
            {event.eventDate.slice(0, 10)}
            {event.location ? ` · ${event.location}` : ""} · Target{" "}
            <span className="type-body-numeric">
              {formatRupiah(event.totalTargetBudget)}
            </span>
          </p>
        </div>
        <EventHeaderActions event={event} />
      </div>

      <Tabs defaultValue="overview" className="w-full gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted p-1">
          <TabsTrigger value="overview">Event Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors Tab</TabsTrigger>
          <TabsTrigger value="budget">Budget Tab</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Tab</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab workspace={workspace} />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsTab
            eventId={event.id}
            categories={workspace.categories}
            vendors={workspace.vendors}
          />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTab
            eventId={event.id}
            categories={workspace.categories}
            budgetEntries={workspace.budgetEntries}
            summary={workspace.summary}
            totalTargetBudget={event.totalTargetBudget}
          />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistTab
            eventId={event.id}
            tasks={workspace.tasks}
            vendors={workspace.vendors}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineTab milestones={workspace.milestones} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

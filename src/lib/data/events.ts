import { prisma } from "@/lib/db";
import { fail, ok, type DataResult } from "@/lib/result";
import {
  computeBudgetStatus,
  computeCategoryActual,
  computeChecklistCompletion,
  computeDaysUntilEvent,
  computeEventTotals,
  isNonNegativeMoney,
  roundMoney,
} from "@/lib/domain/budget";
import {
  computeMilestoneStates,
  groupTasksByMilestone,
  MILESTONES,
  milestoneDate,
} from "@/lib/domain/timeline";
import type {
  BudgetEntryView,
  CategoryView,
  EventListItem,
  EventWorkspace,
  MilestoneView,
  TaskView,
  VendorView,
} from "./types";

function toNumber(value: unknown): number {
  return Number(value);
}

export async function listEventItems(userId: string): Promise<EventListItem[]> {
  const events = await prisma.event.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        select: {
          plannedBudget: true,
          vendors: { select: { amountPaid: true } },
          budgetEntries: { select: { amount: true } },
        },
      },
      checklistTasks: { select: { isComplete: true } },
    },
  });

  const now = new Date();

  return events.map((event) => {
    const totalTargetBudget = toNumber(event.totalTargetBudget);
    const categories = event.categories.map((category) => ({
      plannedBudget: toNumber(category.plannedBudget),
      actual: computeCategoryActual(
        category.vendors.map((vendor) => ({
          amountPaid: toNumber(vendor.amountPaid),
        })),
        category.budgetEntries.map((entry) => ({
          amount: toNumber(entry.amount),
        }))
      ),
    }));
    const totals = computeEventTotals({ totalTargetBudget, categories });
    const checklist = computeChecklistCompletion(event.checklistTasks);

    return {
      id: event.id,
      name: event.name,
      eventDate: event.eventDate.toISOString(),
      location: event.location,
      daysUntilEvent: computeDaysUntilEvent(event.eventDate, now),
      totalTargetBudget,
      totalPlanned: totals.totalPlanned,
      totalActual: totals.totalActual,
      remaining: totals.remaining,
      budgetStatus: computeBudgetStatus(totalTargetBudget, totals.totalActual),
      checklistDone: checklist.done,
      checklistTotal: checklist.total,
      checklistPct: checklist.pct,
    };
  });
}

export async function getEventWorkspace(
  userId: string,
  eventId: string
): Promise<DataResult<EventWorkspace>> {
  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerId: userId },
    include: {
      categories: {
        orderBy: { name: "asc" },
        include: {
          vendors: { select: { amountPaid: true } },
          budgetEntries: { select: { amount: true } },
        },
      },
      vendors: {
        orderBy: { createdAt: "asc" },
        include: { category: { select: { name: true } } },
      },
      budgetEntries: {
        orderBy: { createdAt: "asc" },
        include: { category: { select: { name: true } } },
      },
      checklistTasks: {
        orderBy: { deadline: "asc" },
        include: { vendor: { select: { name: true } } },
      },
    },
  });

  if (!event) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  const now = new Date();
  const totalTargetBudget = toNumber(event.totalTargetBudget);

  const categories: CategoryView[] = event.categories.map((category) => {
    const plannedBudget = toNumber(category.plannedBudget);
    const actual = computeCategoryActual(
      category.vendors.map((vendor) => ({
        amountPaid: toNumber(vendor.amountPaid),
      })),
      category.budgetEntries.map((entry) => ({
        amount: toNumber(entry.amount),
      }))
    );
    return {
      id: category.id,
      name: category.name,
      isDefault: category.isDefault,
      plannedBudget,
      actual,
      status: computeBudgetStatus(plannedBudget, actual),
    };
  });

  const vendors: VendorView[] = event.vendors.map((vendor) => ({
    id: vendor.id,
    categoryId: vendor.categoryId,
    categoryName: vendor.category.name,
    name: vendor.name,
    contactInfo: vendor.contactInfo,
    notes: vendor.notes,
    agreedPrice: toNumber(vendor.agreedPrice),
    contractStatus: vendor.contractStatus,
    paymentStatus: vendor.paymentStatus,
    amountPaid: toNumber(vendor.amountPaid),
  }));

  const budgetEntries: BudgetEntryView[] = event.budgetEntries.map((entry) => ({
    id: entry.id,
    categoryId: entry.categoryId,
    categoryName: entry.category.name,
    description: entry.description,
    amount: toNumber(entry.amount),
    createdAt: entry.createdAt.toISOString(),
  }));

  const tasks: TaskView[] = event.checklistTasks.map((task) => ({
    id: task.id,
    vendorId: task.vendorId,
    vendorName: task.vendor?.name ?? null,
    title: task.title,
    description: task.description,
    deadline: task.deadline.toISOString(),
    isComplete: task.isComplete,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    isOverdue: !task.isComplete && task.deadline.getTime() < now.getTime(),
  }));

  const totals = computeEventTotals({
    totalTargetBudget,
    categories,
  });
  const checklist = computeChecklistCompletion(event.checklistTasks);
  const milestoneStates = computeMilestoneStates(event.eventDate, now);
  const grouped = groupTasksByMilestone(
    event.eventDate,
    tasks.map((view) => ({ view, deadline: new Date(view.deadline) }))
  );

  const milestones: MilestoneView[] = MILESTONES.map((milestone) => ({
    key: milestone.key,
    label: milestone.label,
    offsetDays: milestone.offsetDays,
    date: milestoneDate(event.eventDate, milestone.offsetDays).toISOString(),
    state: milestoneStates[milestone.key],
    tasks: grouped[milestone.key].map((group) => group.view),
  }));

  return ok({
    event: {
      id: event.id,
      name: event.name,
      eventDate: event.eventDate.toISOString(),
      location: event.location,
      totalTargetBudget,
      daysUntilEvent: computeDaysUntilEvent(event.eventDate, now),
    },
    summary: {
      totalPlanned: totals.totalPlanned,
      totalActual: totals.totalActual,
      remaining: totals.remaining,
      budgetStatus: computeBudgetStatus(totalTargetBudget, totals.totalActual),
      checklistDone: checklist.done,
      checklistTotal: checklist.total,
      checklistPct: checklist.pct,
      hasOverBudgetCategory: categories.some(
        (category) => category.status === "over"
      ),
    },
    categories,
    vendors,
    budgetEntries,
    tasks,
    milestones,
    todayIso: now.toISOString(),
  });
}

export async function createEvent(
  userId: string,
  input: {
    name: string;
    eventDate: Date;
    location?: string;
    totalTargetBudget: number;
  }
): Promise<DataResult<{ id: string }>> {
  if (!isNonNegativeMoney(input.totalTargetBudget)) {
    return fail("VALIDATION", "Target anggaran tidak boleh negatif.");
  }

  const event = await prisma.event.create({
    data: {
      ownerId: userId,
      name: input.name.trim(),
      eventDate: input.eventDate,
      location: input.location ?? null,
      totalTargetBudget: roundMoney(input.totalTargetBudget),
    },
    select: { id: true },
  });

  return ok({ id: event.id });
}

export async function updateEvent(
  userId: string,
  input: {
    eventId: string;
    name: string;
    eventDate: Date;
    location?: string;
    totalTargetBudget: number;
  }
): Promise<DataResult<undefined>> {
  if (!isNonNegativeMoney(input.totalTargetBudget)) {
    return fail("VALIDATION", "Target anggaran tidak boleh negatif.");
  }

  const existing = await prisma.event.findFirst({
    where: { id: input.eventId, ownerId: userId },
    select: { id: true },
  });
  if (!existing) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  await prisma.event.update({
    where: { id: input.eventId },
    data: {
      name: input.name.trim(),
      eventDate: input.eventDate,
      location: input.location ?? null,
      totalTargetBudget: roundMoney(input.totalTargetBudget),
    },
  });

  return ok(undefined);
}

export async function deleteEvent(
  userId: string,
  eventId: string
): Promise<DataResult<undefined>> {
  const existing = await prisma.event.findFirst({
    where: { id: eventId, ownerId: userId },
    select: { id: true },
  });
  if (!existing) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  // Ordered deletes keep the VendorCategory -> Vendor/BudgetEntry RESTRICT
  // constraints satisfied while Event -> children cascades remain the safety net.
  // Interactive transaction with an explicit timeout: a Neon cold start can push
  // past the 5s default, especially when running from serverless functions.
  await prisma.$transaction(
    async (tx) => {
      await tx.checklistTask.deleteMany({ where: { eventId } });
      await tx.budgetEntry.deleteMany({ where: { eventId } });
      await tx.vendor.deleteMany({ where: { eventId } });
      await tx.vendorCategory.deleteMany({ where: { eventId } });
      await tx.event.delete({ where: { id: eventId } });
    },
    { timeout: 20_000, maxWait: 10_000 }
  );

  return ok(undefined);
}

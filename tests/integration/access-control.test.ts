import { afterAll, describe, expect, it } from "vitest";
import { createBudgetEntry, createVendorCategory, deleteVendorCategory } from "@/lib/data/budget";
import {
  createEvent,
  deleteEvent,
  getEventWorkspace,
  listEventItems,
  updateEvent,
} from "@/lib/data/events";
import {
  createChecklistTask,
  deleteChecklistTask,
  setTaskCompletion,
  updateChecklistTask,
} from "@/lib/data/tasks";
import { createUser } from "@/lib/data/users";
import {
  createVendor,
  deleteVendor,
  updateVendorPayment,
} from "@/lib/data/vendors";
import { prisma } from "@/lib/db";
import { cleanupUsers, uniqueEmail } from "./helpers";

const createdUserIds: string[] = [];

afterAll(async () => {
  await cleanupUsers(createdUserIds);
});

async function createTestUser(label: string): Promise<string> {
  const result = await createUser({
    email: uniqueEmail(label),
    name: label,
    passwordHash: "test-hash",
  });
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  createdUserIds.push(result.data.id);
  return result.data.id;
}

type Fixture = {
  ownerId: string;
  eventId: string;
  categoryId: string;
  vendorId: string;
  taskId: string;
};

async function createFixture(label: string): Promise<Fixture> {
  const ownerId = await createTestUser(label);
  const event = await createEvent(ownerId, {
    name: `${label} Event`,
    eventDate: new Date("2026-12-20T00:00:00.000Z"),
    totalTargetBudget: 10_000_000,
  });
  if (!event.ok) throw new Error(event.error.message);

  const category = await createVendorCategory(ownerId, {
    eventId: event.data.id,
    name: "Kategori",
    plannedBudget: 5_000_000,
  });
  if (!category.ok) throw new Error(category.error.message);

  const vendor = await createVendor(ownerId, {
    eventId: event.data.id,
    categoryId: category.data.id,
    name: "Vendor",
    agreedPrice: 5_000_000,
  });
  if (!vendor.ok) throw new Error(vendor.error.message);

  const task = await createChecklistTask(ownerId, {
    eventId: event.data.id,
    title: "Tugas",
    deadline: new Date("2026-12-01T00:00:00.000Z"),
    vendorId: vendor.data.id,
  });
  if (!task.ok) throw new Error(task.error.message);

  await createBudgetEntry(ownerId, {
    eventId: event.data.id,
    categoryId: category.data.id,
    description: "Entry",
    amount: 100_000,
  });

  return {
    ownerId,
    eventId: event.data.id,
    categoryId: category.data.id,
    vendorId: vendor.data.id,
    taskId: task.data.id,
  };
}

describe("access control between two accounts", () => {
  it("never exposes another user's event through reads", async () => {
    const fixture = await createFixture("owner-read");
    const intruderId = await createTestUser("intruder-read");

    const workspace = await getEventWorkspace(intruderId, fixture.eventId);
    expect(workspace.ok).toBe(false);
    if (!workspace.ok) {
      expect(workspace.error.code).toBe("NOT_FOUND");
    }

    const items = await listEventItems(intruderId);
    expect(items.find((event) => event.id === fixture.eventId)).toBeUndefined();

    const ownerItems = await listEventItems(fixture.ownerId);
    expect(ownerItems.find((event) => event.id === fixture.eventId)).toBeDefined();
  });

  it("rejects every mutation attempted by another account", async () => {
    const fixture = await createFixture("owner-mutate");
    const intruderId = await createTestUser("intruder-mutate");

    const updateResult = await updateEvent(intruderId, {
      eventId: fixture.eventId,
      name: "Hijacked",
      eventDate: new Date("2027-01-01T00:00:00.000Z"),
      totalTargetBudget: 1,
    });
    expect(updateResult.ok).toBe(false);

    const deleteEventResult = await deleteEvent(intruderId, fixture.eventId);
    expect(deleteEventResult.ok).toBe(false);

    const categoryResult = await createVendorCategory(intruderId, {
      eventId: fixture.eventId,
      name: "Intruder Category",
      plannedBudget: 1,
    });
    expect(categoryResult.ok).toBe(false);

    const vendorResult = await createVendor(intruderId, {
      eventId: fixture.eventId,
      categoryId: fixture.categoryId,
      name: "Intruder Vendor",
      agreedPrice: 1,
    });
    expect(vendorResult.ok).toBe(false);

    const entryResult = await createBudgetEntry(intruderId, {
      eventId: fixture.eventId,
      categoryId: fixture.categoryId,
      description: "Intruder Entry",
      amount: 1,
    });
    expect(entryResult.ok).toBe(false);

    const taskResult = await createChecklistTask(intruderId, {
      eventId: fixture.eventId,
      title: "Intruder Task",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
    });
    expect(taskResult.ok).toBe(false);

    const paymentResult = await updateVendorPayment(intruderId, {
      vendorId: fixture.vendorId,
      amountPaid: 1,
      paymentStatus: "UNPAID",
    });
    expect(paymentResult.ok).toBe(false);
    if (!paymentResult.ok) {
      expect(paymentResult.error.code).toBe("NOT_FOUND");
    }

    const taskUpdateResult = await updateChecklistTask(intruderId, {
      taskId: fixture.taskId,
      title: "Hijacked Task",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
    });
    expect(taskUpdateResult.ok).toBe(false);

    const toggleResult = await setTaskCompletion(
      intruderId,
      fixture.taskId,
      true
    );
    expect(toggleResult.ok).toBe(false);

    const taskDeleteResult = await deleteChecklistTask(
      intruderId,
      fixture.taskId
    );
    expect(taskDeleteResult.ok).toBe(false);

    const categoryDeleteResult = await deleteVendorCategory(
      intruderId,
      fixture.categoryId
    );
    expect(categoryDeleteResult.ok).toBe(false);

    const vendorDeleteResult = await deleteVendor(
      intruderId,
      fixture.vendorId
    );
    expect(vendorDeleteResult.ok).toBe(false);

    // The owner's data stays fully intact after every rejected attempt.
    const task = await prisma.checklistTask.findUniqueOrThrow({
      where: { id: fixture.taskId },
      select: { title: true, isComplete: true, vendorId: true },
    });
    expect(task.title).toBe("Tugas");
    expect(task.isComplete).toBe(false);
    expect(task.vendorId).toBe(fixture.vendorId);

    const event = await prisma.event.findUniqueOrThrow({
      where: { id: fixture.eventId },
      select: { name: true },
    });
    expect(event.name).toBe("owner-mutate Event");

    const workspace = await getEventWorkspace(fixture.ownerId, fixture.eventId);
    expect(workspace.ok).toBe(true);
  });
});

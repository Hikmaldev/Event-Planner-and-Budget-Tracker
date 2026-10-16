import { afterAll, describe, expect, it } from "vitest";
import {
  createBudgetEntry,
  createVendorCategory,
  deleteVendorCategory,
} from "@/lib/data/budget";
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
  updateVendor,
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

async function createTestEvent(userId: string, name: string) {
  const result = await createEvent(userId, {
    name,
    eventDate: new Date("2026-12-20T00:00:00.000Z"),
    location: "Jakarta",
    totalTargetBudget: 50_000_000,
  });
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return result.data.id;
}

describe("budget flow with vendor payments and standalone entries", () => {
  it("derives category actuals, event totals, and over-budget state", async () => {
    const userId = await createTestUser("flow");
    const eventId = await createTestEvent(userId, "Flow Wedding");

    const catering = await createVendorCategory(userId, {
      eventId,
      name: "Catering",
      plannedBudget: 40_000_000,
    });
    const decoration = await createVendorCategory(userId, {
      eventId,
      name: "Decoration",
      plannedBudget: 15_000_000,
    });
    expect(catering.ok && decoration.ok).toBe(true);
    if (!catering.ok || !decoration.ok) return;

    const vendor = await createVendor(userId, {
      eventId,
      categoryId: catering.data.id,
      name: "Sunrise Catering",
      agreedPrice: 40_000_000,
      contactInfo: "0812-0000-0000",
    });
    expect(vendor.ok).toBe(true);
    if (!vendor.ok) return;

    const payment = await updateVendorPayment(userId, {
      vendorId: vendor.data.id,
      amountPaid: 38_500_000,
      paymentStatus: "DOWN_PAYMENT",
    });
    expect(payment.ok).toBe(true);

    const entry = await createBudgetEntry(userId, {
      eventId,
      categoryId: catering.data.id,
      description: "Cetak undangan",
      amount: 1_000_000,
    });
    expect(entry.ok).toBe(true);

    let workspace = await getEventWorkspace(userId, eventId);
    expect(workspace.ok).toBe(true);
    if (!workspace.ok) return;

    const cateringView = workspace.data.categories.find(
      (category) => category.id === catering.data.id
    );
    expect(cateringView?.actual).toBe(39_500_000);
    expect(cateringView?.status).toBe("near");
    expect(workspace.data.summary.totalPlanned).toBe(55_000_000);
    expect(workspace.data.summary.totalActual).toBe(39_500_000);
    expect(workspace.data.summary.remaining).toBe(10_500_000);
    expect(workspace.data.summary.hasOverBudgetCategory).toBe(false);
    expect(workspace.data.vendors).toHaveLength(1);
    expect(workspace.data.budgetEntries).toHaveLength(1);

    const finalPayment = await updateVendorPayment(userId, {
      vendorId: vendor.data.id,
      amountPaid: 40_000_000,
      paymentStatus: "PAID_IN_FULL",
    });
    expect(finalPayment.ok).toBe(true);

    workspace = await getEventWorkspace(userId, eventId);
    if (!workspace.ok) return;
    const updatedCatering = workspace.data.categories.find(
      (category) => category.id === catering.data.id
    );
    expect(updatedCatering?.actual).toBe(41_000_000);
    expect(updatedCatering?.status).toBe("over");
    expect(workspace.data.summary.hasOverBudgetCategory).toBe(true);
    expect(workspace.data.summary.remaining).toBe(9_000_000);
  });

  it("rejects inconsistent payment pairs without changing stored data", async () => {
    const userId = await createTestUser("payment-mismatch");
    const eventId = await createTestEvent(userId, "Mismatch Event");

    const category = await createVendorCategory(userId, {
      eventId,
      name: "Venue",
      plannedBudget: 10_000_000,
    });
    expect(category.ok).toBe(true);
    if (!category.ok) return;

    const vendor = await createVendor(userId, {
      eventId,
      categoryId: category.data.id,
      name: "Venue Hall",
      agreedPrice: 10_000_000,
    });
    expect(vendor.ok).toBe(true);
    if (!vendor.ok) return;

    const mismatch = await updateVendorPayment(userId, {
      vendorId: vendor.data.id,
      amountPaid: 5_000_000,
      paymentStatus: "PAID_IN_FULL",
    });
    expect(mismatch.ok).toBe(false);
    if (!mismatch.ok) {
      expect(mismatch.error.code).toBe("PAYMENT_STATUS_MISMATCH");
    }

    const stored = await prisma.vendor.findUniqueOrThrow({
      where: { id: vendor.data.id },
      select: { amountPaid: true, paymentStatus: true },
    });
    expect(Number(stored.amountPaid)).toBe(0);
    expect(stored.paymentStatus).toBe("UNPAID");

    const negative = await updateVendorPayment(userId, {
      vendorId: vendor.data.id,
      amountPaid: -1,
      paymentStatus: "UNPAID",
    });
    expect(negative.ok).toBe(false);
    if (!negative.ok) {
      expect(negative.error.code).toBe("VALIDATION");
    }

    const agreedPriceMismatch = await updateVendor(userId, {
      vendorId: vendor.data.id,
      categoryId: category.data.id,
      name: "Venue Hall",
      agreedPrice: 10_000_000,
      contractStatus: "CONTRACTED",
    });
    expect(agreedPriceMismatch.ok).toBe(true);
  });

  it("rejects negative money at the data layer for every create path", async () => {
    const userId = await createTestUser("negative");
    const event = await createEvent(userId, {
      name: "Negative Event",
      eventDate: new Date("2026-12-20T00:00:00.000Z"),
      totalTargetBudget: -1,
    });
    expect(event.ok).toBe(false);

    const eventId = await createTestEvent(userId, "Negative Checks");
    const category = await createVendorCategory(userId, {
      eventId,
      name: "Katering",
      plannedBudget: -1,
    });
    expect(category.ok).toBe(false);

    const goodCategory = await createVendorCategory(userId, {
      eventId,
      name: "Katering",
      plannedBudget: 1_000_000,
    });
    expect(goodCategory.ok).toBe(true);
    if (!goodCategory.ok) return;

    const vendor = await createVendor(userId, {
      eventId,
      categoryId: goodCategory.data.id,
      name: "Vendor",
      agreedPrice: -1,
    });
    expect(vendor.ok).toBe(false);

    const entry = await createBudgetEntry(userId, {
      eventId,
      categoryId: goodCategory.data.id,
      description: "Entry",
      amount: -1,
    });
    expect(entry.ok).toBe(false);
  });
});

describe("checklist lifecycle", () => {
  it("creates, updates, toggles, and survives vendor deletion", async () => {
    const userId = await createTestUser("tasks");
    const eventId = await createTestEvent(userId, "Tasks Event");

    const category = await createVendorCategory(userId, {
      eventId,
      name: "Dokumentasi",
      plannedBudget: 5_000_000,
    });
    if (!category.ok) return;
    const vendor = await createVendor(userId, {
      eventId,
      categoryId: category.data.id,
      name: "Photo Studio",
      agreedPrice: 5_000_000,
    });
    if (!vendor.ok) return;

    const task = await createChecklistTask(userId, {
      eventId,
      title: "Konfirmasi katering",
      deadline: new Date("2026-12-13T00:00:00.000Z"),
      vendorId: vendor.data.id,
    });
    expect(task.ok).toBe(true);
    if (!task.ok) return;

    const updated = await updateChecklistTask(userId, {
      taskId: task.data.id,
      title: "Konfirmasi katering final",
      deadline: new Date("2026-12-10T00:00:00.000Z"),
      description: "Kirim daftar tamu",
      vendorId: vendor.data.id,
    });
    expect(updated.ok).toBe(true);

    const completed = await setTaskCompletion(userId, task.data.id, true);
    expect(completed.ok).toBe(true);
    const afterComplete = await prisma.checklistTask.findUniqueOrThrow({
      where: { id: task.data.id },
      select: { isComplete: true, completedAt: true },
    });
    expect(afterComplete.isComplete).toBe(true);
    expect(afterComplete.completedAt).not.toBeNull();

    const reopened = await setTaskCompletion(userId, task.data.id, false);
    expect(reopened.ok).toBe(true);
    const afterReopen = await prisma.checklistTask.findUniqueOrThrow({
      where: { id: task.data.id },
      select: { isComplete: true, completedAt: true },
    });
    expect(afterReopen.isComplete).toBe(false);
    expect(afterReopen.completedAt).toBeNull();

    const removedVendor = await deleteVendor(userId, vendor.data.id);
    expect(removedVendor.ok).toBe(true);
    const afterVendorDelete = await prisma.checklistTask.findUniqueOrThrow({
      where: { id: task.data.id },
      select: { vendorId: true },
    });
    expect(afterVendorDelete.vendorId).toBeNull();

    const workspace = await getEventWorkspace(userId, eventId);
    if (!workspace.ok) return;
    expect(workspace.data.tasks).toHaveLength(1);
    expect(workspace.data.tasks[0].vendorId).toBeNull();

    const deleted = await deleteChecklistTask(userId, task.data.id);
    expect(deleted.ok).toBe(true);
    expect(
      await prisma.checklistTask.count({ where: { eventId } })
    ).toBe(0);
  });
});

describe("category deletion rules", () => {
  it("blocks deletion with dependents and allows deletion when empty", async () => {
    const userId = await createTestUser("category-rules");
    const eventId = await createTestEvent(userId, "Category Rules");

    const category = await createVendorCategory(userId, {
      eventId,
      name: "Catering",
      plannedBudget: 10_000_000,
    });
    if (!category.ok) return;
    const vendor = await createVendor(userId, {
      eventId,
      categoryId: category.data.id,
      name: "Katering Kita",
      agreedPrice: 10_000_000,
    });
    if (!vendor.ok) return;

    const blocked = await deleteVendorCategory(userId, category.data.id);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error.code).toBe("CONFLICT");
    }
    expect(
      await prisma.vendorCategory.count({ where: { id: category.data.id } })
    ).toBe(1);

    const empty = await createVendorCategory(userId, {
      eventId,
      name: "Venue",
      plannedBudget: 0,
    });
    if (!empty.ok) return;
    const deleted = await deleteVendorCategory(userId, empty.data.id);
    expect(deleted.ok).toBe(true);
    expect(
      await prisma.vendorCategory.count({ where: { id: empty.data.id } })
    ).toBe(0);
  });
});

describe("event lifecycle", () => {
  it("updates event details and cascades deletion to every child row", async () => {
    const userId = await createTestUser("event-lifecycle");
    const eventId = await createTestEvent(userId, "Cascade Event");

    const updated = await updateEvent(userId, {
      eventId,
      name: "Cascade Event Updated",
      eventDate: new Date("2027-01-10T00:00:00.000Z"),
      location: "Bandung",
      totalTargetBudget: 75_000_000,
    });
    expect(updated.ok).toBe(true);

    const category = await createVendorCategory(userId, {
      eventId,
      name: "Katering",
      plannedBudget: 10_000_000,
    });
    if (!category.ok) return;
    await createVendor(userId, {
      eventId,
      categoryId: category.data.id,
      name: "Vendor A",
      agreedPrice: 10_000_000,
    });
    await createBudgetEntry(userId, {
      eventId,
      categoryId: category.data.id,
      description: "Entry A",
      amount: 500_000,
    });
    await createChecklistTask(userId, {
      eventId,
      title: "Tugas A",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
    });

    const deleted = await deleteEvent(userId, eventId);
    expect(deleted.ok).toBe(true);

    expect(await prisma.event.findUnique({ where: { id: eventId } })).toBeNull();
    expect(await prisma.vendor.count({ where: { eventId } })).toBe(0);
    expect(await prisma.vendorCategory.count({ where: { eventId } })).toBe(0);
    expect(await prisma.budgetEntry.count({ where: { eventId } })).toBe(0);
    expect(await prisma.checklistTask.count({ where: { eventId } })).toBe(0);

    const workspace = await getEventWorkspace(userId, eventId);
    expect(workspace.ok).toBe(false);
  });

  it("lists owned events with computed summaries for the dashboard", async () => {
    const userId = await createTestUser("dashboard-list");
    const eventId = await createTestEvent(userId, "Dashboard List Event");

    const category = await createVendorCategory(userId, {
      eventId,
      name: "Dekorasi",
      plannedBudget: 5_000_000,
    });
    if (!category.ok) return;
    const vendor = await createVendor(userId, {
      eventId,
      categoryId: category.data.id,
      name: "Dekor Vendor",
      agreedPrice: 5_000_000,
    });
    if (!vendor.ok) return;
    await updateVendorPayment(userId, {
      vendorId: vendor.data.id,
      amountPaid: 5_000_000,
      paymentStatus: "PAID_IN_FULL",
    });
    await createChecklistTask(userId, {
      eventId,
      title: "Tugas Dashboard",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
    });

    const items = await listEventItems(userId);
    const item = items.find((event) => event.id === eventId);
    expect(item).toBeDefined();
    expect(item?.totalActual).toBe(5_000_000);
    expect(item?.checklistTotal).toBe(1);
    expect(item?.checklistDone).toBe(0);
  });
});

describe("cross-event link protection", () => {
  it("rejects vendors, entries, and tasks linked to another event", async () => {
    const userId = await createTestUser("cross-event");
    const eventA = await createTestEvent(userId, "Event A");
    const eventB = await createTestEvent(userId, "Event B");

    const categoryB = await createVendorCategory(userId, {
      eventId: eventB,
      name: "Kategori B",
      plannedBudget: 1_000_000,
    });
    if (!categoryB.ok) return;
    const vendorB = await createVendor(userId, {
      eventId: eventB,
      categoryId: categoryB.data.id,
      name: "Vendor B",
      agreedPrice: 1_000_000,
    });
    if (!vendorB.ok) return;

    const vendorWithForeignCategory = await createVendor(userId, {
      eventId: eventA,
      categoryId: categoryB.data.id,
      name: "Vendor Salah",
      agreedPrice: 1_000_000,
    });
    expect(vendorWithForeignCategory.ok).toBe(false);
    if (!vendorWithForeignCategory.ok) {
      expect(vendorWithForeignCategory.error.code).toBe("CROSS_EVENT_LINK");
    }

    const entryWithForeignCategory = await createBudgetEntry(userId, {
      eventId: eventA,
      categoryId: categoryB.data.id,
      description: "Entry Salah",
      amount: 1_000,
    });
    expect(entryWithForeignCategory.ok).toBe(false);
    if (!entryWithForeignCategory.ok) {
      expect(entryWithForeignCategory.error.code).toBe("CROSS_EVENT_LINK");
    }

    const taskWithForeignVendor = await createChecklistTask(userId, {
      eventId: eventA,
      title: "Tugas Salah",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
      vendorId: vendorB.data.id,
    });
    expect(taskWithForeignVendor.ok).toBe(false);
    if (!taskWithForeignVendor.ok) {
      expect(taskWithForeignVendor.error.code).toBe("CROSS_EVENT_LINK");
    }

    const updatedVendor = await updateVendor(userId, {
      vendorId: vendorB.data.id,
      categoryId: categoryB.data.id,
      name: "Vendor B",
      agreedPrice: 1_000_000,
      contractStatus: "NEGOTIATING",
    });
    expect(updatedVendor.ok).toBe(true);
  });
});

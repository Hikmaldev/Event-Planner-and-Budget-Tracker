import { prisma } from "@/lib/db";
import { fail, ok, type DataResult } from "@/lib/result";

async function assertVendorBelongsToEvent(
  vendorId: string,
  eventId: string
): Promise<boolean> {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, eventId },
    select: { id: true },
  });
  return vendor !== null;
}

export async function createChecklistTask(
  userId: string,
  input: {
    eventId: string;
    title: string;
    deadline: Date;
    description?: string;
    vendorId?: string;
  }
): Promise<DataResult<{ id: string }>> {
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, ownerId: userId },
    select: { id: true },
  });
  if (!event) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  if (
    input.vendorId &&
    !(await assertVendorBelongsToEvent(input.vendorId, input.eventId))
  ) {
    return fail("CROSS_EVENT_LINK", "Vendor tidak ditemukan pada acara ini.");
  }

  const task = await prisma.checklistTask.create({
    data: {
      eventId: input.eventId,
      vendorId: input.vendorId ?? null,
      title: input.title.trim(),
      description: input.description ?? null,
      deadline: input.deadline,
    },
    select: { id: true },
  });

  return ok({ id: task.id });
}

export async function updateChecklistTask(
  userId: string,
  input: {
    taskId: string;
    title: string;
    deadline: Date;
    description?: string;
    vendorId?: string;
  }
): Promise<DataResult<undefined>> {
  const task = await prisma.checklistTask.findFirst({
    where: { id: input.taskId, event: { ownerId: userId } },
    select: { id: true, eventId: true },
  });
  if (!task) {
    return fail("NOT_FOUND", "Tugas tidak ditemukan atau bukan milik Anda.");
  }

  if (
    input.vendorId &&
    !(await assertVendorBelongsToEvent(input.vendorId, task.eventId))
  ) {
    return fail("CROSS_EVENT_LINK", "Vendor tidak ditemukan pada acara ini.");
  }

  await prisma.checklistTask.update({
    where: { id: task.id },
    data: {
      title: input.title.trim(),
      description: input.description ?? null,
      deadline: input.deadline,
      vendorId: input.vendorId ?? null,
    },
  });

  return ok(undefined);
}

export async function setTaskCompletion(
  userId: string,
  taskId: string,
  isComplete: boolean
): Promise<DataResult<undefined>> {
  const task = await prisma.checklistTask.findFirst({
    where: { id: taskId, event: { ownerId: userId } },
    select: { id: true },
  });
  if (!task) {
    return fail("NOT_FOUND", "Tugas tidak ditemukan atau bukan milik Anda.");
  }

  await prisma.checklistTask.update({
    where: { id: task.id },
    data: {
      isComplete,
      completedAt: isComplete ? new Date() : null,
    },
  });

  return ok(undefined);
}

export async function deleteChecklistTask(
  userId: string,
  taskId: string
): Promise<DataResult<undefined>> {
  const task = await prisma.checklistTask.findFirst({
    where: { id: taskId, event: { ownerId: userId } },
    select: { id: true },
  });
  if (!task) {
    return fail("NOT_FOUND", "Tugas tidak ditemukan atau bukan milik Anda.");
  }

  await prisma.checklistTask.delete({ where: { id: task.id } });
  return ok(undefined);
}

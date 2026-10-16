import { prisma } from "@/lib/db";
import { fail, ok, type DataResult } from "@/lib/result";
import { isNonNegativeMoney, roundMoney } from "@/lib/domain/budget";
import { isForeignKeyConstraintError } from "./prisma-errors";

export async function createVendorCategory(
  userId: string,
  input: {
    eventId: string;
    name: string;
    plannedBudget: number;
  }
): Promise<DataResult<{ id: string }>> {
  if (!isNonNegativeMoney(input.plannedBudget)) {
    return fail("VALIDATION", "Anggaran rencana tidak boleh negatif.");
  }

  const event = await prisma.event.findFirst({
    where: { id: input.eventId, ownerId: userId },
    select: { id: true },
  });
  if (!event) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  const category = await prisma.vendorCategory.create({
    data: {
      eventId: input.eventId,
      name: input.name.trim(),
      plannedBudget: roundMoney(input.plannedBudget),
    },
    select: { id: true },
  });

  return ok({ id: category.id });
}

export async function deleteVendorCategory(
  userId: string,
  categoryId: string
): Promise<DataResult<undefined>> {
  const category = await prisma.vendorCategory.findFirst({
    where: { id: categoryId, event: { ownerId: userId } },
    select: {
      id: true,
      name: true,
      _count: { select: { vendors: true, budgetEntries: true } },
    },
  });
  if (!category) {
    return fail("NOT_FOUND", "Kategori tidak ditemukan atau bukan milik Anda.");
  }

  const dependents = category._count.vendors + category._count.budgetEntries;
  if (dependents > 0) {
    return fail(
      "CONFLICT",
      `Kategori "${category.name}" masih memiliki ${category._count.vendors} vendor dan ${category._count.budgetEntries} budget entry. Pindahkan atau hapus data terkait lebih dulu.`
    );
  }

  try {
    await prisma.vendorCategory.delete({ where: { id: category.id } });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return fail(
        "CONFLICT",
        "Kategori masih dipakai oleh data lain dan tidak dapat dihapus."
      );
    }
    throw error;
  }

  return ok(undefined);
}

export async function createBudgetEntry(
  userId: string,
  input: {
    eventId: string;
    categoryId: string;
    description: string;
    amount: number;
  }
): Promise<DataResult<{ id: string }>> {
  if (!isNonNegativeMoney(input.amount)) {
    return fail("VALIDATION", "Jumlah tidak boleh negatif.");
  }

  const event = await prisma.event.findFirst({
    where: { id: input.eventId, ownerId: userId },
    select: { id: true },
  });
  if (!event) {
    return fail("NOT_FOUND", "Acara tidak ditemukan atau bukan milik Anda.");
  }

  const category = await prisma.vendorCategory.findFirst({
    where: { id: input.categoryId, eventId: input.eventId },
    select: { id: true },
  });
  if (!category) {
    return fail(
      "CROSS_EVENT_LINK",
      "Kategori tidak ditemukan pada acara ini."
    );
  }

  const entry = await prisma.budgetEntry.create({
    data: {
      eventId: input.eventId,
      categoryId: input.categoryId,
      description: input.description.trim(),
      amount: roundMoney(input.amount),
    },
    select: { id: true },
  });

  return ok({ id: entry.id });
}

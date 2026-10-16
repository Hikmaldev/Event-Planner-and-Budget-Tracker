import { prisma } from "@/lib/db";
import { fail, ok, type DataResult } from "@/lib/result";
import { isNonNegativeMoney, roundMoney } from "@/lib/domain/budget";
import {
  expectedPaymentStatus,
  type PaymentStatus,
} from "@/lib/domain/payment";

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  DOWN_PAYMENT: "Down Payment",
  PAID_IN_FULL: "Paid in Full",
};

export async function createVendor(
  userId: string,
  input: {
    eventId: string;
    categoryId: string;
    name: string;
    agreedPrice: number;
    contactInfo?: string;
    notes?: string;
  }
): Promise<DataResult<{ id: string }>> {
  if (!isNonNegativeMoney(input.agreedPrice)) {
    return fail("VALIDATION", "Harga kesepakatan tidak boleh negatif.");
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

  const vendor = await prisma.vendor.create({
    data: {
      eventId: input.eventId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      contactInfo: input.contactInfo ?? null,
      notes: input.notes ?? null,
      agreedPrice: roundMoney(input.agreedPrice),
    },
    select: { id: true },
  });

  return ok({ id: vendor.id });
}

export async function updateVendor(
  userId: string,
  input: {
    vendorId: string;
    categoryId: string;
    name: string;
    agreedPrice: number;
    contractStatus: "NEGOTIATING" | "CONTRACTED" | "CANCELLED";
    contactInfo?: string;
    notes?: string;
  }
): Promise<DataResult<undefined>> {
  if (!isNonNegativeMoney(input.agreedPrice)) {
    return fail("VALIDATION", "Harga kesepakatan tidak boleh negatif.");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { id: input.vendorId, event: { ownerId: userId } },
    select: { id: true, eventId: true, amountPaid: true, paymentStatus: true },
  });
  if (!vendor) {
    return fail("NOT_FOUND", "Vendor tidak ditemukan atau bukan milik Anda.");
  }

  const category = await prisma.vendorCategory.findFirst({
    where: { id: input.categoryId, eventId: vendor.eventId },
    select: { id: true },
  });
  if (!category) {
    return fail(
      "CROSS_EVENT_LINK",
      "Kategori tidak ditemukan pada acara ini."
    );
  }

  const amountPaid = Number(vendor.amountPaid);
  const expected = expectedPaymentStatus(input.agreedPrice, amountPaid);
  if (expected !== vendor.paymentStatus) {
    return fail(
      "PAYMENT_STATUS_MISMATCH",
      `Harga kesepakatan baru tidak konsisten dengan pembayaran tercatat (${PAYMENT_LABEL[vendor.paymentStatus]}). Perbarui status pembayaran vendor lebih dulu.`
    );
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      categoryId: input.categoryId,
      name: input.name.trim(),
      agreedPrice: roundMoney(input.agreedPrice),
      contractStatus: input.contractStatus,
      contactInfo: input.contactInfo ?? null,
      notes: input.notes ?? null,
    },
  });

  return ok(undefined);
}

export async function updateVendorPayment(
  userId: string,
  input: {
    vendorId: string;
    amountPaid: number;
    paymentStatus: PaymentStatus;
  }
): Promise<DataResult<undefined>> {
  if (!isNonNegativeMoney(input.amountPaid)) {
    return fail("VALIDATION", "Jumlah dibayar tidak boleh negatif.");
  }

  const vendor = await prisma.vendor.findFirst({
    where: { id: input.vendorId, event: { ownerId: userId } },
    select: { id: true, agreedPrice: true },
  });
  if (!vendor) {
    return fail("NOT_FOUND", "Vendor tidak ditemukan atau bukan milik Anda.");
  }

  const agreedPrice = Number(vendor.agreedPrice);
  const expected = expectedPaymentStatus(agreedPrice, input.amountPaid);
  if (expected !== input.paymentStatus) {
    return fail(
      "PAYMENT_STATUS_MISMATCH",
      `Untuk jumlah dibayar tersebut, status pembayaran harus ${PAYMENT_LABEL[expected]}.`
    );
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      amountPaid: roundMoney(input.amountPaid),
      paymentStatus: input.paymentStatus,
    },
  });

  return ok(undefined);
}

export async function deleteVendor(
  userId: string,
  vendorId: string
): Promise<DataResult<undefined>> {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, event: { ownerId: userId } },
    select: { id: true },
  });
  if (!vendor) {
    return fail("NOT_FOUND", "Vendor tidak ditemukan atau bukan milik Anda.");
  }

  await prisma.vendor.delete({ where: { id: vendor.id } });
  return ok(undefined);
}

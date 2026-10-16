"use server";

import { revalidatePath } from "next/cache";
import {
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-helpers";
import {
  createVendor,
  deleteVendor,
  updateVendor,
  updateVendorPayment,
} from "@/lib/data/vendors";
import { formDataToObject } from "@/lib/form";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/result";
import {
  vendorCreateSchema,
  vendorDeleteSchema,
  vendorPaymentSchema,
  vendorUpdateSchema,
} from "@/lib/validation";

export async function createVendorAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = vendorCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await createVendor(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState(`Vendor "${parsed.data.name}" berhasil ditambahkan.`);
}

export async function updateVendorAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = vendorUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await updateVendor(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Detail vendor berhasil diperbarui.");
}

export async function updateVendorPaymentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = vendorPaymentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await updateVendorPayment(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Status pembayaran vendor berhasil diperbarui.");
}

export async function deleteVendorAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = vendorDeleteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await deleteVendor(user.id, parsed.data.vendorId);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Vendor berhasil dihapus.");
}

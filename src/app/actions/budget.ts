"use server";

import { revalidatePath } from "next/cache";
import {
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-helpers";
import {
  createBudgetEntry,
  createVendorCategory,
  deleteVendorCategory,
} from "@/lib/data/budget";
import { formDataToObject } from "@/lib/form";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/result";
import {
  budgetEntryCreateSchema,
  categoryCreateSchema,
  categoryDeleteSchema,
} from "@/lib/validation";

export async function createVendorCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categoryCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await createVendorCategory(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState(`Kategori "${parsed.data.name}" berhasil ditambahkan.`);
}

export async function deleteVendorCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categoryDeleteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await deleteVendorCategory(user.id, parsed.data.categoryId);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Kategori berhasil dihapus.");
}

export async function createBudgetEntryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = budgetEntryCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await createBudgetEntry(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Budget entry berhasil ditambahkan.");
}

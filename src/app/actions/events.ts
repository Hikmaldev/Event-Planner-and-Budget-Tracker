"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-helpers";
import { createEvent, deleteEvent, updateEvent } from "@/lib/data/events";
import { formDataToObject } from "@/lib/form";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/result";
import { eventCreateSchema, eventIdSchema, eventUpdateSchema } from "@/lib/validation";

export async function createEventAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = eventCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await createEvent(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath("/events");
  return successState(`Acara "${parsed.data.name}" berhasil dibuat.`);
}

export async function updateEventAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = eventUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await updateEvent(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath("/events");
  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Detail acara berhasil diperbarui.");
}

export async function deleteEventAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = eventIdSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await deleteEvent(user.id, parsed.data.eventId);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath("/events");
  redirect("/events");
}

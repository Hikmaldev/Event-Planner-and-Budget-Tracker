"use server";

import { revalidatePath } from "next/cache";
import {
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-helpers";
import {
  createChecklistTask,
  deleteChecklistTask,
  setTaskCompletion,
  updateChecklistTask,
} from "@/lib/data/tasks";
import { formDataToObject } from "@/lib/form";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/result";
import {
  taskCreateSchema,
  taskDeleteSchema,
  taskToggleSchema,
  taskUpdateSchema,
} from "@/lib/validation";

export async function createChecklistTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = taskCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await createChecklistTask(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState(`Tugas "${parsed.data.title}" berhasil ditambahkan.`);
}

export async function updateChecklistTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = taskUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await updateChecklistTask(user.id, parsed.data);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Tugas berhasil diperbarui.");
}

export async function deleteChecklistTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = taskDeleteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await deleteChecklistTask(user.id, parsed.data.taskId);
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState("Tugas berhasil dihapus.");
}

export async function toggleTaskCompleteAction(input: {
  eventId: string;
  taskId: string;
  isComplete: boolean;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = taskToggleSchema.safeParse(input);
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const result = await setTaskCompletion(
    user.id,
    parsed.data.taskId,
    parsed.data.isComplete
  );
  if (!result.ok) {
    return errorState(result.error.message);
  }

  revalidatePath(`/events/${parsed.data.eventId}`);
  return successState(
    parsed.data.isComplete ? "Tugas ditandai selesai." : "Tugas dibuka kembali."
  );
}

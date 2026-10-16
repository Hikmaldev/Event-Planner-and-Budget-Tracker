import type { ZodError } from "zod";
import { fieldErrorsFromZod, type ActionState } from "@/lib/result";

export function validationErrorState(error: ZodError): ActionState {
  return {
    status: "error",
    message: "Periksa kembali isian formulir.",
    fieldErrors: fieldErrorsFromZod(error),
  };
}

export function errorState(message: string): ActionState {
  return { status: "error", message };
}

export function successState(message?: string): ActionState {
  return { status: "success", message };
}

export function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function rethrowRedirect(error: unknown): void {
  if (isRedirectError(error)) {
    throw error;
  }
}

import { z } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { status: "idle" };

export type DataErrorCode =
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "CROSS_EVENT_LINK"
  | "PAYMENT_STATUS_MISMATCH"
  | "EMAIL_TAKEN"
  | "INTERNAL";

export type DataError = {
  code: DataErrorCode;
  message: string;
};

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DataError };

export function ok<T>(data: T): DataResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: DataErrorCode, message: string): DataResult<T> {
  return { ok: false, error: { code, message } };
}

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return flattened.fieldErrors as Record<string, string[]>;
}

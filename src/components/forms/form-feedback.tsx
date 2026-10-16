"use client";

import type { ActionState } from "@/lib/result";

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "success" && state.message) {
    return (
      <p role="status" aria-live="polite" className="type-body text-muted-foreground">
        {state.message}
      </p>
    );
  }
  if (state.status === "error" && state.message) {
    return (
      <p role="alert" className="type-body text-destructive">
        {state.message}
      </p>
    );
  }
  return null;
}

export function FieldErrors({
  errors,
}: {
  errors?: Record<string, string[]>;
}) {
  if (!errors) {
    return null;
  }

  const entries = Object.entries(errors).filter(
    ([, messages]) => messages.length > 0
  );
  if (entries.length === 0) {
    return null;
  }

  return (
    <ul role="alert" className="flex flex-col gap-1">
      {entries.map(([field, messages]) => (
        <li key={field} className="type-caption text-destructive">
          <span className="font-medium">{field}</span>: {messages.join(", ")}
        </li>
      ))}
    </ul>
  );
}

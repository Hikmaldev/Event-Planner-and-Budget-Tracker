"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldErrors, FormMessage } from "@/components/forms/form-feedback";
import { initialActionState, type ActionState } from "@/lib/result";

export type FormAction = (
  state: ActionState,
  formData: FormData
) => Promise<ActionState>;

type ActionFormDialogProps = {
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerSize?: "default" | "sm" | "lg";
  title: string;
  description?: string;
  action: FormAction;
  submitLabel: string;
  submitVariant?: "default" | "destructive" | "outline";
  actionId: string;
  hiddenFields?: Record<string, string>;
  disabledReason?: string;
  children?: React.ReactNode;
};

export function ActionFormDialog({
  triggerLabel,
  triggerVariant = "default",
  triggerSize = "default",
  title,
  description,
  action,
  submitLabel,
  submitVariant = "default",
  actionId,
  hiddenFields,
  disabledReason,
  children,
}: ActionFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const closeDialog = React.useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          disabled={Boolean(disabledReason)}
          title={disabledReason}
          data-action-id={`${actionId}-trigger`}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg shadow-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="type-heading-sm text-foreground">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="type-body text-muted-foreground">
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>
        {open ? (
          <DialogFormBody
            action={action}
            submitLabel={submitLabel}
            submitVariant={submitVariant}
            actionId={actionId}
            hiddenFields={hiddenFields}
            onSuccess={closeDialog}
          >
            {children}
          </DialogFormBody>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DialogFormBody({
  action,
  submitLabel,
  submitVariant,
  actionId,
  hiddenFields,
  onSuccess,
  children,
}: {
  action: FormAction;
  submitLabel: string;
  submitVariant: "default" | "destructive" | "outline";
  actionId: string;
  hiddenFields?: Record<string, string>;
  onSuccess: () => void;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState
  );
  const router = useRouter();

  React.useEffect(() => {
    if (state.status === "success") {
      onSuccess();
      router.refresh();
    }
  }, [state.status, onSuccess, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {children}
      <FormMessage state={state} />
      <FieldErrors errors={state.fieldErrors} />
      <DialogFooter className="flex-col items-stretch gap-2 sm:flex-col">
        <Button
          type="submit"
          variant={submitVariant}
          disabled={pending}
          data-action-id={actionId}
        >
          {pending ? "Memproses..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

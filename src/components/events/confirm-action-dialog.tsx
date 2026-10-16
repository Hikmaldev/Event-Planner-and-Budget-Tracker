"use client";

import * as React from "react";
import { ActionFormDialog, type FormAction } from "./action-form-dialog";

export function ConfirmActionDialog({
  triggerLabel,
  title,
  description,
  action,
  submitLabel,
  actionId,
  hiddenFields,
  disabledReason,
  children,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  action: FormAction;
  submitLabel: string;
  actionId: string;
  hiddenFields?: Record<string, string>;
  disabledReason?: string;
  children?: React.ReactNode;
}) {
  return (
    <ActionFormDialog
      triggerLabel={triggerLabel}
      triggerVariant="outline"
      triggerSize="sm"
      title={title}
      description={description}
      action={action}
      submitLabel={submitLabel}
      submitVariant="destructive"
      actionId={actionId}
      hiddenFields={hiddenFields}
      disabledReason={disabledReason}
    >
      {children}
    </ActionFormDialog>
  );
}

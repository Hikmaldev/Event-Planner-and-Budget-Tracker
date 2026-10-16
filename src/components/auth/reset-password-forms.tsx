"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/auth";
import { FieldErrors, FormMessage } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { initialActionState } from "@/lib/result";

const RESET_LINK_REQUIRED_REASON =
  "Aktifkan form ini dengan membukanya melalui tautan reset dari email.";

export function ResetPasswordForms({ token }: { token: string | null }) {
  const [requestState, requestFormAction, requestPending] = useActionState(
    requestPasswordResetAction,
    initialActionState
  );
  const [resetState, resetFormAction, resetPending] = useActionState(
    resetPasswordAction,
    initialActionState
  );

  return (
    <Card className="flex flex-col gap-6 rounded-lg border border-border bg-card p-4 shadow-sm">
      <form
        action={requestFormAction}
        className="flex flex-col gap-4"
        aria-label="Forgot password form"
      >
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-sm text-foreground">Lupa Password</h2>
          <p className="type-caption text-muted-foreground">
            Masukkan email akun untuk meminta tautan reset.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-request-email" className="type-body">
            Email
          </Label>
          <Input
            id="reset-request-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="organizer@example.com"
            required
          />
        </div>

        <FormMessage state={requestState} />
        <FieldErrors errors={requestState.fieldErrors} />

        <Button
          type="submit"
          disabled={requestPending}
          data-action-id="ACT-14"
        >
          {requestPending ? "Memproses..." : "Request Reset Instructions"}
        </Button>
      </form>

      <Separator />

      <form
        action={resetFormAction}
        className="flex flex-col gap-4"
        aria-label="Set new password form"
      >
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-sm text-foreground">Atur Password Baru</h2>
          <p className="type-caption text-muted-foreground">
            {token
              ? "Tautan reset terdeteksi. Masukkan password baru Anda."
              : RESET_LINK_REQUIRED_REASON}
          </p>
        </div>

        {token ? <input type="hidden" name="token" value={token} /> : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-new-password" className="type-body">
            Password Baru (minimal 8 karakter)
          </Label>
          <Input
            id="reset-new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            disabled={!token}
          />
        </div>

        <FormMessage state={resetState} />
        <FieldErrors errors={resetState.fieldErrors} />

        <Button
          type="submit"
          disabled={resetPending || !token}
          title={!token ? RESET_LINK_REQUIRED_REASON : undefined}
          data-action-id="ACT-21"
        >
          {resetPending ? "Memproses..." : "Reset Password"}
        </Button>

        {resetState.status === "success" ? (
          <Link
            href="/login"
            className="type-body text-primary hover:underline"
          >
            Menuju halaman Log In
          </Link>
        ) : null}
      </form>

      <div className="border-t border-border pt-4">
        <Link
          href="/login"
          className="type-body text-primary hover:underline"
        >
          Kembali ke Log In
        </Link>
      </div>
    </Card>
  );
}

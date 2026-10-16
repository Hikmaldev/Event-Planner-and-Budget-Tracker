"use client";

import { Button } from "@/components/ui/button";

export default function ResetPasswordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="type-heading-lg text-foreground">
        Gagal memuat halaman Password Reset
      </h1>
      <p className="mt-2 type-body text-muted-foreground">
        {error.message || "Terjadi kesalahan saat menyiapkan formulir reset password."}
      </p>
      <div className="mt-4">
        <Button type="button" onClick={() => reset()}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}

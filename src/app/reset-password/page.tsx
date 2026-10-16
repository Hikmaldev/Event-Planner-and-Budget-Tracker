import { ResetPasswordForms } from "@/components/auth/reset-password-forms";

export default async function PasswordResetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawToken = params.token;
  const token =
    typeof rawToken === "string" && rawToken.trim().length > 0
      ? rawToken.trim()
      : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-lg text-foreground">Password Reset</h1>
        <p className="type-body text-muted-foreground">
          Minta instruksi reset password atau atur password baru dari tautan
          yang valid.
        </p>
      </div>
      <ResetPasswordForms token={token} />
    </div>
  );
}

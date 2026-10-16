import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LoginRegisterForm } from "@/components/auth/login-register-form";
import { getDemoCredentials } from "@/lib/demo";
import { getCurrentUser } from "@/lib/session";

export default async function LoginAndRegisterPage() {
  await connection();
  const user = await getCurrentUser();
  if (user) {
    redirect("/events");
  }

  const demoCredentials = getDemoCredentials();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-lg text-foreground">Login / Register</h1>
        <p className="type-body text-muted-foreground">
          Masuk untuk mengelola acara Anda, atau buat akun penyelenggara baru.
        </p>
      </div>
      <LoginRegisterForm demoCredentials={demoCredentials} />
    </div>
  );
}

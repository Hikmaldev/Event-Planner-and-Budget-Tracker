import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginRegisterForm } from "@/components/auth/login-register-form";
import { BrandMark } from "@/components/layout/brand-mark";
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
    <div className="grid w-full gap-10 lg:grid-cols-2">
      <LoginBrandPanel />

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 lg:mx-0 lg:max-w-none lg:justify-center">
        <div className="flex flex-col gap-3">
          <BrandMark className="size-11 lg:hidden" />
          <div className="flex flex-col gap-1">
            <h1 className="type-heading-lg text-foreground">
              Login / Register
            </h1>
            <p className="type-body text-muted-foreground">
              Masuk untuk mengelola acara Anda, atau buat akun penyelenggara
              baru.
            </p>
          </div>
        </div>

        <LoginRegisterForm demoCredentials={demoCredentials} />
      </div>
    </div>
  );
}

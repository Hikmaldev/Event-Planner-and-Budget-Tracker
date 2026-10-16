"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { FieldErrors, FormMessage } from "@/components/forms/form-feedback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DemoCredentials } from "@/lib/demo";
import { initialActionState } from "@/lib/result";

export function LoginRegisterForm({
  demoCredentials,
}: {
  demoCredentials: DemoCredentials | null;
}) {
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialActionState
  );
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    initialActionState
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  return (
    <Card className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Tabs defaultValue="login" className="w-full gap-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form
            action={loginFormAction}
            className="flex flex-col gap-4 pt-2"
            aria-label="Log In form"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email" className="type-body">
                Email
              </Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="organizer@example.com"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="type-body">
                  Password
                </Label>
                <Link
                  href="/reset-password"
                  className="type-caption text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </div>

            {demoCredentials ? (
              <div className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-primary/30 bg-primary/5 px-3 py-2">
                <span className="type-caption text-muted-foreground">
                  Akun demo untuk review lokal
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-action-id="ACT-33"
                  onClick={() => {
                    setLoginEmail(demoCredentials.email);
                    setLoginPassword(demoCredentials.password);
                  }}
                >
                  Isi kredensial demo
                </Button>
              </div>
            ) : null}

            <FormMessage state={loginState} />
            <FieldErrors errors={loginState.fieldErrors} />

            <Button
              type="submit"
              disabled={loginPending}
              data-action-id="ACT-01"
            >
              {loginPending ? "Memproses..." : "Log In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form
            action={registerFormAction}
            className="flex flex-col gap-4 pt-2"
            aria-label="Create Account form"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-name" className="type-body">
                Nama (opsional)
              </Label>
              <Input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama penyelenggara"
                maxLength={120}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-email" className="type-body">
                Email
              </Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="organizer@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="register-password" className="type-body">
                Password (minimal 8 karakter)
              </Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </div>

            <FormMessage state={registerState} />
            <FieldErrors errors={registerState.fieldErrors} />

            <Button
              type="submit"
              disabled={registerPending}
              data-action-id="ACT-13"
            >
              {registerPending ? "Memproses..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

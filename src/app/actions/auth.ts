"use server";

import { createHash, randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import {
  errorState,
  rethrowRedirect,
  successState,
  validationErrorState,
} from "@/lib/action-helpers";
import { signIn, signOut } from "@/lib/auth";
import {
  consumePasswordResetToken,
  createUser,
  findUserByEmail,
  replacePasswordResetToken,
  updateUserPassword,
} from "@/lib/data/users";
import { sendPasswordResetEmail } from "@/lib/email";
import { formDataToObject } from "@/lib/form";
import { hashPassword } from "@/lib/password";
import { getRequestOrigin } from "@/lib/request";
import type { ActionState } from "@/lib/result";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resetRequestSchema,
} from "@/lib/validation";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/events",
    });
    return successState();
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof AuthError) {
      return errorState("Email atau password salah.");
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const created = await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
  });

  if (!created.ok) {
    if (created.error.code === "EMAIL_TAKEN") {
      return {
        status: "error",
        message: created.error.message,
        fieldErrors: { email: [created.error.message] },
      };
    }
    return errorState(created.error.message);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/events",
    });
    return successState("Akun berhasil dibuat.");
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof AuthError) {
      return successState(
        "Akun berhasil dibuat. Silakan masuk dengan email dan password Anda."
      );
    }
    throw error;
  }
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetRequestSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const user = await findUserByEmail(parsed.data.email);

  if (user) {
    const token = randomBytes(32).toString("base64url");
    await replacePasswordResetToken(
      user.id,
      hashResetToken(token),
      new Date(Date.now() + RESET_TOKEN_TTL_MS)
    );

    const origin = await getRequestOrigin();
    try {
      await sendPasswordResetEmail(
        user.email,
        `${origin}/reset-password?token=${token}`
      );
    } catch {
      return errorState(
        "Email reset tidak dapat dikirim saat ini. Hubungi administrator."
      );
    }
  }

  return successState(
    "Jika email terdaftar, instruksi reset password telah dikirim."
  );
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const record = await consumePasswordResetToken(
    hashResetToken(parsed.data.token)
  );
  if (!record) {
    return errorState(
      "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru."
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updateUserPassword(record.userId, passwordHash);

  return successState(
    "Password berhasil diperbarui. Silakan masuk dengan password baru."
  );
}

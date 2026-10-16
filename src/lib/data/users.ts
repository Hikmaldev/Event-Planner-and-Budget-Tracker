import { prisma } from "@/lib/db";
import { fail, ok, type DataResult } from "@/lib/result";
import { isUniqueConstraintError } from "./prisma-errors";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
};

export async function createUser(input: {
  email: string;
  name?: string;
  passwordHash: string;
}): Promise<DataResult<UserRecord>> {
  try {
    const user = await prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        name: input.name ?? null,
        passwordHash: input.passwordHash,
      },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    return ok(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail("EMAIL_TAKEN", "Email sudah terdaftar.");
    }
    throw error;
  }
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function replacePasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);
}

export async function consumePasswordResetToken(
  tokenHash: string
): Promise<{ userId: string } | null> {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });

  if (!record) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}

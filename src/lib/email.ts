export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const subject = "Reset password akun Event Planner & Budget Tracker";
  const text = [
    "Kami menerima permintaan untuk mengatur ulang password akun Anda.",
    "",
    `Buka tautan berikut untuk mengatur password baru: ${resetUrl}`,
    "",
    "Tautan berlaku selama 1 jam dan hanya dapat dipakai sekali.",
    "Abaikan email ini jika Anda tidak meminta reset password.",
  ].join("\n");

  if (process.env.NODE_ENV !== "production") {
    // Development transport: no email provider is configured yet (Open Question 8).
    // The reset link is logged server-side so the flow stays testable end-to-end.
    console.info(
      `[dev-email] To: ${to}\n[dev-email] Subject: ${subject}\n[dev-email] ${text}`
    );
    return;
  }

  throw new Error("Email transport is not configured for production.");
}

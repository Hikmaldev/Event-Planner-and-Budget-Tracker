export type DemoCredentials = {
  email: string;
  password: string;
};

/**
 * Demo credentials for local review only.
 *
 * Values come from the environment (`DEMO_EMAIL` / `DEMO_PASSWORD` in `.env`),
 * never from component code. Production always returns null so the autofill
 * button cannot be rendered there.
 */
export function getDemoCredentials(): DemoCredentials | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const email = process.env.DEMO_EMAIL?.trim();
  const password = process.env.DEMO_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

import Link from "next/link";
import { connection } from "next/server";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export async function SessionNav() {
  // Request-time only: auth() must not run during prerendering.
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    // Public screens (login, password reset) carry their own navigation,
    // so the header stays clean for signed-out visitors.
    return null;
  }

  return (
    <>
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Events Dashboard
      </Link>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="sm" data-action-id="ACT-32">
          Logout
        </Button>
      </form>
    </>
  );
}

import { notFound } from "next/navigation";
import { connection } from "next/server";
import { EventWorkspaceView } from "@/components/events/event-workspace-view";
import { getEventWorkspace } from "@/lib/data/events";
import { requireUser } from "@/lib/session";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await connection();
  const { eventId } = await params;
  const user = await requireUser();
  const result = await getEventWorkspace(user.id, eventId);

  if (!result.ok) {
    notFound();
  }

  return <EventWorkspaceView workspace={result.data} />;
}

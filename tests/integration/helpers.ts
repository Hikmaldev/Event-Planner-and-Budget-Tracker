import { deleteEvent } from "@/lib/data/events";
import { prisma } from "@/lib/db";

export function uniqueEmail(label: string): string {
  return `test+${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

export async function cleanupUsers(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    const events = await prisma.event.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    for (const event of events) {
      await deleteEvent(userId, event.id);
    }
    await prisma.user.deleteMany({ where: { id: userId } });
  }
  await prisma.$disconnect();
}

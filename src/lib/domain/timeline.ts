export type MilestoneKey = "H-30" | "H-7" | "H-1" | "H-day";

export type MilestoneState = "past" | "current" | "future";

export type MilestoneDefinition = {
  key: MilestoneKey;
  label: string;
  offsetDays: number;
};

export const MILESTONES: ReadonlyArray<MilestoneDefinition> = [
  { key: "H-30", label: "H-30", offsetDays: 30 },
  { key: "H-7", label: "H-7", offsetDays: 7 },
  { key: "H-1", label: "H-1", offsetDays: 1 },
  { key: "H-day", label: "H-day", offsetDays: 0 },
];

const DAY_MS = 86_400_000;

export function startOfUtcDay(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
}

export function milestoneDate(eventDate: Date, offsetDays: number): Date {
  const result = new Date(startOfUtcDay(eventDate));
  result.setUTCDate(result.getUTCDate() - offsetDays);
  return result;
}

/**
 * Assigns a task deadline to the nearest milestone by absolute day distance.
 * Tasks further out than H-30 clamp to H-30; tasks after the event clamp to
 * H-day. Ties (equidistant milestones) resolve to the earlier milestone.
 */
export function assignTaskToMilestone(
  eventDate: Date,
  deadline: Date
): MilestoneKey {
  const taskOffsetDays = Math.round(
    (startOfUtcDay(eventDate) - startOfUtcDay(deadline)) / DAY_MS
  );

  let best = MILESTONES[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const milestone of MILESTONES) {
    const distance = Math.abs(milestone.offsetDays - taskOffsetDays);
    if (distance < bestDistance) {
      best = milestone;
      bestDistance = distance;
    }
  }
  return best.key;
}

export function computeMilestoneStates(
  eventDate: Date,
  now: Date
): Record<MilestoneKey, MilestoneState> {
  const today = startOfUtcDay(now);
  const firstUpcomingIndex = MILESTONES.findIndex(
    (milestone) =>
      milestoneDate(eventDate, milestone.offsetDays).getTime() >= today
  );

  const states = {} as Record<MilestoneKey, MilestoneState>;
  MILESTONES.forEach((milestone, index) => {
    if (firstUpcomingIndex === -1) {
      states[milestone.key] = "past";
    } else if (index < firstUpcomingIndex) {
      states[milestone.key] = "past";
    } else if (index === firstUpcomingIndex) {
      states[milestone.key] = "current";
    } else {
      states[milestone.key] = "future";
    }
  });
  return states;
}

export type TimelineTaskLike = {
  deadline: Date;
};

export function groupTasksByMilestone<T extends TimelineTaskLike>(
  eventDate: Date,
  tasks: ReadonlyArray<T>
): Record<MilestoneKey, T[]> {
  const groups = {
    "H-30": [],
    "H-7": [],
    "H-1": [],
    "H-day": [],
  } as Record<MilestoneKey, T[]>;

  for (const task of tasks) {
    const key = assignTaskToMilestone(eventDate, task.deadline);
    groups[key].push(task);
  }

  for (const key of Object.keys(groups) as MilestoneKey[]) {
    groups[key].sort(
      (a, b) => a.deadline.getTime() - b.deadline.getTime()
    );
  }
  return groups;
}

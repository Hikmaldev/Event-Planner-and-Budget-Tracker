import { describe, expect, it } from "vitest";
import {
  assignTaskToMilestone,
  computeMilestoneStates,
  groupTasksByMilestone,
} from "@/lib/domain/timeline";

const EVENT_DATE = new Date("2026-12-20T00:00:00.000Z");
const day = (offset: number) =>
  new Date(Date.UTC(2026, 11, 20 + offset));

describe("assignTaskToMilestone", () => {
  it("assigns tasks to the nearest milestone by day distance", () => {
    expect(assignTaskToMilestone(EVENT_DATE, day(-30))).toBe("H-30");
    expect(assignTaskToMilestone(EVENT_DATE, day(-7))).toBe("H-7");
    expect(assignTaskToMilestone(EVENT_DATE, day(-1))).toBe("H-1");
    expect(assignTaskToMilestone(EVENT_DATE, day(0))).toBe("H-day");
  });

  it("clamps tasks further out than H-30", () => {
    expect(assignTaskToMilestone(EVENT_DATE, day(-49))).toBe("H-30");
    expect(assignTaskToMilestone(EVENT_DATE, day(-200))).toBe("H-30");
  });

  it("clamps tasks after the event to H-day", () => {
    expect(assignTaskToMilestone(EVENT_DATE, day(5))).toBe("H-day");
  });

  it("resolves ties to the earlier milestone", () => {
    // 4 days before the event: H-7 and H-1 are both 3 days away.
    expect(assignTaskToMilestone(EVENT_DATE, day(-4))).toBe("H-7");
  });
});

describe("computeMilestoneStates", () => {
  it("marks passed milestones past, the nearest upcoming current, and the rest future", () => {
    const states = computeMilestoneStates(
      EVENT_DATE,
      new Date("2026-11-25T08:00:00.000Z")
    );
    expect(states).toEqual({
      "H-30": "past",
      "H-7": "current",
      "H-1": "future",
      "H-day": "future",
    });
  });

  it("treats a milestone day as current, not past", () => {
    const states = computeMilestoneStates(
      EVENT_DATE,
      new Date("2026-11-20T00:00:00.000Z")
    );
    expect(states["H-30"]).toBe("current");
    expect(states["H-7"]).toBe("future");
  });

  it("marks every milestone past once the event has passed", () => {
    const states = computeMilestoneStates(
      EVENT_DATE,
      new Date("2026-12-25T00:00:00.000Z")
    );
    expect(Object.values(states).every((state) => state === "past")).toBe(true);
  });
});

describe("groupTasksByMilestone", () => {
  it("groups tasks and sorts each group by deadline", () => {
    const tasks = [
      { id: "a", deadline: day(-8) },
      { id: "b", deadline: day(-6) },
      { id: "c", deadline: day(0) },
      { id: "d", deadline: day(-60) },
    ];
    const groups = groupTasksByMilestone(EVENT_DATE, tasks);
    expect(groups["H-7"].map((t) => t.id)).toEqual(["a", "b"]);
    expect(groups["H-30"].map((t) => t.id)).toEqual(["d"]);
    expect(groups["H-day"].map((t) => t.id)).toEqual(["c"]);
    expect(groups["H-1"]).toEqual([]);
  });
});

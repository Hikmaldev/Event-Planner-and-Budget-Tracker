import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("project structure", () => {
  it("keeps every PRD screen and data layer module present", () => {
    const requiredFiles = [
      "src/app/layout.tsx",
      "src/app/events/page.tsx",
      "src/app/events/[eventId]/page.tsx",
      "src/app/login/page.tsx",
      "src/app/reset-password/page.tsx",
      "src/lib/data/events.ts",
      "src/lib/data/vendors.ts",
      "src/lib/data/budget.ts",
      "src/lib/data/tasks.ts",
      "src/lib/data/users.ts",
      "src/lib/domain/budget.ts",
      "src/lib/domain/payment.ts",
      "src/lib/domain/timeline.ts",
      "src/lib/auth.ts",
      "src/lib/format.ts",
      "prisma/schema.prisma",
    ];

    for (const rel of requiredFiles) {
      const abs = path.join(process.cwd(), rel);
      expect(fs.existsSync(abs), `Missing required file: ${rel}`).toBe(true);
    }
  });

  it("keeps design system tokens configured in globals.css", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "src/app/globals.css"),
      "utf8"
    );

    for (const token of [
      "#18181B",
      "#71717A",
      "#FFFFFF",
      "#E4E4E7",
      "#3B5BDB",
      "--budget-under: #1A7F4C",
      "--budget-near: #B8860B",
      "--budget-over: #C0362C",
      "--contract-negotiating: #71717A",
      "--contract-active: #3B5BDB",
      "--contract-cancelled: #A1A1AA",
      "--payment-unpaid: #C0362C",
      "--payment-partial: #B8860B",
      "--payment-complete: #1A7F4C",
      "--task-upcoming: #71717A",
      "--task-overdue: #C0362C",
      "--task-complete: #1A7F4C",
      "--timeline-past: #E4E4E7",
      "--timeline-current: #3B5BDB",
      "--timeline-future: #A1A1AA",
    ]) {
      expect(css.includes(token), `Missing design token: ${token}`).toBe(true);
    }
  });

  it("documents the database referential actions in the Prisma schema", () => {
    const schema = fs.readFileSync(
      path.join(process.cwd(), "prisma/schema.prisma"),
      "utf8"
    );

    for (const fragment of [
      "onDelete: Restrict",
      "onDelete: Cascade",
      "onDelete: SetNull",
    ]) {
      expect(schema.includes(fragment), `Missing ${fragment}`).toBe(true);
    }
  });
});

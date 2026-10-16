import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  eventCreateSchema,
  registerSchema,
  resetPasswordSchema,
  taskCreateSchema,
  vendorPaymentSchema,
} from "@/lib/validation";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}

describe("registerSchema", () => {
  it("normalizes email casing and trims it", () => {
    const parsed = registerSchema.safeParse({
      name: "",
      email: "  Organizer@Example.COM ",
      password: "password123",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("organizer@example.com");
      expect(parsed.data.name).toBeUndefined();
    }
  });

  it("rejects short passwords and invalid emails", () => {
    const parsed = registerSchema.safeParse({
      email: "not-an-email",
      password: "short",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

describe("eventCreateSchema", () => {
  it("parses Indonesia-style form strings into typed values", () => {
    const parsed = eventCreateSchema.safeParse({
      name: "  Wedding  ",
      eventDate: "2026-12-20",
      location: "",
      totalTargetBudget: "40000000",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Wedding");
      expect(parsed.data.location).toBeUndefined();
      expect(parsed.data.totalTargetBudget).toBe(40_000_000);
      expect(parsed.data.eventDate.toISOString()).toBe(
        "2026-12-20T00:00:00.000Z"
      );
    }
  });

  it("rejects negative money, empty names, and missing dates", () => {
    const parsed = eventCreateSchema.safeParse({
      name: "   ",
      eventDate: "",
      totalTargetBudget: "-1",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      expect(errors.name).toBeDefined();
      expect(errors.eventDate).toBeDefined();
      expect(errors.totalTargetBudget).toBeDefined();
    }
  });
});

describe("vendorPaymentSchema", () => {
  it("accepts a consistent pair and coerces the amount", () => {
    const parsed = vendorPaymentSchema.safeParse({
      vendorId: "vendor-1",
      eventId: "event-1",
      amountPaid: "38500000",
      paymentStatus: "DOWN_PAYMENT",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.amountPaid).toBe(38_500_000);
    }
  });

  it("rejects negative amounts and unknown statuses", () => {
    const parsed = vendorPaymentSchema.safeParse({
      vendorId: "vendor-1",
      eventId: "event-1",
      amountPaid: "-5",
      paymentStatus: "REFUNDED",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("taskCreateSchema", () => {
  it("maps an empty vendor link to undefined", () => {
    const parsed = taskCreateSchema.safeParse({
      eventId: "event-1",
      title: "Konfirmasi katering",
      deadline: "2026-12-13",
      description: "",
      vendorId: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.vendorId).toBeUndefined();
      expect(parsed.data.description).toBeUndefined();
      expect(parsed.data.deadline.toISOString()).toBe(
        "2026-12-13T00:00:00.000Z"
      );
    }
  });

  it("rejects missing deadlines", () => {
    const parsed = taskCreateSchema.safeParse({
      eventId: "event-1",
      title: "Tugas",
      deadline: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrors(parsed.error).deadline).toBeDefined();
    }
  });
});

describe("resetPasswordSchema", () => {
  it("rejects empty tokens and short passwords", () => {
    const parsed = resetPasswordSchema.safeParse({
      token: "",
      password: "short",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      expect(errors.token).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

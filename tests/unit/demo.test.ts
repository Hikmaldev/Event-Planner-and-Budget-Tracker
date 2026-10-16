import { afterEach, describe, expect, it, vi } from "vitest";
import { getDemoCredentials } from "@/lib/demo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getDemoCredentials", () => {
  it("never returns credentials in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_EMAIL", "demo@example.com");
    vi.stubEnv("DEMO_PASSWORD", "demo12345");

    expect(getDemoCredentials()).toBeNull();
  });

  it("returns null when the demo account is not configured", () => {
    vi.stubEnv("DEMO_EMAIL", "");
    vi.stubEnv("DEMO_PASSWORD", "");

    expect(getDemoCredentials()).toBeNull();
  });

  it("returns trimmed credentials outside production", () => {
    vi.stubEnv("DEMO_EMAIL", "  demo@example.com  ");
    vi.stubEnv("DEMO_PASSWORD", "demo12345");

    expect(getDemoCredentials()).toEqual({
      email: "demo@example.com",
      password: "demo12345",
    });
  });
});

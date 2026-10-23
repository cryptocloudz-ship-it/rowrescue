import { describe, it, expect } from "vitest";
import { hasSessionCookie } from "../clientAuth";

describe("hasSessionCookie", () => {
  it("reads Clerk's client_uat cookie", () => {
    expect(hasSessionCookie("")).toBe(false);
    expect(hasSessionCookie("__client_uat=0")).toBe(false);
    expect(hasSessionCookie("theme=dark; __client_uat=1761200000")).toBe(true);
    expect(hasSessionCookie("__client_uat_8LUcK322=1761200000")).toBe(true);
  });

  it("trusts the suffixed cookie over the plain one, as Clerk does", () => {
    expect(hasSessionCookie("__client_uat_8LUcK322=0; __client_uat=1761200000")).toBe(false);
    expect(hasSessionCookie("__client_uat=0; __client_uat_8LUcK322=1761200000")).toBe(true);
  });

  it("ignores lookalike names", () => {
    expect(hasSessionCookie("__client_uat_=1761200000; x__client_uat=1")).toBe(false);
  });
});

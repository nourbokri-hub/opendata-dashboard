import { expect, test } from "@jest/globals";
import { isExpiredSessionError } from "../utils/authErrors";

test("recognizes expired sessions without treating forbidden resources as expired", () => {
  expect(isExpiredSessionError({
    response: { status: 401 },
    config: { url: "/datasets" },
  })).toBe(true);
  expect(isExpiredSessionError({
    response: { status: 403 },
    config: { url: "/api/datasets" },
  })).toBe(false);
});

test("does not treat invalid login credentials as an expired session", () => {
  expect(isExpiredSessionError({
    response: { status: 401 },
    config: { url: "/auth/login" },
  })).toBe(false);
});

test("does not sign out an authenticated non-admin on admin endpoints", () => {
  expect(isExpiredSessionError({
    response: { status: 403 },
    config: { url: "/api/admin/stats" },
  })).toBe(false);
});

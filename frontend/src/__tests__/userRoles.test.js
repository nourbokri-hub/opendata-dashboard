import { expect, test } from "@jest/globals";
import { getUserRole, isAdminUser } from "../utils/userRoles";

test("recognizes admin role from backend user response", () => {
  expect(isAdminUser({ role: "ADMIN" })).toBe(true);
  expect(getUserRole({ role: "ADMIN" })).toBe("ADMIN");
});

test("normalizes Spring-style and array role values", () => {
  expect(isAdminUser({ role: "ROLE_ADMIN" })).toBe(true);
  expect(isAdminUser({ roles: ["ADMIN"] })).toBe(true);
});

test("does not grant admin access to a regular or missing role", () => {
  expect(isAdminUser({ role: "USER" })).toBe(false);
  expect(isAdminUser(null)).toBe(false);
});

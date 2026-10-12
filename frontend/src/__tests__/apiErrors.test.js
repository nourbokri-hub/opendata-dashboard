import { expect, test } from "@jest/globals";
import { getApiErrorMessage } from "../utils/apiErrors";

test("uses backend validation messages and field errors", () => {
  expect(getApiErrorMessage({
    response: { data: { message: "Le nom est obligatoire.", fieldErrors: { name: "Le nom est obligatoire." } } },
  })).toBe("Le nom est obligatoire.");
});

test("provides clear permission, missing-resource, and payload-size errors", () => {
  expect(getApiErrorMessage({ response: { status: 403 } })).toContain("autorisation");
  expect(getApiErrorMessage({ response: { status: 404 } })).toContain("introuvable");
  expect(getApiErrorMessage({ response: { status: 413 } })).toContain("25 Mio");
});

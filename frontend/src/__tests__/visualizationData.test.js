import { expect, test } from "@jest/globals";
import {
  buildHistogram,
  getDatasetColumns,
  getNumericColumns,
  getNumericStats,
  isNumericColumn,
  parseNumericValue,
} from "../utils/visualizationData";

test("reads numeric values without treating empty strings as zero", () => {
  expect(parseNumericValue(" 1 234,5 ")).toBe(1234.5);
  expect(parseNumericValue("")).toBeNull();
  expect(parseNumericValue("not a number")).toBeNull();
});

test("collects columns from all rows and detects numeric columns", () => {
  const rows = [{ city: "Tunis", count: "3" }, { population: 120, count: "4,5" }];
  expect(getDatasetColumns(rows)).toEqual(["city", "count", "population"]);
  expect(isNumericColumn(rows, "count")).toBe(true);
  expect(isNumericColumn(rows, "city")).toBe(false);
  expect(getNumericColumns(rows)).toEqual(["count", "population"]);
});

test("computes descriptive values only from valid numeric cells", () => {
  expect(getNumericStats([{ value: "2" }, { value: "4,5" }, { value: "" }], "value")).toEqual({
    count: 2,
    min: 2,
    max: 4.5,
    average: 3.25,
  });
  expect(getNumericStats([{ value: "x" }], "value")).toBeNull();
});

test("builds histogram bins from actual rows and handles constant values", () => {
  expect(buildHistogram([{ value: 1 }, { value: 2 }, { value: 3 }], "value", 2)).toEqual({
    labels: ["1–2", "2–3 (inclus)"],
    values: [1, 2],
  });
  expect(buildHistogram([{ value: 4 }, { value: 4 }], "value")).toEqual({
    labels: ["4"],
    values: [2],
  });
});

import { expect, test } from "@jest/globals";
import { parseDatasetFile } from "../utils/datasetParser";

test("parseDatasetFile parses a JSON array of records", async () => {
  const file = {
    name: "population.json",
    text: async () => '[{"region":"Tunis","population":120}]',
  };

  await expect(parseDatasetFile(file)).resolves.toEqual({
    fileName: "population.json",
    rows: [{ region: "Tunis", population: 120 }],
    columns: ["region", "population"],
  });
});

test("parseDatasetFile parses a CSV header and its records", async () => {
  const file = new File(
    ["region,population\nTunis,120"],
    "population.csv",
    { type: "text/csv" }
  );

  await expect(parseDatasetFile(file)).resolves.toEqual({
    fileName: "population.csv",
    rows: [{ region: "Tunis", population: "120" }],
    columns: ["region", "population"],
  });
});

test("parseDatasetFile rejects malformed JSON with a readable error", async () => {
  const file = { name: "invalid.json", text: async () => "{" };

  await expect(parseDatasetFile(file)).rejects.toThrow("Le fichier JSON est invalide.");
});

test("parseDatasetFile rejects unsupported spreadsheet formats explicitly", async () => {
  await expect(
    parseDatasetFile({ name: "table.xlsx", text: async () => "" })
  ).rejects.toThrow("Format non pris en charge");
});

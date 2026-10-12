import { expect, test } from "@jest/globals";

// Exemple de fonction de filtrage (tu peux adapter à ton code réel)
function filterByName(items, query) {
  const q = query.toLowerCase();
  return items.filter((x) => x.name.toLowerCase().includes(q));
}

test("filterByName filters datasets by name", () => {
  const datasets = [
    { name: "Transport" },
    { name: "Environment" },
    { name: "Economy" },
  ];

  const result = filterByName(datasets, "trans");
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("Transport");
});

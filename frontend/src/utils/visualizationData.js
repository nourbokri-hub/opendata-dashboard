export function parseNumericValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;

  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getDatasetColumns(rows) {
  const columns = new Set();
  for (const row of rows) {
    if (row && typeof row === "object") {
      for (const column of Object.keys(row)) columns.add(column);
    }
  }
  return Array.from(columns);
}

export function getNumericColumns(rows, columns = getDatasetColumns(rows)) {
  const numericColumns = new Set();
  for (const row of rows) {
    for (const column of columns) {
      if (!numericColumns.has(column) && parseNumericValue(row?.[column]) !== null) {
        numericColumns.add(column);
      }
    }
    if (numericColumns.size === columns.length) break;
  }
  return columns.filter((column) => numericColumns.has(column));
}

export function isNumericColumn(rows, column) {
  for (const row of rows) {
    if (parseNumericValue(row?.[column]) !== null) return true;
  }
  return false;
}

export function getNumericStats(rows, column) {
  const summary = { sum: 0, count: 0, min: Infinity, max: -Infinity };
  for (const row of rows) {
    const value = parseNumericValue(row?.[column]);
    if (value === null) continue;
    summary.sum += value;
    summary.count += 1;
    summary.min = Math.min(summary.min, value);
    summary.max = Math.max(summary.max, value);
  }
  if (!summary.count) return null;
  return {
    count: summary.count,
    min: summary.min,
    max: summary.max,
    average: summary.sum / summary.count,
  };
}

export function buildHistogram(rows, column, requestedBins = 10) {
  let min = Infinity;
  let max = -Infinity;
  const values = [];
  for (const row of rows) {
    const value = parseNumericValue(row?.[column]);
    if (value === null) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
    values.push(value);
  }
  if (!values.length) return { labels: [], values: [] };
  if (min === max) {
    return { labels: [`${min}`], values: [values.length] };
  }

  const binCount = Math.max(1, Math.min(requestedBins, values.length));
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    lower: min + width * index,
    upper: index === binCount - 1 ? max : min + width * (index + 1),
    count: 0,
  }));

  for (const value of values) {
    const index = Math.min(Math.floor((value - min) / width), binCount - 1);
    bins[index].count += 1;
  }

  return {
    labels: bins.map(
      ({ lower, upper }, index) =>
        `${formatNumber(lower)}–${formatNumber(upper)}${index === binCount - 1 ? " (inclus)" : ""}`
    ),
    values: bins.map(({ count }) => count),
  };
}

function formatNumber(value) {
  return Number(value.toPrecision(4)).toLocaleString("fr-FR");
}

import Papa from "papaparse";

const toRows = (value) => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  throw new Error("Le JSON doit contenir un tableau d'objets (ou une propriété data).");
};

const validateRows = (rows) => {
  if (!rows.length || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error("Le fichier doit contenir au moins une ligne sous forme d'objet.");
  }
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  if (!columns.length) {
    throw new Error("Aucune colonne n'a été trouvée dans le fichier.");
  }
  return { rows, columns };
};

export async function parseDatasetFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      throw new Error("Le fichier JSON est invalide.");
    }
    return { fileName: file.name, ...validateRows(toRows(parsed)) };
  }

  if (extension !== "csv") {
    throw new Error("Format non pris en charge. Sélectionnez un fichier CSV ou JSON.");
  }

  const result = await new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => resolve(parsed),
      error: (error) => reject(new Error(error.message || "Erreur de lecture du CSV.")),
    });
  });

  if (result.errors?.length) {
    throw new Error(`CSV invalide : ${result.errors[0].message}`);
  }
  return { fileName: file.name, ...validateRows(result.data || []) };
}

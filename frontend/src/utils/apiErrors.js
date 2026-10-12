export function getApiErrorMessage(error, fallback = "Une erreur est survenue.") {
  const response = error?.response;
  const data = response?.data ?? error;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;

  const firstFieldError = Object.values(data?.fieldErrors || {}).find(
    (message) => typeof message === "string" && message.trim()
  );
  if (firstFieldError) return firstFieldError;

  switch (response?.status ?? error?.status) {
    case 403:
      return "Vous n'avez pas l'autorisation d'effectuer cette action.";
    case 404:
      return "Ce dataset est introuvable ou vous n'êtes pas autorisé à y accéder.";
    case 413:
      return "La requête dépasse la taille maximale autorisée de 25 Mio.";
    default:
      return error?.message || fallback;
  }
}

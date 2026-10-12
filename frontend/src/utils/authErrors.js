export function isExpiredSessionError(error) {
  const status = error?.response?.status;
  const path = (error?.config?.url || "").split("?")[0];

  if (status === 401) {
    return !/(^|\/)auth\/(login|register)(\/|$)/.test(path);
  }

  return false;
}

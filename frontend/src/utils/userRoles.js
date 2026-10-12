export function getUserRole(user) {
  const role = user?.role ?? user?.roles;
  const firstRole = Array.isArray(role) ? role[0] : role;

  return typeof firstRole === "string"
    ? firstRole.replace(/^ROLE_/i, "").toUpperCase()
    : "";
}

export function isAdminUser(user) {
  return getUserRole(user) === "ADMIN";
}

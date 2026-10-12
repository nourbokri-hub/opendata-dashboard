import http from "../api/axiosConfig";

export const api = {
  login: (email, password) => http.post("/auth/login", { email, password }),
  register: (name, email, password) =>
    http.post("/auth/register", { name, email, password }),
  updateProfile: (profile) => http.put("/auth/profile", profile),
  uploadDataset: (dataset) => http.post("/datasets/upload", dataset),
  getAllDatasets: () => http.get("/datasets"),
  getArchivedDatasets: () => http.get("/datasets/archives"),
  updateDataset: (id, patch) => http.put(`/datasets/${id}`, patch),
  archiveDataset: (id) => http.put(`/datasets/${id}/archive`),
  unarchiveDataset: (id) => http.put(`/datasets/${id}/unarchive`),
  deleteDataset: (id) => http.delete(`/datasets/${id}`),
};

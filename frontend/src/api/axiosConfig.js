import axios from 'axios';
import { isExpiredSessionError } from "../utils/authErrors";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Intercepteur pour envoyer le token automatiquement dans chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ERR_NETWORK") {
            error.message =
                "Impossible de joindre l'API. Vérifiez que Spring Boot est démarré, que VITE_BACKEND_URL ou VITE_API_URL est correct et, pour un appel direct, que l'origine est autorisée par CORS.";
        }
        if (isExpiredSessionError(error)) {
            window.dispatchEvent(new Event("opendata:session-expired"));
        }
        return Promise.reject(error);
    }
);

export default api;
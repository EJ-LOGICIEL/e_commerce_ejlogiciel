import axios, {AxiosInstance} from "axios";
import {ACCESS_TOKEN} from "@/utils/constant";

const api: AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8001/api',
    withCredentials: true,
});

// Intercepteur pour les requêtes - ajoute le token d'authentification
api.interceptors.request.use(
    config => {
        const token: string | null = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses - gestion des erreurs
api.interceptors.response.use(
    response => response,
    error => {
        // Gestion des erreurs 401 (non autorisé)
        if (error.response && error.response.status === 401) {
            // Rediriger vers la page de connexion si nécessaire
            if (typeof window !== 'undefined') {
                window.location.href = '/se-connecter';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

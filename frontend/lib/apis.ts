import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {ACCESS_TOKEN, API_BASE_URL} from "@/utils/constants";

// Configuration par défaut
const config: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

const api: AxiosInstance = axios.create(config);

// Intercepteur pour les requêtes
api.interceptors.request.use((config) => {
  const token: string | null = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 (non autorisé) et qu'on n'a pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de rafraîchissement du token
        const newToken: string | null = await refreshToken();
        if (newToken) {
          // Si on a obtenu un nouveau token, on réessaie la requête originale
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, on redirige vers la page de connexion
        console.error("Échec du rafraîchissement du token", refreshError);
        localStorage.removeItem(ACCESS_TOKEN);
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fonction pour rafraîchir le token d'authentification
const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/refresh/`, {}, {
      withCredentials: true,
    });
    const newToken: string = response.data.access;
    localStorage.setItem(ACCESS_TOKEN, newToken);
    return newToken;
  } catch (error) {
    console.error("Échec du rafraîchissement du token", error);
    return null;
  }
};

export default api;

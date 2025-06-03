import axios, {AxiosInstance} from "axios";
import {store} from "@/redux/store";
import {updateToken} from "@/features/user/userSlice";

const api: AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8001/api',
    withCredentials: true,
});

api.interceptors.response.use(
    config => {
        const token: string | null = store.getState().user.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    const token: string | null = store.getState().user.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newToken: string | null = await refreshToken();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

const refreshToken = async () => {
    try {
        const response = await api.post("/refresh/");
        const newToken: string = response.data.access;
        store.dispatch(updateToken(newToken));
        return newToken;
    } catch (error) {
        console.error("Failed to refresh token", error);
        return null;
    }
};

export default api;

import axios, {AxiosInstance} from "axios";
import {ACCESS_TOKEN} from "@/utils/constant";

const api: AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8001/api',
    withCredentials: true,
});

api.interceptors.request.use(
    config => {
        const token: string | null = sessionStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const response = await api.post(
                    `http://127.0.0.1:8001/api/refresh/`,
                    {},
                    {withCredentials: true}
                )

                const newToken: string = response.data.access
                sessionStorage.setItem(ACCESS_TOKEN, newToken)

                originalRequest.headers.Authorization = `Bearer ${newToken}`

                return api(originalRequest)
            } catch (refreshError) {
                sessionStorage.removeItem(ACCESS_TOKEN)
                window.location.href = '/se-connecter'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)
export default api;
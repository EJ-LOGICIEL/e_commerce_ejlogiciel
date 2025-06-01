export const ACCESS_TOKEN: string = '_xtr_tk_dj';
export const USER_NAME: string = 'userName';

// API URLs
export const API_BASE_URL: string = 'http://localhost:8001';
export const API_ROUTES = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/token/`,
  SIGNUP: `${API_BASE_URL}/api/signup/`,
  REFRESH: `${API_BASE_URL}/api/refresh/`,
  LOGOUT: `${API_BASE_URL}/api/logout/`,

  // Resources
  CLIENTS: `${API_BASE_URL}/api/clients/`,
  PRODUITS: `${API_BASE_URL}/api/produits/`,
  ACTIONS: `${API_BASE_URL}/api/actions/`,
  CATEGORIES: `${API_BASE_URL}/api/categories/`,
  STATS: `${API_BASE_URL}/api/stats/`,
};

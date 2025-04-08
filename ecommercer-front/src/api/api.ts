import axios, { AxiosRequestConfig } from 'axios';

// Define la URL base de la API
const API_BASE_URL = 'http://localhost:3020'; // Base URL de la API

// Crea una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Agrega un interceptor para incluir el token CSRF en todas las solicitudes
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken; // Agrega el token CSRF a los encabezados
  }

  return config;
});

// Métodos reutilizables
export const get = async (url: string, params?: Record<string, any>) => {
  const config: AxiosRequestConfig = { params };
  const response = await api.get(url, config);
  return response.data;
};

export const post = async (url: string, body: any, params?: Record<string, any>) => {
  const config: AxiosRequestConfig = { params };
  const response = await api.post(url, body, config);
  return response.data;
};

export const put = async (url: string, body: any, params?: Record<string, any>) => {
  const config: AxiosRequestConfig = { params };
  const response = await api.put(url, body, config);
  return response.data;
};

export const del = async (url: string, params?: Record<string, any>) => {
  const config: AxiosRequestConfig = { params };
  const response = await api.delete(url, config);
  return response.data;
};

export default api;
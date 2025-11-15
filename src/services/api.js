import axios from 'axios';
import { getAccessToken, clearTokens } from './httpClient';

// Asegurar que la URL base siempre termine en /api
const getBaseURL = () => {
	const envURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
	// Si la URL no termina en /api, agregarlo
	if (!envURL.endsWith('/api')) {
		return envURL.endsWith('/') ? `${envURL}api` : `${envURL}/api`;
	}
	return envURL;
};

const API_BASE_URL = getBaseURL();

// Crear instancia de axios
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
	(config) => {
		const token = getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor para manejar errores
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Token expirado, intentar refresh
			const refreshToken = localStorage.getItem('auth_refresh_token');
			if (refreshToken) {
				try {
					const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
						refresh: refreshToken,
					});
					localStorage.setItem('auth_access_token', response.data.access);
					// Reintentar request original
					error.config.headers.Authorization = `Bearer ${response.data.access}`;
					return api.request(error.config);
				} catch (refreshError) {
					// Refresh falló, redirigir a login
					clearTokens();
					window.location.href = '/login';
				}
			}
		}
		return Promise.reject(error);
	}
);

// API de Cruces
export const crucesAPI = {
	getAll: (params = {}) => api.get('/cruces/', { params }),
	getById: (id) => api.get(`/cruces/${id}/`),
	create: (data) => api.post('/cruces/', data),
	update: (id, data) => api.put(`/cruces/${id}/`, data),
	patch: (id, data) => api.patch(`/cruces/${id}/`, data),
	delete: (id) => api.delete(`/cruces/${id}/`),
	getDashboard: () => api.get('/cruces/dashboard/'),
	getMapa: (params = {}) => api.get('/cruces/mapa/', { params }),
	export: (params = {}) => api.get('/cruces/exportar/', { params, responseType: 'blob' }),
};

// API de Telemetría
export const telemetriaAPI = {
	getAll: (params = {}) => api.get('/telemetria/', { params }),
	getById: (id) => api.get(`/telemetria/${id}/`),
	getByCruce: (cruceId, params = {}) => api.get('/telemetria/', { 
		params: { cruce: cruceId, ...params } 
	}),
	export: (params = {}) => api.get('/telemetria/exportar/', { params, responseType: 'blob' }),
};

// API de Sensores
export const sensoresAPI = {
	getAll: (params = {}) => api.get('/sensores/', { params }),
	getById: (id) => api.get(`/sensores/${id}/`),
	getByCruce: (cruceId) => api.get('/sensores/', { params: { cruce: cruceId } }),
	create: (data) => api.post('/sensores/', data),
	update: (id, data) => api.put(`/sensores/${id}/`, data),
	delete: (id) => api.delete(`/sensores/${id}/`),
};

// API de Alertas
export const alertasAPI = {
	getAll: (params = {}) => api.get('/alertas/', { params }),
	getById: (id) => api.get(`/alertas/${id}/`),
	getByCruce: (cruceId, params = {}) => api.get('/alertas/', { params: { cruce: cruceId, ...params } }),
	markResolved: (id) => api.patch(`/alertas/${id}/`, { resolved: true }),
	getDashboard: () => api.get('/alertas/dashboard/'),
	export: (params = {}) => api.get('/alertas/exportar/', { params, responseType: 'blob' }),
};

// API de Autenticación
export const authAPI = {
	login: (email, password) => api.post('/login', { email, password }),
	logout: () => api.post('/logout'),
	register: (data) => api.post('/register', data),
	getProfile: () => api.get('/profile'),
	updateProfile: (data) => api.put('/profile', data),
};

export default api;


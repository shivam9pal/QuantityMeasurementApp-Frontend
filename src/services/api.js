import axios from 'axios';

// In development, requests go through Vite proxy
// In production, use the backend URL directly
const API_BASE_URL = 'https://api.smartmeeter.online';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to EVERY request (except auth)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ JWT Token added to request header');
      console.log('   Token:', token.substring(0, 30) + '...');
      console.log('   Endpoint:', config.url);
    } else {
      console.log('⚠️  No JWT token found - sending request without authentication');
      console.log('   Endpoint:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.message);
    
    // If token is invalid or expired, clear it
    if (error.response?.status === 401) {
      console.log('🚨 Unauthorized (401) - Clearing token and redirecting to login');
      localStorage.removeItem('jwt');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  signup: (username, password) =>
    api.post('/auth/signup', { username, password }),
};

export const measurementService = {
  compare: (thisQuantity, thatQuantity) =>
    api.post('/api/measurements/compare', { thisQuantity, thatQuantity }),
  
  convert: (quantity, targetUnit) =>
    api.post('/api/measurements/convert', { quantity, targetUnit }),
  
  add: (thisQuantity, thatQuantity, targetUnit) =>
    api.post('/api/measurements/add', {
      thisQuantity,
      thatQuantity,
      ...(targetUnit && { targetUnit }),
    }),
  
  subtract: (thisQuantity, thatQuantity, targetUnit) =>
    api.post('/api/measurements/subtract', {
      thisQuantity,
      thatQuantity,
      ...(targetUnit && { targetUnit }),
    }),
  
  divide: (thisQuantity, thatQuantity) =>
    api.post('/api/measurements/divide', { thisQuantity, thatQuantity }),
  
  getHistory: () =>
    api.get('/api/measurements/history'),
  
  getHistoryByOperation: (operation) =>
    api.get(`/api/measurements/history/${operation}`),
};

export default api;

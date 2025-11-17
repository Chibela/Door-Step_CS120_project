import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Menu
export const getMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

// Orders
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Schedules
export const getSchedules = async () => {
  const response = await api.get('/schedules');
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post('/schedules', appointmentData);
  return response.data;
};

// Admin
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Staff
export const getStaff = async () => {
  const response = await api.get('/staff');
  return response.data;
};

export const getTimeSlots = async () => {
  const response = await api.get('/time-slots');
  return response.data;
};

export default api;


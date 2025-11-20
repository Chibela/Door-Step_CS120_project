import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE || '/api';

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

export const getCustomerProfile = async () => {
  const response = await api.get('/customer/profile');
  return response.data;
};

export const updateCustomerProfile = async (profileData) => {
  const response = await api.put('/customer/profile', profileData);
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

export const updateOrder = async (orderId, updates) => {
  const response = await api.put(`/orders/${orderId}`, updates);
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

export const updateAppointment = async (appointmentId, updates) => {
  const response = await api.put(`/schedules/${appointmentId}`, updates);
  return response.data;
};

export const requestShift = async (requestData) => {
  const response = await api.post('/schedules/request', requestData);
  return response.data;
};

// Admin
export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Staff Management (admin)
export const getStaffList = async () => {
  const response = await api.get('/staff');
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post('/staff', staffData);
  return response.data;
};

export const updateStaff = async (email, staffData) => {
  const response = await api.put(`/staff/${encodeURIComponent(email)}`, staffData);
  return response.data;
};

// Staff self-service
export const getStaffProfile = async () => {
  const response = await api.get('/staff/profile');
  return response.data;
};

export const updateStaffProfile = async (profileData) => {
  const response = await api.put('/staff/profile', profileData);
  return response.data;
};

export const getTimeSlots = async () => {
  const response = await api.get('/time-slots');
  return response.data;
};

export const checkScheduleConflicts = async (params) => {
  const response = await api.get('/schedules/conflicts', { params });
  return response.data;
};

// Payments
export const getStripeConfig = async () => {
  const response = await api.get('/payments/config');
  return response.data;
};

export const createPaymentIntent = async (paymentData) => {
  const response = await api.post('/payments/create-intent', paymentData);
  return response.data;
};

export default api;


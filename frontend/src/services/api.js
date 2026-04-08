import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hh_token');
      localStorage.removeItem('hh_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resendOTP = (data) => API.post('/auth/resend-otp', data);
export const getMe = () => API.get('/auth/me');

// Tasks
export const createTask = (data) => API.post('/tasks', data);
export const getFeedTasks = (params) => API.get('/tasks/feed', { params });
export const getMyTasks = (params) => API.get('/tasks/my-tasks', { params });
export const getTask = (id) => API.get(`/tasks/${id}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Requests
export const sendRequest = (data) => API.post('/requests', data);
export const getReceivedRequests = () => API.get('/requests/received');
export const getMyRequests = () => API.get('/requests/my-requests');
export const acceptRequest = (id) => API.put(`/requests/${id}/accept`);
export const rejectRequest = (id) => API.put(`/requests/${id}/reject`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAllRead = () => API.put('/notifications/read-all');
export const markOneRead = (id) => API.put(`/notifications/${id}/read`);

// User
export const updateProfile = (data) => API.put('/users/profile', data);
export const changePassword = (data) => API.put('/users/change-password', data);
export const removeProfilePicture = () => API.put('/users/remove-picture');

export default API;
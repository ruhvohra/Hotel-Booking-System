import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

// Hotels
export const getHotels = (params) => axios.get(`${API}/hotels`, { params }).then(r => r.data);
export const getHotel = (id) => axios.get(`${API}/hotels/${id}`).then(r => r.data);
export const createHotel = (data) => axios.post(`${API}/hotels`, data).then(r => r.data);
export const updateHotel = (id, data) => axios.put(`${API}/hotels/${id}`, data).then(r => r.data);
export const deleteHotel = (id) => axios.delete(`${API}/hotels/${id}`).then(r => r.data);
export const checkAvailability = (id, data) => axios.post(`${API}/hotels/${id}/availability`, data).then(r => r.data);
export const addReview = (id, data) => axios.post(`${API}/hotels/${id}/reviews`, data).then(r => r.data);

// Bookings
export const createBooking = (data) => axios.post(`${API}/bookings`, data).then(r => r.data);
export const getMyBookings = () => axios.get(`${API}/bookings/my-bookings`).then(r => r.data);
export const getBooking = (id) => axios.get(`${API}/bookings/${id}`).then(r => r.data);
export const cancelBooking = (id) => axios.put(`${API}/bookings/${id}/cancel`).then(r => r.data);

// Admin
export const getAdminStats = () => axios.get(`${API}/admin/stats`).then(r => r.data);
export const getAdminBookings = (params) => axios.get(`${API}/admin/bookings`, { params }).then(r => r.data);
export const getAdminUsers = (params) => axios.get(`${API}/admin/users`, { params }).then(r => r.data);
export const updateBookingStatus = (id, data) => axios.put(`${API}/bookings/${id}/status`, data).then(r => r.data);
export const updateUserRole = (id, role) => axios.put(`${API}/admin/users/${id}/role`, { role }).then(r => r.data);
export const seedData = () => axios.post(`${API}/admin/seed`).then(r => r.data);

// Auth
export const updateProfile = (data) => axios.put(`${API}/auth/profile`, data).then(r => r.data);

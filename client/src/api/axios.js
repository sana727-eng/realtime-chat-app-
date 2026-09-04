import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 8000, // fail after 8 seconds instead of hanging indefinitely
});

export default api;
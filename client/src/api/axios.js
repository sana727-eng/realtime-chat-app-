import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required so the httpOnly cookie is sent/received
});

export default api;
import api from './axios';

export const fetchOnlineUsers = () => api.get('/api/presence');
import api from './axios';

export const fetchRooms = () => api.get('/api/rooms');
export const createRoomApi = (name) => api.post('/api/rooms', { name });
export const fetchAllUsers = () => api.get('/api/rooms/users/all');
export const getOrCreateDMApi = (otherUserId) => api.post('/api/rooms/dm', { userId: otherUserId });
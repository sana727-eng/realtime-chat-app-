import api from './axios';

export const fetchRooms = () => api.get('/api/rooms');
export const createRoomApi = (name) => api.post('/api/rooms', { name });
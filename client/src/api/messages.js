import api from './axios';

export const fetchRoomMessages = (roomId) => api.get(`/api/messages/${roomId}`);
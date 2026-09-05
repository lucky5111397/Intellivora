import axios from 'axios';

const ServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const aptitudeApi = axios.create({ baseURL: `${ServerUrl}/api/aptitude`, withCredentials: true });

export const getAptitudeProgress = () => aptitudeApi.get('/progress');
export const getAptitudeCategories = () => aptitudeApi.get('/categories');
export const getAptitudeAttempts = (params) => aptitudeApi.get('/attempts', { params });
export const getAptitudeAttempt = (attemptId) => aptitudeApi.get(`/attempts/${attemptId}`);
export const getActiveAptitudeAttempt = () => aptitudeApi.get('/attempts/active');
export const getAptitudeResult = (attemptId) => aptitudeApi.get(`/attempts/${attemptId}/result`);
export const startAptitudeAttempt = (configuration) => aptitudeApi.post('/attempts', configuration);
export const saveAptitudeAnswer = (attemptId, answer) => aptitudeApi.post(`/attempts/${attemptId}/answers`, answer);
export const submitAptitudeAttempt = (attemptId) => aptitudeApi.post(`/attempts/${attemptId}/submit`);

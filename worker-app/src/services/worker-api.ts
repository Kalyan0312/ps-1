import { apiClient } from './api-client';

const BASE_URL = 'https://api.example.com/worker';

export const getWorkerProfile = async (workerId) => {
    const response = await apiClient.get(`${BASE_URL}/profile/${workerId}`);
    return response.data;
};

export const updateWorkerAvailability = async (workerId, availability) => {
    const response = await apiClient.put(`${BASE_URL}/availability/${workerId}`, { availability });
    return response.data;
};

export const getWorkerEarnings = async (workerId) => {
    const response = await apiClient.get(`${BASE_URL}/earnings/${workerId}`);
    return response.data;
};

export const requestJob = async (workerId, jobDetails) => {
    const response = await apiClient.post(`${BASE_URL}/jobs/request`, { workerId, ...jobDetails });
    return response.data;
};

export const getWorkerJobs = async (workerId) => {
    const response = await apiClient.get(`${BASE_URL}/jobs/${workerId}`);
    return response.data;
};
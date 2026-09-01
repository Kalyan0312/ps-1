import { apiClient } from './api-client';

const BASE_URL = '/api/jobs';

export const getAvailableJobs = async () => {
    const response = await apiClient.get(`${BASE_URL}/available`);
    return response.data;
};

export const acceptJob = async (jobId) => {
    const response = await apiClient.post(`${BASE_URL}/accept`, { jobId });
    return response.data;
};

export const declineJob = async (jobId) => {
    const response = await apiClient.post(`${BASE_URL}/decline`, { jobId });
    return response.data;
};

export const getActiveJob = async (workerId) => {
    const response = await apiClient.get(`${BASE_URL}/active/${workerId}`);
    return response.data;
};

export const startJob = async (jobId) => {
    const response = await apiClient.post(`${BASE_URL}/start`, { jobId });
    return response.data;
};

export const completeJob = async (jobId) => {
    const response = await apiClient.post(`${BASE_URL}/complete`, { jobId });
    return response.data;
};
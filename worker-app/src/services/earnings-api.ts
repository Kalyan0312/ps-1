import { apiClient } from './api-client';

export const getTodaysEarnings = async (workerId) => {
    try {
        const response = await apiClient.get(`/earnings/today/${workerId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching today\'s earnings: ' + error.message);
    }
};

export const getWeeklyEarnings = async (workerId) => {
    try {
        const response = await apiClient.get(`/earnings/weekly/${workerId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching weekly earnings: ' + error.message);
    }
};

export const getTotalJobs = async (workerId) => {
    try {
        const response = await apiClient.get(`/earnings/total-jobs/${workerId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching total jobs: ' + error.message);
    }
};

export const getWelfareInfo = async (workerId) => {
    try {
        const response = await apiClient.get(`/earnings/welfare/${workerId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching welfare information: ' + error.message);
    }
};
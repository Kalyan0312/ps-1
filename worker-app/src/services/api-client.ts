import axios from 'axios';
import { API_BASE_URL } from '../config/api-config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors for request and response can be added here if needed

export default apiClient;
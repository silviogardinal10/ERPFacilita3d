import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('erp3d_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            // Ignorar erro de parse
        }
    }
    return config;
});

export default api;

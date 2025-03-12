import axios from 'axios';
import { API_URL } from '@/constants/api';

export const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, confirmPassword });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    console.log(response.data);
    return response.data;
};

export const logout = async () => {
    const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return response.data;
};

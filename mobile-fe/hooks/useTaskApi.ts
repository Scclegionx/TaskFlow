import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_TASK } from '@/constants/api';

export const createTask = async (taskData: any) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        
        const response = await axios.post(
            `${API_URL_TASK}/create-task`,
            {
                ...taskData,
                createdBy: parseInt(userId || '0'),
            },
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('API Error:', error.response?.data);
        throw new Error(error.response?.data || 'Lỗi khi tạo nhiệm vụ');
    }
};

export const deleteTask = async (taskId: number) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.delete(
            `${API_URL_TASK}/${taskId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data || 'Lỗi khi xóa nhiệm vụ');
    }
};

export const assignTask = async (taskId: number, userId: number) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.put(
            `${API_URL_TASK}/assign`,
            null,
            {
                params: {
                    taskId: taskId,
                    userId: userId
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('API Error:', error.response?.data);
        throw new Error(error.response?.data || 'Lỗi khi gán nhiệm vụ');
    }
};

export const getTaskDetail = async (taskId: number) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
            `${API_URL_TASK}/get-task-detail`,
            {
                params: { taskId },
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data || 'Không thể lấy thông tin nhiệm vụ');
    }
};

export const updateTask = async (taskData: any) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.put(
            `${API_URL_TASK}/update-task`,
            taskData,
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data || 'Không thể cập nhật nhiệm vụ');
    }
};

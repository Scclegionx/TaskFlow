import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_SCHEDULES_URL } from '@/constants/api';

export const getSchedulesByDate = async (date: string) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_URL_SCHEDULES_URL}?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getHighlightedDates = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_URL_SCHEDULES_URL}/highlighted-dates`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const createSchedule = async (schedule: { title: string; startTime: string; endTime: string; priority: string }) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${API_URL_SCHEDULES_URL}`, schedule, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const updateSchedule = async (id: number, schedule: any) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.put(`${API_URL_SCHEDULES_URL}/${id}`, schedule, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const deleteSchedule = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.delete(`${API_URL_SCHEDULES_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getScheduleById = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_URL_SCHEDULES_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

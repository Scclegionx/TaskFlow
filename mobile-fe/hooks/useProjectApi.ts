import axios from "axios";
import {API_URL_project, API_URL_USER_URL} from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const createProject = async ({ name, description, createdBy, fromDate, toDate, userIds }:
                                        { name: string; description: string; createdBy: number; fromDate: Date; toDate: Date; userIds: number[] }) => {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(`${API_URL_project}/create-project`,
        { name, description, createdBy, fromDate, toDate, userIds },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const searchUserByEmail = async (email: string) => {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_URL_USER_URL}/search?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

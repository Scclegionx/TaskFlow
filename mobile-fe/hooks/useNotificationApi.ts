import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_BASE_URL} from "@/constants/api";

export const markNotificationAsRead = async (id: number) => {
    const token = await AsyncStorage.getItem("token");
    console.log("🔐 Token:", token); 

    return axios.put(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};



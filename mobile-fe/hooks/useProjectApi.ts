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
    console.log(response.data);
    return response.data;
};

export const getProjects = async (userId?: number, page: number = 0, size: number = 5) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
        throw new Error("Token không tồn tại");
    }
    const response = await axios.get(`${API_URL_project}/get-project`, {
        params: { 
            userId,
            page,
            size
        },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getProjectById = async (
    id: number, 
    memberPage: number = 0, 
    memberSize: number = 3, 
    taskPage: number = 0, 
    taskSize: number = 5,
) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("Token không tồn tại");
        }
        const response = await axios.get(`${API_URL_project}/${id}`, {
            params: {
                memberPage,
                memberSize,
                taskPage,
                taskSize,
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        throw error;
    }
};

export const getStatusText = (status: number): string => {
    switch (status) {
        case 0:
            return "Chưa bắt đầu";
        case 1:
            return "Đang thực hiện";
        case 2:
            return "Hoàn thành";
        case 3:
            return "Quá hạn";
        default:
            return "Không xác định";
    }
};

interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: number;
    fromDate?: Date;
    toDate?: Date;
}

export const updateProject = async (projectId: number, updateData: UpdateProjectData) => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
        throw new Error("Token hoặc userId không tồn tại");
    }
    
    const response = await axios.put(
        `${API_URL_project}/${projectId}?userId=${userId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteProject = async (projectId: number) => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
        throw new Error("Token hoặc userId không tồn tại");
    }

    const response = await axios.delete(
        `${API_URL_project}/${projectId}?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const addProjectMember = async (projectId: number, userId: number) => {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
        `${API_URL_project}/${projectId}/members`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const removeProjectMember = async (projectId: number, memberId: number) => {
    const token = await AsyncStorage.getItem("token");
    const currentUserId = await AsyncStorage.getItem("userId");
    
    if (!token || !currentUserId) {
        throw new Error("Token hoặc userId không tồn tại");
    }

    try {
        const response = await axios.delete(
            `${API_URL_project}/${projectId}/members/${memberId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId: currentUserId }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data || "Không thể xóa thành viên");
    }
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const searchProjects = async (query: string) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
        throw new Error("Token không tồn tại");
    }
    const response = await axios.get(`${API_URL_project}/search`, {
        params: { query },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const searchProjectMembers = async (projectId: number, searchText: string) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("Token không tồn tại");
        }
        const response = await axios.get(`${API_URL_project}/${projectId}/search-members`, {
            params: { searchText },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi tìm kiếm thành viên:', error);
        throw error;
    }
};

export const searchProjectTasks = async (projectId: number, searchText: string) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("Token không tồn tại");
        }
        const response = await axios.get(`${API_URL_project}/${projectId}/search-tasks`, {
            params: { searchText },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi tìm kiếm công việc:', error);
        throw error;
    }
};

export const getProjectMembers = async (projectId: number) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("Token không tồn tại");
        }
        const response = await axios.get(`${API_URL_project}/${projectId}/members`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi lấy danh sách thành viên:', error);
        throw error;
    }
};

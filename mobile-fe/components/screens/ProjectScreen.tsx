import React from "react";
import { View, Text, FlatList, ActivityIndicator,TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import ProjectItem from "../ProjectItem";
import { styles } from "../../assets/styles/projectStyles";
import { API_URL_project } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface IProject {
        id: number;
        name: string;
        description: string;
        createdBy: string;
        status?: string | null;
        fromDate?: Date | null;
        toDate?: Date | null;
        members?: any;
        tasks?: any;
}

export default function ProjectsScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.warn("Không tìm thấy token, yêu cầu đăng nhập!");
                return;
            }

            const response = await fetch(`${API_URL_project}/get-all-project`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu dự án!");
            }

            const data: any[] = await response.json();
            const formattedData: IProject[] = data.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                createdBy: item.createdBy,
                status: item.status || "Đang xử lý",
                fromDate: item.fromDate ? new Date(item.fromDate) : null,
                toDate: item.toDate ? new Date(item.toDate) : null,
                members: item.members,
                tasks: item.tasks,
            }));

            setProjects(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu dự án:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({ title: "Dự án" });
        loadProjects();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Danh sách dự án</Text>

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push({ pathname: "/projectdetail", params: { project: JSON.stringify(item) } })}>
                    <ProjectItem project={item} />
                </TouchableOpacity>
                )}
            />
        </View>
    );
}
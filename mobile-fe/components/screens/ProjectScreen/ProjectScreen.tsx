import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "expo-router";
import { useState } from "react";
import ProjectItem from "../../ProjectItem";
import { styles } from "@/assets/styles/projectStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { getProjects, getStatusText, deleteProject } from "@/hooks/useProjectApi";
import { useFocusEffect } from "@react-navigation/native";

interface IProject {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    status: number;
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
            const data = await getProjects();
            const formattedData: IProject[] = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                createdBy: item.createdBy,
                status: item.status,
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

    const handleDeleteProject = async (projectId: number) => {
        try {
            await deleteProject(projectId);
            Alert.alert("Thành công", "Đã xóa dự án thành công");
            await loadProjects();
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data || "Không thể xóa dự án");
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            navigation.setOptions({ title: "Dự án" });
            loadProjects();
        }, [])
    );

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
                        onPress={() => router.push({ pathname: "/Project/projectdetail", params: { project: JSON.stringify(item) } })}>
                        <ProjectItem 
                            project={item} 
                            onDelete={() => handleDeleteProject(item.id)}
                        />
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/Project/createProject")}
            >
                <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}
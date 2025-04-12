import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Pressable } from "react-native";
import { useNavigation } from "expo-router";
import { useState } from "react";
import ProjectItem from "../../ProjectItem";
import { styles } from "@/assets/styles/projectStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { getProjects, getStatusText, deleteProject } from "@/hooks/useProjectApi";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    createdAt: Date;
}

export default function ProjectsScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                throw new Error("Không tìm thấy thông tin người dùng");
            }

            const data = await getProjects(parseInt(userId));
            const formattedData: IProject[] = data
                .map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    createdBy: item.createdBy,
                    status: item.status,
                    fromDate: item.fromDate ? new Date(item.fromDate) : null,
                    toDate: item.toDate ? new Date(item.toDate) : null,
                    members: item.members,
                    tasks: item.tasks,
                    createdAt: new Date(item.createdAt)
                }))
                .sort((a: IProject, b: IProject) => b.createdAt.getTime() - a.createdAt.getTime());
            
            setProjects(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu dự án:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách dự án");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        try {
            await deleteProject(projectId);
            Alert.alert("Thành công", "Dự án đã được xóa thành công");
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

    const renderItem = ({ item }: { item: IProject }) => {
        return (
            <Pressable
                onPress={() => router.push({ 
                    pathname: "/Project/projectdetail", 
                    params: { project: JSON.stringify(item) } 
                })}
                style={({ pressed }) => [
                    styles.projectItemContainer,
                    pressed && styles.projectCardPressed
                ]}
            >
                <ProjectItem 
                    project={item} 
                    onDelete={handleDeleteProject}
                />
            </Pressable>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <LinearGradient 
            colors={['#f0f2f5', '#e9ecef']} 
            style={styles.container}
        >
            <View style={styles.headerContainer}>
                <MaterialCommunityIcons name="view-dashboard" size={28} color="#3A7BDD" />
                <Text style={styles.header}>Danh sách dự án</Text>
            </View>

            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="folder-open-outline" size={64} color="#3A7BDD" />
                    <Text style={styles.emptyText}>Chưa có dự án nào</Text>
                    <Text style={styles.emptySubText}>Hãy tạo dự án đầu tiên của bạn</Text>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push("/Project/createProject")}
            >
                <LinearGradient
                    colors={['#3A7BDD', '#3A6073']}
                    style={styles.fabGradient}
                >
                    <AntDesign name="plus" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}
import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from "react";
import ProjectItem from "../../ProjectItem";
import { styles as projectStyles } from "../../../assets/styles/projectStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getProjects, deleteProject } from "@/hooks/useProjectApi";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface IProject {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    status: number;
    fromDate?: Date | null;
    toDate?: Date | null;
    memberNumber?: number;
    tasks?: any;
    createdAt: Date;
}

interface ProjectResponse {
    content: IProject[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

type RootStackParamList = {
    CreateProject: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProjectScreen = () => {
    const router = useRouter();
    const navigation = useNavigation<NavigationProp>();
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'mine'>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pressedProjectId, setPressedProjectId] = useState<number | null>(null);

    const loadProjects = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                throw new Error("Không tìm thấy thông tin người dùng");
            }

            const response = await getProjects(
                filter === 'mine' ? parseInt(userId) : undefined,
                currentPage,
                5
            );

            console.log(response.content);

            const formattedData: IProject[] = response.content
                .map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    createdBy: item.createdBy,
                    status: item.status,
                    fromDate: item.fromDate ? new Date(item.fromDate) : null,
                    toDate: item.toDate ? new Date(item.toDate) : null,
                    memberNumber: item.memberNumber || 0,
                    tasks: item.tasks,
                    createdAt: new Date(item.createdAt)
                }));
            
            setProjects(formattedData);
            setTotalPages(response.totalPages);
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
        }, [filter, currentPage])
    );

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleProjectPress = (project: IProject) => {
        router.push({ 
            pathname: "/Project/projectdetail", 
            params: { project: JSON.stringify(project) } 
        });
    };

    const getDefaultAvatar = () => {
        return require('../../../assets/images/default-avatar.jpg');
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <View style={projectStyles.container}>
            <Image 
                source={require('../../../assets/images/project-background.jpg')}
                style={projectStyles.backgroundImage}
                resizeMode="cover"
            />
            <View style={projectStyles.contentContainer}>
                <View style={projectStyles.headerContainer}>
                    <Ionicons name="folder" size={24} color="#1F2937" />
                    <Text style={projectStyles.header}>Danh sách dự án</Text>
                </View>

                <View style={projectStyles.filterContainer}>
                    <TouchableOpacity 
                        style={[projectStyles.filterButton, filter === 'all' && projectStyles.filterButtonActive]}
                        onPress={() => {
                            setFilter('all');
                            setCurrentPage(0);
                        }}
                    >
                        <Text style={[projectStyles.filterText, filter === 'all' && projectStyles.filterTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[projectStyles.filterButton, filter === 'mine' && projectStyles.filterButtonActive]}
                        onPress={() => {
                            setFilter('mine');
                            setCurrentPage(0);
                        }}
                    >
                        <Text style={[projectStyles.filterText, filter === 'mine' && projectStyles.filterTextActive]}>Của tôi</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={projectStyles.listContainer}>
                    {loading ? (
                        <View style={projectStyles.emptyContainer}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                        </View>
                    ) : projects.length === 0 ? (
                        <View style={projectStyles.emptyContainer}>
                            <Ionicons name="folder-open" size={48} color="#9CA3AF" />
                            <Text style={projectStyles.emptyText}>Không có dự án nào</Text>
                            <Text style={projectStyles.emptySubText}>
                                Tạo dự án mới để bắt đầu quản lý công việc của bạn
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {projects.map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    style={[
                                        projectStyles.projectItemContainer,
                                        pressedProjectId === project.id && projectStyles.projectCardPressed,
                                    ]}
                                    onPress={() => handleProjectPress(project)}
                                    onPressIn={() => setPressedProjectId(project.id)}
                                    onPressOut={() => setPressedProjectId(null)}
                                    activeOpacity={0.7}
                                >
                                    <ProjectItem 
                                        project={project} 
                                        onDelete={handleDeleteProject}
                                        defaultAvatar={getDefaultAvatar()}
                                    />
                                </TouchableOpacity>
                            ))}

                            {totalPages > 1 && (
                                <View style={projectStyles.paginationContainer}>
                                    <TouchableOpacity
                                        style={[
                                            projectStyles.paginationButton,
                                            currentPage === 0 && projectStyles.paginationButtonDisabled
                                        ]}
                                        onPress={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                    >
                                        <Text style={[
                                            currentPage === 0 ? projectStyles.paginationTextDisabled : projectStyles.paginationTextActive
                                        ]}>Trước</Text>
                                    </TouchableOpacity>
                                    <Text style={projectStyles.paginationText}>
                                        Trang {currentPage + 1} / {totalPages}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            projectStyles.paginationButton,
                                            currentPage === totalPages - 1 && projectStyles.paginationButtonDisabled
                                        ]}
                                        onPress={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        <Text style={[
                                            currentPage === totalPages - 1 ? projectStyles.paginationTextDisabled : projectStyles.paginationTextActive
                                        ]}>Sau</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={projectStyles.fab}
                    onPress={() => router.push('/Project/createProject')}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={projectStyles.fabGradient}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProjectScreen;
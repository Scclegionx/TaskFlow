import React, { useState, useEffect, useCallback } from "react";
import { 
    View, Text, StyleSheet, FlatList, ScrollView, 
    TouchableOpacity, Modal, TextInput, Alert, Image 
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import { 
    getProjectById, getStatusText, searchUserByEmail, 
    addProjectMember, removeProjectMember, formatDateTime 
} from "@/hooks/useProjectApi";
import { AntDesign } from "@expo/vector-icons";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTask, deleteTask, assignTask, getMainTasks } from "@/hooks/useTaskApi";

interface ItemProject {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    status: number;
    fromDate?: string | null;
    toDate?: string | null;
    members: IMember[]; 
    tasks: ITask[]; 
}

interface IMember {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

interface ITask {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    assignees: {
        id: number;
        name: string;
        avatar: string;
    }[];
}

interface RouteParams {
    project: string;
}

const getStatusColor = (status: number): string => {
    switch (status) {
        case 0: // Chưa bắt đầu
            return "#A0A0A0";
        case 1: // Đang thực hiện
            return "#00AEEF";
        case 2: // Hoàn thành
            return "#4CAF50";
        case 3: // Quá hạn
            return "#FF4D67";
        default:
            return "#A0A0A0";
    }
};

const getTaskStatusText = (status: string | number): string => {
    // Chuyển status về dạng số để so sánh
    const statusNumber = Number(status);
    switch (statusNumber) {
        case 0:
            return "Chưa được giao";
        case 1:
            return "Đang xử lý";
        case 2:
            return "Hoàn thành";
        case 3:
            return "Quá hạn";
        default:
            return "Không xác định";
    }
};

const getTaskStatusColor = (status: string | number): string => {
    const statusNumber = Number(status);
    switch (statusNumber) {
        case 0:
            return "#A0A0A0"; // Màu xám cho chưa được giao
        case 1:
            return "#00AEEF"; // Màu xanh dương cho đang xử lý
        case 2:
            return "#4CAF50"; // Màu xanh lá cho hoàn thành
        case 3:
            return "#FF4D67"; // Màu đỏ cho quá hạn
        default:
            return "#A0A0A0";
    }
};

export default function ProjectDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const router = useRouter();
    const [ItemProject, setItemProject] = useState<ItemProject>();
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const projectData = route.params as RouteParams;
    const project = projectData?.project ? JSON.parse(projectData.project) : null;
    const [userRole, setUserRole] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadProjects();
            getCurrentUserAndRole();
        }, [])
    );

    const getCurrentUserAndRole = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (userId) {
                setCurrentUserId(Number(userId));
                if (ItemProject?.members) {
                    const currentMember = ItemProject.members.find(m => m.id === Number(userId));
                    if (currentMember) {
                        console.log("Current user role:", currentMember.role);
                        setUserRole(currentMember.role);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    };

    useEffect(() => {
        if (ItemProject && currentUserId) {
            const currentMember = ItemProject.members.find(m => m.id === currentUserId);
            if (currentMember) {
                console.log("Current user role:", currentMember.role);
                setUserRole(currentMember.role);
            }
        }
    }, [ItemProject, currentUserId]);

    const loadProjects = async () => {
        try {
            const data = await getProjectById(project.id);
            // Lấy danh sách task chính và sắp xếp theo thời gian tạo
            const mainTasks = await getMainTasks(project.id);
            const sortedTasks = mainTasks.sort((a: ITask, b: ITask) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setItemProject({...data, tasks: sortedTasks});
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu dự án:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = debounce(async (email: string) => {
        if (email.length > 0) {
            try {
                const users = await searchUserByEmail(email);
                setSearchResults(users);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    }, 500);

    const handleAddMember = async (userId: number) => {
        try {
            await addProjectMember(project.id, userId);
            await loadProjects();
            setShowAddMember(false);
            setSearchEmail("");
            Alert.alert("Thành công", "Đã thêm thành viên vào dự án");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể thêm thành viên");
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeProjectMember(project.id, memberId);
                            await loadProjects();
                            Alert.alert("Thành công", "Đã xóa thành viên khỏi dự án");
                        } catch (error: any) {
                            Alert.alert("Lỗi", error.message || "Không thể xóa thành viên");
                        }
                    }
                }
            ]
        );
    };

    

    const handleRemoveTask = async (taskId: number) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa nhiệm vụ này không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            await loadProjects();
                            Alert.alert("Thành công", "Đã xóa nhiệm vụ");
                        } catch (error: any) {
                            Alert.alert(
                                "Lỗi",
                                error.message || "Không thể xóa nhiệm vụ"
                            );
                        }
                    }
                }
            ]
        );
    };

    const handleShowAssignModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setShowAssignModal(true);
    };

    const handleAssignTask = async (userId: number) => {
        if (!selectedTaskId) return;
        
        try {
            await assignTask(selectedTaskId, userId);
            await loadProjects();
            setShowAssignModal(false);
            setSelectedTaskId(null);
            Alert.alert("Thành công", "Đã gán nhiệm vụ cho thành viên");
        } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Không thể gán nhiệm vụ");
        }
    };

    const handleTaskPress = (taskId: number) => {
        if (userRole === 'ADMIN') {
            router.push({
                pathname: '/Task/editTask',
                params: { taskId: taskId }
            });
        } else if (userRole === 'MEMBER') {
            router.push({
                pathname: '/Task/taskDetail',
                params: { taskId: taskId }
            });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
                <Text style={styles.title}>📌 {ItemProject?.name}</Text>
                <Text style={styles.description}>{ItemProject?.description}</Text>
                <Text style={styles.date}>
                    📅 Ngày tạo: {ItemProject?.fromDate ? formatDateTime(ItemProject.fromDate) : "Chưa cập nhật"}
                </Text>
                <Text style={styles.date}>
                    🚀 Hạn chót: {ItemProject?.toDate ? formatDateTime(ItemProject.toDate) : "Chưa cập nhật"}
                </Text>
                <Text style={[styles.status, { color: ItemProject ? getStatusColor(ItemProject.status) : "#A0A0A0" }]}>
                    ⚡ Trạng thái: {ItemProject ? getStatusText(ItemProject.status) : "Chưa xác định"}
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>👥 Thành viên</Text>
                    {userRole === 'ADMIN' && (
                        <TouchableOpacity onPress={() => setShowAddMember(true)}>
                            <AntDesign name="plus" size={24} color="#007BFF" />
                        </TouchableOpacity>
                    )}
                </View>
                <FlatList
                    data={ItemProject?.members}
                    keyExtractor={(member) => member.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.memberItem}>
                            <View style={styles.memberInfo}>
                                <View style={styles.memberAvatarContainer}>
                                    <Image 
                                        source={{ uri: item.avatar }} 
                                        style={styles.memberAvatar}
                                    />
                                    <View style={styles.memberDetails}>
                                        <Text style={styles.memberName}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.memberEmail}>
                                            {item.email}
                                        </Text>
                                        <Text style={[styles.roleText, { color: item.role === 'ADMIN' ? '#007BFF' : '#666' }]}>
                                            {item.role}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {userRole === 'ADMIN' && item.id !== currentUserId && (
                                <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
                                    <AntDesign name="delete" size={20} color="#FF4D67" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </View>

            {/* Modal thêm thành viên */}
            <Modal
                visible={showAddMember}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm thành viên</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Nhập email để tìm kiếm"
                            value={searchEmail}
                            onChangeText={(text) => {
                                setSearchEmail(text);
                                debouncedSearch(text);
                            }}
                        />
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.searchResultItem}
                                    onPress={() => handleAddMember(item.id)}
                                >
                                    <Text>{item.name} ({item.email})</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => {
                                setShowAddMember(false);
                                setSearchEmail("");
                                setSearchResults([]);
                            }}
                        >
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📌 Công việc</Text>
                    {userRole === 'ADMIN' && (
                        <TouchableOpacity 
                            onPress={() => router.push({
                                pathname: '/Task/createTask',
                                params: { projectId: project.id }
                            })}
                        >
                            <AntDesign name="plus" size={24} color="#007BFF" />
                        </TouchableOpacity>
                    )}
                </View>
                {ItemProject?.tasks && ItemProject.tasks.length > 0 ? (
                    <FlatList
                        data={ItemProject.tasks}
                        keyExtractor={(task) => task.id.toString()}
                        renderItem={({ item }) => (
                            <View style={[
                                styles.taskItem,
                                userRole === 'ADMIN' && styles.taskItemClickable
                            ]}>
                                <TouchableOpacity 
                                    style={styles.taskContent}
                                    onPress={() => handleTaskPress(item.id)}
                                >
                                    <View style={styles.taskHeader}>
                                        <Text style={styles.taskTitle}>
                                            🔹 {item.title}
                                        </Text>
                                        {userRole === 'ADMIN' && (
                                            <TouchableOpacity 
                                                style={styles.deleteButton}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveTask(item.id);
                                                }}
                                            >
                                                <AntDesign name="close" size={16} color="#FF4D67" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <Text style={styles.taskDescription}>{item.description}</Text>
                                    <Text style={styles.taskDate}>
                                        {formatDateTime(item.createdAt)}
                                    </Text>
                                    <View style={styles.taskFooter}>
                                        <Text style={[styles.statusText, { color: getTaskStatusColor(item.status) }]}>
                                            {getTaskStatusText(item.status)}
                                        </Text>
                                        {item.assignees && item.assignees.length > 0 ? (
                                            <View style={styles.assigneeContainer}>
                                                <View style={styles.assignedAvatar}>
                                                    <Image 
                                                        source={{ uri: item.assignees[0].avatar }} 
                                                        style={styles.avatarImage}
                                                    />
                                                    {/* Chỉ hiển thị nút edit cho ADMIN */}
                                                    {userRole === 'ADMIN' && (
                                                        <TouchableOpacity 
                                                            style={styles.changeAssignBadge}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                handleShowAssignModal(item.id);
                                                            }}
                                                        >
                                                            <AntDesign name="edit" size={8} color="#FFF" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {item.assignees.length > 1 && (
                                                    <View style={styles.assigneeCount}>
                                                        <Text style={styles.assigneeCountText}>
                                                            +{item.assignees.length - 1}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            // Chỉ ADMIN mới thấy và có thể nhấn nút thêm người
                                            userRole === 'ADMIN' ? (
                                                <TouchableOpacity 
                                                    style={styles.assignButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleShowAssignModal(item.id);
                                                    }}
                                                >
                                                    <AntDesign name="adduser" size={20} color="#007BFF" />
                                                </TouchableOpacity>
                                            ) : (
                                                <Text style={styles.noAssigneeText}>Chưa có người được gán</Text>
                                            )
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có nhiệm vụ nào</Text>
                    </View>
                )}
            </View>

            {/* Modal Assign Task */}
            <Modal
                visible={showAssignModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn thành viên</Text>
                        <FlatList
                            data={ItemProject?.members.filter(member => member.role !== 'ADMIN')}
                            keyExtractor={(member) => member.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.memberOption}
                                    onPress={() => handleAssignTask(item.id)}
                                >
                                    <Text style={styles.memberOptionText}>
                                        {item.name} ({item.email})
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => {
                                setShowAssignModal(false);
                                setSelectedTaskId(null);
                            }}
                        >
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: "#F5F5F5", 
    },
    card: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, 
    },
    title: { 
        fontSize: 22, 
        fontWeight: "bold", 
        marginBottom: 10, 
        color: "#333" 
    },
    description: { 
        fontSize: 16, 
        color: "#666", 
        marginBottom: 10 
    },
    date: { 
        fontSize: 14, 
        color: "#888", 
        marginBottom: 5 
    },
    status: { 
        fontSize: 16, 
        fontWeight: "bold", 
        color: "#007BFF", 
        marginBottom: 10 
    },

    section: { 
        backgroundColor: "#FFF", 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 15, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        marginBottom: 10, 
        color: "#333", 
        borderBottomWidth: 2, 
        borderBottomColor: "#DDD",
        paddingBottom: 5,
    },

    listItem: { 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: "#EEE", 
    },
    listText: { 
        fontSize: 16, 
        color: "#333", 
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    memberItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    memberAvatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    memberEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    roleText: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },
    taskItem: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        paddingRight: 24,
    },
    taskDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    deleteButton: {
        position: 'absolute',
        right: -5,
        top: -5,
        padding: 5,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    assignButton: {
        backgroundColor: '#E8F4FF',
        padding: 5,
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    memberOptionText: {
        fontSize: 16,
        color: '#333',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    statusText: {
        fontSize: 12,
        marginTop: 4,
    },
    taskItemClickable: {
        opacity: 1,
        cursor: 'pointer',
    },
    taskContent: {
        flex: 1,
    },
    assignedAvatar: {
        position: 'relative',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    changeAssignBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#007BFF',
        borderRadius: 10,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    assigneeCount: {
        position: 'absolute',
        right: -15,
        top: '50%',
        transform: [{ translateY: -10 }],
        backgroundColor: '#007BFF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    assigneeCountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    assigneeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    noAssigneeText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
});
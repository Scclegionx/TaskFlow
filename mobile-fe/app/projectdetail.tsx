import React, { useState, useEffect } from "react";
import { 
    View, Text, StyleSheet, FlatList, ScrollView, 
    TouchableOpacity, Modal, TextInput, Alert 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { 
    getProjectById, getStatusText, searchUserByEmail, 
    addProjectMember, removeProjectMember, formatDateTime 
} from "@/hooks/useProjectApi";
import { AntDesign } from "@expo/vector-icons";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

interface ITask {
    id: number;
    description: string;
    status: string; 
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

export default function ProjectDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const [ItemProject, setItemProject] = useState<ItemProject>();
    const [loading, setLoading] = useState(true);
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const project = route.params?.project ? JSON.parse(route.params.project) : null;
    const [userRole, setUserRole] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        loadProjects();
        getCurrentUserAndRole();
    }, []);

    const getCurrentUserAndRole = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (userId) {
                setCurrentUserId(Number(userId));
                if (ItemProject?.members) {
                    const currentMember = ItemProject.members.find(m => m.id === Number(userId));
                    if (currentMember) {
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
                setUserRole(currentMember.role);
            }
        }
    }, [ItemProject, currentUserId]);

    const loadProjects = async () => {
        try {
            const data = await getProjectById(project.id);
            console.log(data);
            setItemProject(data);
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
            await loadProjects(); // Reload project data
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
                            await loadProjects(); // Reload data sau khi xóa
                            Alert.alert("Thành công", "Đã xóa thành viên khỏi dự án");
                        } catch (error: any) {
                            Alert.alert("Lỗi", error.message || "Không thể xóa thành viên");
                        }
                    }
                }
            ]
        );
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
                                <Text style={styles.listText}>
                                    ✅ {item.name} ({item.email})
                                </Text>
                                <Text style={[styles.roleText, { color: item.role === 'ADMIN' ? '#007BFF' : '#666' }]}>
                                    {item.role}
                                </Text>
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
                <Text style={styles.sectionTitle}>📌 Nhiệm vụ:</Text>
                <FlatList
                    data={ItemProject?.tasks}
                    keyExtractor={(task) => task.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listText}>🔹 {item.description} (Trạng thái: {item.status})</Text>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </View>
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
        paddingVertical: 10,
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
    },
    roleText: {
        fontSize: 12,
        marginTop: 2,
    },
});
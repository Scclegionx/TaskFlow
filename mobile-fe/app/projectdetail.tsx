import React, { useEffect,useState } from "react";
import { View, Text, StyleSheet,FlatList,ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL_project } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface ItemProject {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    status?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    members: IMember[]; 
    tasks: ITask[]; 
}

interface IMember {
    id: number;
    name: string;
    email: string;
}

interface ITask {
    id: number;
    description: string;
    status: string; 
}


export default function ProjectDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const [ItemProject, setItemProject] = useState<ItemProject>();
    const [loading, setLoading] = useState(true);
    const project = route.params?.project ? JSON.parse(route.params.project) : null;
    const loadProjects = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.warn("Không tìm thấy token, yêu cầu đăng nhập!");
                return;
            }

            const response = await fetch(`${API_URL_project}/${project.id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu dự án!");
            }

            const data: ItemProject = await response.json();
            setItemProject(data);
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

    useEffect(() => {
        navigation.setOptions({ title: "Chi tiết dự án" });
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
                <Text style={styles.title}>📌 {ItemProject?.name}</Text>
                <Text style={styles.description}>{ItemProject?.description}</Text>
                <Text style={styles.date}>📅 Ngày tạo: {ItemProject?.fromDate ?? "Chưa cập nhật"}</Text>
                <Text style={styles.date}>🚀 Hạn chót: {ItemProject?.toDate ?? "Chưa cập nhật"}</Text>
                <Text style={styles.status}>⚡ Trạng thái: {ItemProject?.status ?? "Chưa xác định"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Thành viên:</Text>
                <FlatList
                    data={ItemProject?.members}
                    keyExtractor={(member) => member.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listText}>✅ {item.name} ({item.email})</Text>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            </View>

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
});
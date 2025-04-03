import { View, FlatList, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { useNavigation,useFocusEffect } from "expo-router";
import { useEffect, useState , useCallback  } from "react";
import { Ionicons } from "@expo/vector-icons"; // Thêm icon
import UserItem from "../components/UserItem"; 
import { styles } from "../assets/styles/adminStyles"; 
import { API_BASE_URL } from "@/constants/api"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface IUser {
    id: number;
    name: string;
    email: string;
    gender: number;
    phoneNumber: string;
    dateOfBirth: string;
    avatar: string;
    roles: IRole[];
    active: boolean;
}
interface IRole {
    id: number;
    name: string;
    permissions: string[];
}

export default function AdminScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const loadUsers = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                console.warn("Không tìm thấy token, yêu cầu đăng nhập!");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu người dùng!");
            }

            const data: IUser[] = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi lấy người dùng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({ 
            title: "Admin",
        });
        loadUsers();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUsers();
        }, [])
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    const MAX_ITEMS = 6;
    const displayedUsers = showAll ? users : users.slice(0, MAX_ITEMS);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Danh sách người dùng</Text>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => router.push("/AddUser")} 
                >
                    <Ionicons name="person-add" size={24} color="white" />
                    <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={displayedUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <UserItem item={item} />}
            />
            {users.length > MAX_ITEMS && (
                <TouchableOpacity style={styles.button} onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.buttonText}>{showAll ? "Ẩn bớt" : "Xem thêm"}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

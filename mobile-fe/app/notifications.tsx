import { View, FlatList, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import NotificationItem from "../components/NotificationItem";
import { styles } from "../assets/styles/notificationStyles";
import { API_BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface INotifi {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    slug: string;
    read: boolean;
}

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<INotifi[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const loadNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                console.warn("Không tìm thấy token, yêu cầu đăng nhập!");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu thông báo!");
            }

            const data: INotifi[] = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(sortedData);
        } catch (error) {
            console.error("Lỗi khi lấy thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({ title: "Thông báo" });
        loadNotifications();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    const MAX_ITEMS = 6;
    const displayedNotifications = showAll ? notifications : notifications.slice(0, MAX_ITEMS);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Trước đó</Text>
            <FlatList
                data={displayedNotifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <NotificationItem item={item} />}
            />
            {notifications.length > MAX_ITEMS && (
                <TouchableOpacity style={styles.button} onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.buttonText}>{showAll ? "Ẩn bớt" : "Xem thêm"}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

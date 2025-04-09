import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../assets/styles/notificationStyles";
import { formatTimeAgo } from "./utils/timeUtils";
import { useRouter } from "expo-router";
import { getProjectById } from "@/hooks/useProjectApi";
import { markNotificationAsRead } from "@/hooks/useNotificationApi";
import { useState } from "react";

interface INotifi {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    slug: string;
    read: boolean;
}

interface NotificationItemProps {
    item: INotifi;
}

const getLastNumberFromSlug = (slug: string): string => {
    const parts = slug.split("/").filter(Boolean);
    return parts[parts.length - 1];
};

const getSlugType = (slug: string): string => {
    const parts = slug.split("/").filter(Boolean);
    return parts[0];
};

export default function NotificationItem({ item }: NotificationItemProps) {
    const router = useRouter();
    const [isRead, setIsRead] = useState(item.read); 
    const handlePress = async () => {
        if (!isRead) {
            try {
                console.log(item.id)
                await markNotificationAsRead(item.id); 
                setIsRead(true);
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc:", error);
            }
        }

        const type = getSlugType(item.slug);
        const id = getLastNumberFromSlug(item.slug);

        if (type === "projects") {
            try {
                const project = await getProjectById(Number(id));
                router.push({
                    pathname: "/Project/projectdetail",
                    params: { project: JSON.stringify(project) },
                });
            } catch (error) {
                console.error("Lỗi khi lấy project:", error);
            }
        } else if (type === "tasks") {
            router.push({
                pathname: "/Task/taskDetail",
                params: { taskId: id },
            });
        } else {
            console.warn("Không hỗ trợ điều hướng cho slug:", item.slug);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.notification,
                isRead ? styles.readNotification : styles.unreadNotification,
            ]}
            onPress={handlePress}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
            </View>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </TouchableOpacity>
    );
}

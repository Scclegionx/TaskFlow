import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../assets/styles/notificationStyles";
import { formatTimeAgo } from "./utils/timeUtils";

interface INotifi {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    // senderName?: string; // Tên người gửi
}

interface NotificationItemProps {
    item: INotifi;
}

export default function NotificationItem({ item }: NotificationItemProps) {
    return (
        <TouchableOpacity style={[styles.notification, item.read ? styles.readNotification : styles.unreadNotification]}>
            <View style={styles.content}>
                {/* <Text style={styles.senderName}>{item.senderName || "Hệ thống"}</Text> */}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
            </View>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </TouchableOpacity>
    );
}

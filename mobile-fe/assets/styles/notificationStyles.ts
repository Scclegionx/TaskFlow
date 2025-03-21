import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: "100%",
        padding: 16,
        backgroundColor: "#fff",
    },
    notification: {
        padding: 10,
        marginBottom: 6,
        borderRadius: 8,
    },
    unreadNotification: {
        backgroundColor: "#d0ebff",
    },
    readNotification: {
        backgroundColor: "#f1f1f1",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    message: {
        fontSize: 16,
        color: "#555",
        marginTop: 4, 
    },
    time: {
        fontSize: 12,
        color: "gray",
        marginTop: 4,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        // marginTop: 10,
    },
    content: {
        flex: 1,
    },
    senderName: {
        fontWeight: "bold",
        fontSize: 14,
    },
});

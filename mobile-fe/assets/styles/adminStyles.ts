import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f8f8",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    }, 
    header: {
        flexDirection: "row", 
        justifyContent: "space-between", // Đẩy tiêu đề sang trái, nút sang phải
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    
    addButton: {
        flexDirection: "row", 
        alignItems: "center",
        backgroundColor: "#28a745",
        padding: 10,
        borderRadius: 5,
        alignSelf: "flex-end",
    },
    
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8, // Khoảng cách với icon
    },   
});

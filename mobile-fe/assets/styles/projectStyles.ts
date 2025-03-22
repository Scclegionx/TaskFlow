import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5", padding: 20 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    card: {
        backgroundColor: "#FFF",
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold" },
    description: { fontSize: 14, color: "#555", marginVertical: 5 },
    date: { fontSize: 12, color: "#888" },
    status: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
});

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>phamtu</Text>
                <View style={styles.headerIcons}>
                    <Ionicons name="mail-outline" size={24} color="black" style={styles.icon} />
                    <Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />
                    <Ionicons name="menu" size={28} color="black" />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="gray" style={styles.icon} />
                <TextInput placeholder="Tìm kiếm" style={styles.input} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#222" },
    headerIcons: { flexDirection: "row", alignItems: "center" },
    icon: { marginRight: 10 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 10, padding: 10 },
    input: { flex: 1 }
});

export default Header;

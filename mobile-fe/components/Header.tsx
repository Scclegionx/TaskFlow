import React ,{ useEffect, useState }from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet,TouchableOpacity , Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
const Header = () => {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '', avatar: '' });

    useFocusEffect(
        React.useCallback(() => {
            const loadUser = async () => {
                const name = await AsyncStorage.getItem('username');
                const email = await AsyncStorage.getItem('email');
                const avatar = await AsyncStorage.getItem('avatar') || '';
                setUser({ name, email, avatar });
            };
            loadUser();
        }, [])
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Avatar.Image
                        size={40}
                        source={{
                            uri: user.avatar || "http://res.cloudinary.com/doah3bdw6/image/upload/v1743153165/r0nulby5tat56nq1q394.png",
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.title} numberOfLines={1}>
                        {user.name || "Người dùng"}
                    </Text>
                </View>
                <View style={styles.headerIcons}>
                    <Ionicons name="mail-outline" size={24} color="black" style={styles.icon} />
                    <TouchableOpacity onPress={() => router.push("/notifications")}>
                        <Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />
                    </TouchableOpacity>
                    <Ionicons name="menu" size={28} color="black" />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#888"
                    style={styles.input}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
        marginLeft: 10,
        maxWidth: 200,
        fontFamily: "Roboto", // Giới hạn chiều rộng để tránh tràn
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 15,
    },
    avatar: {
        backgroundColor: "#ddd",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
});

export default Header;

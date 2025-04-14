import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

interface User {
    name: string;
    email: string;
    avatar: any;
}

const Header = () => {
    const router = useRouter();
    const [user, setUser] = useState<User>({ name: '', email: '', avatar: null });

    useFocusEffect(
        React.useCallback(() => {
            const loadUser = async () => {
                const name = await AsyncStorage.getItem('username') || 'Người dùng';
                const email = await AsyncStorage.getItem('email') || 'email';
                const avatar = await AsyncStorage.getItem('avatar');
                
                // Kiểm tra nếu avatar là null hoặc chuỗi rỗng
                const defaultAvatar = require('../assets/images/default-avatar.jpg');
                const userAvatar = avatar && avatar !== 'null' ? { uri: avatar } : defaultAvatar;

                setUser({ 
                    name, 
                    email, 
                    avatar: userAvatar
                });
            };
            loadUser();
        }, [])
    );

    return (
        <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Avatar.Image
                        size={40}
                        source={user.avatar}
                        style={styles.avatar}
                    />
                    <Text style={styles.title} numberOfLines={1}>
                        {user.name || "Người dùng"}
                    </Text>
                </View>
                <View style={styles.headerIcons}>
                    <Ionicons name="mail-outline" size={24} color="white" style={styles.icon} />
                    <TouchableOpacity onPress={() => router.push("/notifications")}>
                        <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
                    </TouchableOpacity>
                    <Ionicons name="menu" size={28} color="white" />
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#6B7280"
                    style={styles.input}
                />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
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
        color: "white",
        marginLeft: 10,
        maxWidth: 200,
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 15,
    },
    avatar: {
        backgroundColor: "white",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
    },
});

export default Header;

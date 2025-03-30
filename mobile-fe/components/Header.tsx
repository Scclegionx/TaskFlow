import React ,{ useEffect, useState }from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet,TouchableOpacity , Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar } from "react-native-paper";

const Header = () => {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '', avatar: '' });

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('username');
            const email = await AsyncStorage.getItem('email');
            const avatar = await AsyncStorage.getItem('avatar') || '';  // Lấy avatar từ AsyncStorage
            if (name && email) setUser({ name, email, avatar });
        };
        loadUser();
    }, []);
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{user.name}</Text>
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
            
            <Avatar.Image size={30} source={{ uri: user.avatar || "" }} style={styles.avatar} />
                
                <TextInput placeholder="Tìm kiếm" style={styles.input} />
                <Ionicons name="search" size={20} color="gray" style={styles.icon} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 40 ,
                 backgroundColor: "#fff" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#222" },
    headerIcons: { flexDirection: "row", alignItems: "center" },
    icon: { marginRight: 10 },
    avatar: {
        marginRight: 15, // Tăng khoảng cách giữa avatar và ô nhập liệu
    },

    // searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 10, padding: 10 },
    searchBar: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#f2f2f2", 
        borderRadius: 10, 
        padding: 10 
    },
    input: { flex: 1 }
});

export default Header;

import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.55.101:8080/api/users/profile"; // Thay bằng URL thật

const AccountInfo = () => {
    const navigation = useNavigation();
    const [name, setName] = useState("");

    useEffect(() => {
        navigation.setOptions({ title: "Thông Tin Tài Khoản" });
        loadUserData();
    }, []);

    // 🟢 Load dữ liệu từ API
    const loadUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return console.warn("Chưa đăng nhập!");

            const response = await fetch(`${API_URL}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Không thể lấy dữ liệu người dùng");

            const data = await response.json();
            setName(data.name);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    // 🟢 Cập nhật tên
    const updateName = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return console.warn("Chưa đăng nhập!");

            const response = await fetch(`${API_URL}/name`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) throw new Error("Không thể cập nhật tên");

            Alert.alert("Thành công", "Đã cập nhật tên");
        } catch (error) {
            console.error("Lỗi cập nhật tên:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông Tin Tài Khoản</Text>
            
            {/* Ô nhập tên */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>👤 Họ tên:</Text>
                <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                />
                <Button title="Cập nhật" onPress={updateName} />
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.label}>⚥ Giới tính:</Text>
                <Text style={styles.value}>Nam</Text>
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.label}>🎂 Ngày sinh:</Text>
                <Text style={styles.value}>01/01/1990</Text>
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.label}>📞 Số điện thoại:</Text>
                <Text style={styles.value}>0123 456 789</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        color: '#333',
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
});

export default AccountInfo;

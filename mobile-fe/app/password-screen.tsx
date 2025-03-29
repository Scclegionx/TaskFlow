import React, { useState,useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useNavigation } from "@react-navigation/native";

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    useEffect(() => {
        navigation.setOptions({ title: "" });
    }, []);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert("Lỗi", "Mật khẩu mới không khớp");
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return Alert.alert("Lỗi", "Bạn chưa đăng nhập!");

            const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                }),
            });

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result || "Cập nhật mật khẩu thất bại");
            }

            Alert.alert("Thành công", "Mật khẩu đã được cập nhật!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            Alert.alert("Lỗi", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đổi Mật Khẩu</Text>

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu hiện tại"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <Button title="Cập nhật mật khẩu" onPress={handleChangePassword} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
        // justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    input: {
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: 16,
    },
});

export default ChangePasswordScreen;

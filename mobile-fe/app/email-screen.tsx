import React, { useState,useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_BASE_URL} from "@/constants/api";
import { useNavigation } from "@react-navigation/native";


const ChangeEmailScreen = () => {
    const navigation = useNavigation();
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
            navigation.setOptions({ title: "" });
        }, []);

    const updateEmail = async () => {
        if (!newEmail || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/profile/email`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: newEmail, password }),
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText);
            }

            Alert.alert("Thành công", "Email đã được cập nhật");
        } catch (error) {
            Alert.alert("Lỗi", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đổi Email</Text>

            <Text style={styles.label}>Email mới:</Text>
            <TextInput 
                style={styles.input} 
                value={newEmail} 
                onChangeText={setNewEmail} 
                keyboardType="email-address"
                placeholder="example@gmail.com"
            />

            <Text style={styles.label}>Mật khẩu xác nhận:</Text>
            <TextInput 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                placeholder="Nhập mật khẩu"
            />

            <Button title="Cập nhật Email" onPress={updateEmail} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 5 },
    input: { height: 40, borderBottomWidth: 1, marginBottom: 20, paddingHorizontal: 5 },
});

export default ChangeEmailScreen;

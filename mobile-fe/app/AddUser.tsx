import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddUser() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddUser = async () => {
        if (!name || !email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
            return;
        }
    
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
    
            const response = await fetch(`${API_BASE_URL}/admin/add-user`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    gender: 1,
                    password,
                    phoneNumber: "",
                    dateOfBirth: "",
                    roles: [{ id: 2, name: "USER" }],
                    active: true,
                }),
            });
    
            // Kiểm tra mã trạng thái HTTP trước khi phân tích dữ liệu
            if (!response.ok) {
                throw new Error(`Lỗi: ${response.statusText}`);
            }
    
            const rawData = await response.text(); // Sử dụng `.text()` thay vì `.json()`
    
            let data = {};
            try {
                // Kiểm tra xem rawData có phải là JSON không
                data = JSON.parse(rawData);
            } catch (e) {
                // Nếu không phải JSON, chỉ lấy rawData như là thông điệp trả về
                data = { message: rawData };
            }
    
            if (response.status === 200) {
                Alert.alert("Thành công", data.message || "Thêm người dùng thành công!");
                router.back(); // Quay lại trang Admin
            } else {
                Alert.alert("Lỗi", data.message || "Không thể thêm người dùng!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm người dùng:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm người dùng!");
        } finally {
            setLoading(false);
        }
    };  

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Thêm Người Dùng</Text>
            <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleAddUser} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Thêm</Text>}
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    input: {
        width: "90%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "white",
    },
    button: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: "90%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
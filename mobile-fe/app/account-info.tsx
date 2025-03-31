import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckBox } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from "@/constants/api";


const AccountInfo = () => {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<number>(); // 1 = Nam, 0 = Nữ
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        navigation.setOptions({ title: "" });
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return console.warn("Chưa đăng nhập!");

            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Không thể lấy dữ liệu người dùng");

            const data = await response.json();
            setName(data.name);
            setPhoneNumber(data.phoneNumber || "");
            setDateOfBirth(data.dateOfBirth || "");
            setGender(data.gender ?? "");
            // console.log(data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    const updateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return Alert.alert("Lỗi", "Bạn chưa đăng nhập!");

            const updatedData = {
                name,
                phoneNumber,
                dateOfBirth,
                gender,
            };

            const response = await fetch(`${API_BASE_URL}/users/profile/update`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Cập nhật thất bại");

            Alert.alert("Thành công", "Cập nhật thông tin thành công");
            loadUserData();
        } catch (error:any) {
            Alert.alert("Lỗi", error.message);
            console.error("Lỗi cập nhật thông tin:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chọn ngày";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateOfBirth(selectedDate.toISOString().split("T")[0]); 
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông Tin Tài Khoản</Text>

            <View style={styles.infoBox}>
                <Text style={styles.label}>👤 Họ tên:</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.label}>📞 Số điện thoại:</Text>
                <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="numeric" />
            </View>

            {/* Ngày sinh */}
            <View style={styles.infoBox}>
                <Text style={styles.label}>🎂 Ngày sinh:</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.input}>{formatDate(dateOfBirth)}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={onChangeDate}
                        locale="vi-VN"
                    />
                )}
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.label}>⚥ Giới tính:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setGender(1)} style={styles.radioButton}>
                        <Text style={[styles.radioText, gender === 1 && styles.selectedRadio]}>⚪ Nam</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setGender(0)} style={styles.radioButton}>
                        <Text style={[styles.radioText, gender === 0 && styles.selectedRadio]}>⚪ Nữ</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <Button title="Cập nhật thông tin" onPress={updateProfile} />
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
        borderRadius: 15,
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
    radioButton: {
        padding: 10,
        marginRight: 10,
    },
    radioText: {
        fontSize: 16,
        color: "#666",
    },
    selectedRadio: {
        color: "#007BFF",
        fontWeight: "bold",
    },
    
});

export default AccountInfo;

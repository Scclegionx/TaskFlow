import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const UpdateUser = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const user = params.user ? JSON.parse(params.user as string) : null;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [gender, setGender] = useState(user?.gender || 0); // 1: Nam, 2: Nữ
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || "");
  const [active, setActive] = useState(user?.active || false);
  const [roles, setRoles] = useState(user?.roles || []);
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    if (!name || !email) {
      Alert.alert("Lỗi", "Tên và email không được để trống!");
      return;
    }
  
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
  
      const response = await fetch(`${API_BASE_URL}/admin/update-user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          gender,
          dateOfBirth,
            roles: user.roles.map((role) => ({ id: role.id, name: role.name })), // Chuyển đổi roles về định dạng mong muốn
          active,
        }),
      });
  
      const updatedUser = await response.json(); // Lấy dữ liệu người dùng đã cập nhật
  
      if (response.ok) {
        Alert.alert("Thành công", "Cập nhật người dùng thành công!");
        navigation.goBack(); // Quay lại trang trước đó
      } else {
        Alert.alert("Lỗi", updatedUser.message || "Không thể cập nhật người dùng!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật thông tin người dùng</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên"
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
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày sinh (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 1 && styles.genderButtonSelected,
          ]}
          onPress={() => setGender(1)}
        >
          <Text style={styles.genderText}>Nam</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 2 && styles.genderButtonSelected,
          ]}
          onPress={() => setGender(2)}
        >
          <Text style={styles.genderText}>Nữ</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.activeButton, active && styles.activeButtonSelected]}
        onPress={() => setActive(!active)}
      >
        <Text style={styles.activeText}>
          {active ? "Đang hoạt động" : "Không hoạt động"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.updateButton, loading && { opacity: 0.5 }]}
        onPress={handleUpdateUser}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: "#007bff",
  },
  genderText: {
    color: "#333",
  },
  activeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginBottom: 20,
  },
  activeButtonSelected: {
    backgroundColor: "#28a745",
  },
  activeText: {
    color: "#333",
  },
  updateButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpdateUser;
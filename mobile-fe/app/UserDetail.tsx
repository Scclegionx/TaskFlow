import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const UserDetail = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const user = params.project ? JSON.parse(params.project as string) : null;

  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Text style={styles.errorText}>Không tìm thấy thông tin người dùng!</Text>
    );
  }

  useEffect(() => {
    navigation.setOptions({ title: "Chi tiết người dùng" });
  }, []);

  // Xử lý hiển thị giới tính
  const genderText =
    user.gender === 1 ? "Nam" : user.gender === 2 ? "Nữ" : "Chưa cập nhật";
  const phoneText = user.phoneNumber ? user.phoneNumber : "Chưa cập nhật";
  const dobText = user.dateOfBirth ? user.dateOfBirth : "Chưa cập nhật";

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(
              `${API_BASE_URL}/admin/delete-user/${user.id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const rawData = await response.text();

            let data;
            try {
              data = JSON.parse(rawData);
            } catch (e) {
              data = rawData;
            }

            if (response.ok) {
              Alert.alert("Thành công", data || "Xóa người dùng thành công!");
              navigation.goBack();
            } else {
              Alert.alert("Lỗi", data || "Không thể xóa người dùng!");
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ!");
          }
          setLoading(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{user.name}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Email: {user.email}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>
          Vai trò: {user.roles.map((role) => role.name).join(", ")}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Giới tính: {genderText}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Số điện thoại: {phoneText}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Ngày sinh: {dobText}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>
          Trạng thái:{" "}
          <Text
            style={[styles.status, { color: user.active ? "green" : "red" }]}
          >
            {user.active ? "Active" : "Inactive"}
          </Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() =>
          navigation.navigate("UpdateUser", { user: JSON.stringify(user) })
        }
      >
        <Text style={styles.updateButtonText}>Cập nhật thông tin</Text>
      </TouchableOpacity>
      {/* Nút Xóa Người Dùng */}
      <TouchableOpacity
        style={[styles.deleteButton, loading && { opacity: 0.5 }]}
        onPress={handleDeleteUser}
        disabled={loading}
      >
        <Text style={styles.deleteButtonText}>
          {loading ? "Đang xóa..." : "Xóa người dùng"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoBox: {
    width: "90%",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default UserDetail;

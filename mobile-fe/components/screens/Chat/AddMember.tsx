// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const AddMemberModal = ({ visible, onClose, onAddMember, chatDetail }) => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPotentialMembers = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("❌ Không tìm thấy token");
          return;
        }
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("❌ Lỗi khi gọi API lấy danh sách potentialMembers");
          return;
        }

        const data = await response.json();
        const filteredUsers = data.filter(
          (user) => !chatDetail.users.some((member) => member.id === user.id)
        );

        setUsers(filteredUsers);
      } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchPotentialMembers();
    }
  }, [visible]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Thêm thành viên</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thành viên..."
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.memberRow}>
                  <Image
                    source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
                    style={styles.avatar}
                  />
                  <Text style={styles.memberName}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => onAddMember(item.id)}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "60%", // Giới hạn chiều cao để tạo thanh cuộn
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default AddMemberModal;
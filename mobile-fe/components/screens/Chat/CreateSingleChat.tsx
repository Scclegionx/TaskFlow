//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

const SelectUserScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách người dùng đã lọc
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(""); // State cho ô tìm kiếm
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Chọn người dùng" });
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentUserId = await AsyncStorage.getItem("userId"); // ID của user hiện tại
        const filteredUsers = response.data.filter(
          (user) => user.id !== parseInt(currentUserId)
        );

        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers); // Gán danh sách ban đầu cho danh sách đã lọc
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const startChat = async (user2Id, user2Name) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const myUsername = await AsyncStorage.getItem("username");
      const response = await axios.post(
        `${API_BASE_URL}/chat/start?user2Id=${user2Id}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const chatNameParts = response.data.chatName.split(" & ");

      // 📌 Chỉ lấy tên không trùng với username của mình
      const chatPartnerName =
        chatNameParts.find((name) => name !== myUsername) ||
        response.data.chatName;

      // 📌 Chuyển sang màn hình chat với tên chính xác
      router.push({
        pathname: `/chat/${response.data.id}`,
        params: { chatName: chatPartnerName },
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể bắt đầu cuộc trò chuyện");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn người để nhắn tin</Text>

      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm người dùng..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredUsers} // Sử dụng danh sách đã lọc
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => startChat(item.id, item.name)}
            >
              <Image
                source={
                  item.user.avatar
                    ? { uri: item.user.avatar } // Nếu avatar tồn tại, sử dụng URL
                    : require("@/assets/images/default-avatar.jpg") // Ảnh mặc định
                }
                style={styles.avatar}
              />
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ddd",
  },
  userName: { fontSize: 16 },
});

export default SelectUserScreen;

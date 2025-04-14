//@ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ Gọi API lấy danh sách bạn bè
  useEffect(() => {
    navigation.setOptions({ title: "Tạo nhóm" });
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const myUserId = await AsyncStorage.getItem("userId");

        if (!token || !myUserId) {
          Alert.alert("Lỗi", "Không thể xác định người dùng");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Loại bỏ chính mình khỏi danh sách
        const filteredFriends = response.data.filter(
          (user) => user.id.toString() !== myUserId
        );
        setFriends(filteredFriends);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách bạn bè");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // ✅ Lọc danh sách bạn bè theo tìm kiếm
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ✅ Chọn/Bỏ chọn bạn bè vào nhóm
  const toggleSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      const newSet = new Set(prevSelected);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  // ✅ Gọi API tạo nhóm
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }

    if (selectedUsers.size === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một thành viên");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const myUserId = await AsyncStorage.getItem("userId");

      if (!token || !myUserId) {
        Alert.alert("Lỗi", "Không thể xác định người dùng");
        return;
      }
      console.log("groupName", groupName);
      console.log("selectedUsers", selectedUsers);
      const response = await axios.post(
        `${API_BASE_URL}/chat/create-group`,
        {
          groupName: groupName,
          userIds: [...selectedUsers, myUserId], // Thêm cả user hiện tại vào nhóm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response", response.data);
      Alert.alert("Thành công", "Nhóm đã được tạo!");
      router.push({
        pathname: `/chat/${response.data.id}`,
        params: { chatName: response.data.chatName },
      });
      // Chuyển đến nhóm chat
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      Alert.alert("Lỗi", "Không thể tạo nhóm");
    }
  };

  return (
    <View style={styles.container}>
      {/* Nhập tên nhóm */}
      <View style={styles.inputContainer}>
        <Ionicons name="people" size={24} color="gray" />
        <TextInput
          style={styles.input}
          placeholder="Đặt tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Danh sách bạn bè */}
      <Text style={styles.sectionTitle}>Chọn thành viên</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.friendItem,
                selectedUsers.has(item.id) && styles.selectedItem,
              ]}
              onPress={() => toggleSelection(item.id)}
            >
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar } // Nếu avatar tồn tại, sử dụng URL
                    : require("@/assets/images/default-avatar.jpg") // Ảnh mặc định
                }
                style={styles.avatar}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendPhone}>{item.phone}</Text>
              </View>
              {selectedUsers.has(item.id) && (
                <Ionicons name="checkmark-circle" size={24} color="green" />
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Nút tạo nhóm */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Ionicons name="arrow-forward" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", paddingHorizontal: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    padding: 10,
    borderRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },
  selectedItem: { backgroundColor: "#D0F0C0" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: "bold" },
  friendPhone: { color: "gray" },
  createButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CreateGroupScreen;

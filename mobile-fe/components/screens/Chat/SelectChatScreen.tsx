import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
const SelectChatScreen = () => {
  const { messageId } = useLocalSearchParams()// Nhận messageId từ route
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
  
      const response = await axios.get(`${API_BASE_URL}/chat/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const formattedChats = response.data
        .filter((chat) => !chat.deletedForUsers.includes(parseInt(userId)))
        .map((chat) => ({
          ...chat,
          chatName: chat.chatName || "Không có tên", // Gán giá trị mặc định nếu `chatName` không tồn tại
        }));
  
      formattedChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime);
        const timeB = new Date(b.lastMessageTime);
        return timeB - timeA; // Sắp xếp theo thứ tự giảm dần
      });
  
      console.log("Danh sách chat:", formattedChats);
      setChats(formattedChats);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chat:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách chat");
    } finally {
      setLoading(false);
    }
  };

  const handleShareMessage = async (targetChatId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/messages/${messageId}/share`,
        targetChatId,
        {
          headers: { Authorization: `Bearer ${token}` ,"Content-Type": "application/json" },
          
        }
      );
      Alert.alert("Thành công", "Tin nhắn đã được chia sẻ thành công");
      
    } catch (error) {
      console.error("Lỗi khi chia sẻ tin nhắn:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ tin nhắn");
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.chatName && // Kiểm tra `chat.chatName` tồn tại
      chat.chatName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm nhóm chat..."
        value={searchText}
        onChangeText={setSearchText}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleShareMessage(item.id)}
            >
              <Text style={styles.chatName}>{item.chatName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SelectChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  searchInput: {
    backgroundColor: "#F2F3F5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  chatItem: {
    padding: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    marginBottom: 10,
  },
  chatName: { fontSize: 16, fontWeight: "bold" },
});
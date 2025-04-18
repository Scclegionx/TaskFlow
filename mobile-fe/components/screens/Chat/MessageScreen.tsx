//@ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../../constants/api";
import { useRouter, useFocusEffect } from "expo-router";
import { Menu, Divider, Provider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { formatTimeAgo } from "@/components/utils/timeUtils";
const WEBSOCKET_URL = `${API_BASE_URL.replace("/api", "")}/ws-chat`;

const MessagesScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisible1, setMenuVisible1] = useState(false);
  const [userId, setUserId] = useState();

  const [stompClient, setStompClient] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const router = useRouter();

  const fetchChats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      const response = await axios.get(`${API_BASE_URL}/chat/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formattedChats = response.data.filter(
        (chat) => !chat.deletedForUsers.includes(parseInt(userId))
      );

      // Sắp xếp chats theo lastMessageTime, theo thứ tự giảm dần
      formattedChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime);
        const timeB = new Date(b.lastMessageTime);
        return timeB - timeA; // Sắp xếp theo thứ tự giảm dần
      });

      setChats(formattedChats);
    } catch (error) {
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUsername = await AsyncStorage.getItem("userId");
      setUserId(storedUsername || ""); // Lưu username vào state
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (!token) return;

        const socket = new SockJS(`${WEBSOCKET_URL}?token=${token}`);
        const client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => console.log("STOMP Debug:", str),
          reconnectDelay: 5000,
          onConnect: () => {
            console.log("🟢 Kết nối WebSocket thành công!");
            client.subscribe("/topic/update_last_message", (message) => {
              try {
                const updatedChat = JSON.parse(message.body);
                console.log("🔄 Cập nhật lastMessage:", updatedChat);
                setChats((prevChats) =>
                  prevChats.map((chat) =>
                    chat.id === updatedChat.id
                      ? { ...chat, lastMessage: updatedChat.lastMessage }
                      : chat
                  )
                );
                fetchChats(); // Tải lại danh sách chat sau khi cập nhật
              } catch (error) {
                console.error("❌ Lỗi xử lý update_last_message:", error);
              }
            });

            client.subscribe(
              "/queue/user-" + userId + "/new_chat",
              (message) => {
                try {
                  const newChat = JSON.parse(message.body);
                  console.log("🆕 Nhận chat mới:", newChat);
                  setChats((prevChats) => {
                    if (prevChats.some((chat) => chat.id === newChat.id)) {
                      return prevChats;
                    }
                    return [newChat, ...prevChats];
                  });
                } catch (error) {
                  console.error("❌ Lỗi xử lý new_chat_created:", error);
                }
              }
            );
          },
          onStompError: (frame) => {
            console.error("❌ STOMP Lỗi:", frame);
          },
        });

        client.activate();
        setStompClient(client);
      } catch (error) {
        console.error("❌ WebSocket connection error:", error);
      }
    };

    connectWebSocket();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const deleteChat = async (chatId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.delete(`${API_BASE_URL}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
        Alert.alert("Thành công", "Đã xóa cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Lỗi khi xóa chat:", error);
      Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  return (
    <Provider>
      <View style={styles.container}>
        {/* <Image 
          source={require('@/assets/images/project-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        /> */}
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tin nhắn</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Tùy chọn",
                  "Bạn muốn làm gì?",
                  [
                    {
                      text: "Đoạn chat mới",
                      onPress: () => router.push("/chat/createsinglechat"),
                    },
                    {
                      text: "Tạo nhóm",
                      onPress: () => router.push("/chat/creategroupchat"),
                    },
                    {
                      text: "Hủy",
                      style: "cancel", // Đóng Alert
                    },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Ionicons name="add-circle-outline" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const displayName = item.isGroup
                  ? item.chatName
                  : item.users && Array.isArray(item.users) // Kiểm tra nếu `item.users` tồn tại và là mảng
                  ? item.users
                      .filter((user) => user.id !== parseInt(userId)) // Lấy người dùng khác dựa trên id
                      .map((user) => user.name)
                      .join(", ")
                  : "Người dùng";

                const displayAvatar = item.isGroup
                  ? item.avatarUrl
                  : item.users && Array.isArray(item.users) // Kiểm tra nếu `item.users` tồn tại và là mảng
                  ? item.users.find((user) => user.id !== parseInt(userId))
                      ?.avatar
                  : item.avatarUrl;

                console.log("Display Avatar:", displayAvatar);

                return (
                  <TouchableOpacity
                    style={styles.chatCard}
                    onPress={() =>
                      router.push({
                        pathname: `/chat/${item.id}`,
                        params: { chatName: displayName },
                      })
                    }
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Image
                        source={
                          displayAvatar
                            ? { uri: displayAvatar } // Nếu `displayAvatar` tồn tại, sử dụng URL
                            : require("../../../assets/images/default-avatar.jpg") // Ảnh mặc định
                        }
                        style={styles.avatar}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.chatName}>{displayName}</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={styles.lastMessage}>
                            {item.lastMessage || "Không có tin nhắn"}
                          </Text>
                          <Text style={styles.timeAgo}>
                            {formatTimeAgo(item.lastMessageTime)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "70%",
                        transform: [{ translateY: -10 }],
                      }}
                      onPress={() =>
                        Alert.alert(
                          "Tùy chọn",
                          "Bạn muốn làm gì?",
                          [
                            {
                              text: "Xóa cuộc trò chuyện",
                              onPress: () => deleteChat(item.id),
                              style: "destructive",
                            },
                            {
                              text: "Hủy",
                              style: "cancel",
                            },
                          ],
                          { cancelable: true }
                        )
                      }
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#000" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchChats} />
              }
            />
          )}
        </View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "space-between", // Make sure there's space for the menu
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    position: "absolute",
    right: 0, // Ensure menu is placed at the right edge
    paddingRight: "4%",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
    paddingRight: "10%",
  },
});

export default MessagesScreen;

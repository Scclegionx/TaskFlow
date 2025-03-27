import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const API_URL = `${API_BASE_URL}`;
const WEBSOCKET_URL = `${API_URL.replace("/api", "")}/ws-chat`;

const ChatScreen = () => {
   // 📌 Nhận chatId từ params
   const { chatId } = useLocalSearchParams();
   console.log(chatId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [messageText, setMessageText] = useState("");

  // 📌 Lấy tin nhắn từ API khi vào màn hình
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");

        if (storedUserId) setUserId(parseInt(storedUserId));
        if (!token) {
          console.error("❌ No token found");
          return;
        }

        console.log(`📡 Fetching messages from ${API_URL}/chat/${chatId}/messages`);
        const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedMessages = response.data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.timeStamp),
          user: {
            id: msg.user.id,
            name: msg.user.name,
            avatar: msg.user.avatar,
          },
        }));

        setMessages(formattedMessages.reverse());
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("❌ Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId]);

  // 📌 Kết nối WebSocket
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found");
          return;
        }

        console.log(`🔹 Connecting WebSocket: ${WEBSOCKET_URL}?token=${token}`);
        const socket = new SockJS(`${WEBSOCKET_URL}?token=${token}`);

        const client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => console.log("STOMP Debug:", str),
          reconnectDelay: 5000,
          onConnect: () => {
            console.log("✅ WebSocket connected!");
            client.subscribe(`/topic/chat/${chatId}`, (message) => {
              try {
                console.log("📩 Received WebSocket message:", message.body);
                const receivedMessage = JSON.parse(message.body);

                setMessages((prevMessages) => [
                  {
                    id: receivedMessage.id,
                    text: receivedMessage.content,
                    createdAt: new Date(receivedMessage.timeStamp),
                    user: {
                      id: receivedMessage.user.id,
                      name: receivedMessage.user.name,
                      avatar: receivedMessage.user.avatar,
                    },
                  },
                  ...prevMessages,
                ]);
              } catch (error) {
                console.error("❌ Error parsing WebSocket message:", error);
              }
            });
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
  }, [chatId]);

  // 📌 Gửi tin nhắn
  const sendMessage = async () => {
    if (!messageText.trim() || !stompClient || !userId) return;

    const newMessage = {
      chatId: chatId,
      senderId: userId,
      content: messageText,
    };

    console.log("📤 Sending message:", newMessage);

    stompClient.publish({
      destination: `/app/chat/send`,
      body: JSON.stringify(newMessage),
    });

    setMessageText("");
  };

  // 📌 Hiển thị tin nhắn
  const renderMessageItem = ({ item, index }) => {
    const isCurrentUser = item.user.id === userId;
    const isSameSenderAsPrevious = index < messages.length - 1 && messages[index + 1].user.id === item.user.id;
    const isSameSenderAsNext = index > 0 && messages[index - 1].user.id === item.user.id;
  
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.alignRight : styles.alignLeft]}>
        {/* Bọc tin nhắn trong View để giữ lề đúng */}
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {!isSameSenderAsPrevious && (
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            )}
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.sentMessage : styles.receivedMessage,
            isSameSenderAsPrevious ? styles.groupedTop : {},
            isSameSenderAsNext ? styles.groupedBottom : {},
          ]}
        >
          <Text style={isCurrentUser ? styles.messageText : styles.receivedText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };
  
  

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageItem}
          inverted
        />
      )}

      {/* Nhập Tin Nhắn */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // Nền trắng
  messageContainer: { flexDirection: "row", marginVertical: 4, alignItems: "center" },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 2,
    paddingRight: 15,
    paddingLeft: 10,
    paddingTop: 0,
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 40, // Đảm bảo khoảng trống cho avatar, giúp các tin nhắn thẳng hàng
    alignItems: "center",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  // Tin nhắn gửi đi
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(156, 39, 176, 0.85)",
    borderTopRightRadius: 0, // Nếu là tin giữa nhóm, bỏ bo góc trên phải
  },
  // Tin nhắn nhận được
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F3F5",
    borderTopLeftRadius: 0, // Nếu là tin giữa nhóm, bỏ bo góc trên trái
  },
  groupedTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  groupedBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  receivedText: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F2F3F5",
    borderRadius: 30,
    margin: 10,
  },
  input: { flex: 1, padding: 10, fontSize: 16 },
  sendButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 6,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});


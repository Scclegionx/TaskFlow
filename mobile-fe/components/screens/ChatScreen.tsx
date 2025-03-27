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
      userId: userId,
      content: messageText,
    };

    console.log("📤 Sending message:", newMessage);

    stompClient.publish({
      destination: `/app/chat/${chatId}/send`,
      body: JSON.stringify(newMessage),
    });

    setMessageText("");
  };

  // 📌 Hiển thị tin nhắn
  const renderMessageItem = ({ item }) => (
    <View style={[styles.messageContainer, item.user.id === userId ? styles.sentMessage : styles.receivedMessage]}>
      <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.senderName}>{item.user.name}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  messageContainer: { flexDirection: "row", margin: 8, alignItems: "center" },
  sentMessage: { alignSelf: "flex-end", backgroundColor: "#DCF8C6", borderRadius: 8, padding: 8 },
  receivedMessage: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  textContainer: { maxWidth: "80%" },
  senderName: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#FFF", borderTopWidth: 1, borderColor: "#DDD" },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#DDD", borderRadius: 20 },
  sendButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 20, marginLeft: 10 },
  sendButtonText: { color: "#FFF", fontWeight: "bold" },
});

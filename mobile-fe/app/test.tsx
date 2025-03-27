// // @ts-nocheck
// import React, { useState, useEffect } from "react";
// import { View, ActivityIndicator, StyleSheet } from "react-native";
// import { GiftedChat } from "react-native-gifted-chat";
// import axios from "axios";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "@/constants/api";

// const API_URL = `${API_BASE_URL}`;
// const WEBSOCKET_URL = `${API_URL.replace("/api", "")}/ws-chat`;

// const ChatScreen = () => { 
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [chatId, setChatId] = useState(null);  // ✅ Thêm state để lưu chatId
//   const [stompClient, setStompClient] = useState(null);

//   // 📌 Lấy chatId từ AsyncStorage khi màn hình được mở
//   useEffect(() => {
//     const getChatId = async () => {
//       try {
//         const storedChatId = await AsyncStorage.getItem("chatId");
//         if (storedChatId) {
//           setChatId(storedChatId);
//         } else {
//           console.error("❌ No chatId found in AsyncStorage");
//         }
//       } catch (error) {
//         console.error("❌ Error getting chatId from AsyncStorage:", error);
//       }
//     };

//     getChatId();
//   }, []);

//   // 📌 Load tin nhắn khi có chatId
//   useEffect(() => {
//     if (!chatId) return;  // ✅ Chỉ fetch khi có chatId

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const token = await AsyncStorage.getItem("token");
//         const storedUserId = await AsyncStorage.getItem("userId");

//         if (storedUserId) setUserId(parseInt(storedUserId));
//         if (!token) {
//           console.error("❌ No token found");
//           setLoading(false);
//           return;
//         }

//         console.log(`📡 Fetching messages from ${API_URL}/chat/${chatId}/messages`);
//         const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const formattedMessages = response.data.map((msg) => ({
//           _id: msg.id,
//           text: msg.content,
//           createdAt: new Date(msg.timeStamp),
//           user: {
//             _id: msg.user.id,
//             name: msg.user.name,
//             avatar: msg.user.avatar,
//           },
//         }));

//         setMessages(formattedMessages.reverse());
//         setLoading(false);
//         console.log("✅ Messages loaded successfully");
//       } catch (error) {
//         setLoading(false);
//         console.error("❌ Error fetching messages:", error);
//       }
//     };

//     fetchMessages();
//   }, [chatId]);  // ✅ Chạy lại khi chatId thay đổi

//   // 📌 Kết nối WebSocket khi có chatId
//   useEffect(() => {
//     if (!chatId) return;  // ✅ Chỉ kết nối nếu có chatId

//     const connectWebSocket = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         if (!token) {
//           console.error("❌ No token found");
//           return;
//         }

//         console.log(`🔹 Connecting WebSocket: ${WEBSOCKET_URL}?token=${token}`);
//         const socket = new SockJS(`${WEBSOCKET_URL}?token=${token}`);
//         const client = new Client({
//           webSocketFactory: () => socket,
//           debug: (str) => console.log("STOMP Debug:", str),
//           reconnectDelay: 5000,
//           onConnect: () => {
//             console.log("✅ WebSocket connected!");
//             console.log(`📡 Subscribing to /topic/chat/${chatId}`);

//             client.subscribe(`/topic/chat/${chatId}`, (message) => {
//               try {
//                 console.log("📩 Received message from WebSocket:", message.body);
//                 const receivedMessage = JSON.parse(message.body);

//                 // Chuyển đổi tin nhắn thành định dạng GiftedChat
//                 const newMessage = {
//                   _id: receivedMessage.id,
//                   text: receivedMessage.content,
//                   createdAt: new Date(receivedMessage.timeStamp),
//                   user: {
//                     _id: receivedMessage.user.id,
//                     name: receivedMessage.user.name,
//                     avatar: receivedMessage.user.avatar,
//                   },
//                 };

//                 setMessages((prevMessages) =>
//                   GiftedChat.append(prevMessages, [newMessage])
//                 );
//               } catch (error) {
//                 console.error("❌ Error parsing WebSocket message:", error);
//               }
//             });
//           },
//         });

//         client.activate();
//         setStompClient(client);

//         return () => {
//           client.deactivate();
//           console.log("🔌 WebSocket disconnected.");
//         };
//       } catch (error) {
//         console.error("❌ Error connecting to WebSocket:", error);
//       }
//     };

//     connectWebSocket();
//   }, [chatId]);  // ✅ Chạy lại khi chatId thay đổi

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <GiftedChat messages={messages} user={{ _id: userId }} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });

// export default ChatScreen;

export { default } from '../components/screens/ChatScreen';


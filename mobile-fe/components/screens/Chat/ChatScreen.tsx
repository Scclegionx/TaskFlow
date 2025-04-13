//@ts-nocheck
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
  Modal,
  Alert,
} from "react-native";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Attachment from "@/components/Attachment"; // Import component Attachment
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
const API_URL = `${API_BASE_URL}`;
const WEBSOCKET_URL = `${API_URL.replace("/api", "")}/ws-chat`;

const ChatScreen = () => {
  const { chatId, chatName } = useLocalSearchParams();
  const [chatTitle, setChatTitle] = useState(chatName || "Đang tải...");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileStatus, setFileStatus] = useState(null); 
  const [currentDownloadingFile, setCurrentDownloadingFile] = useState(null); // Tên file đang tải// Trạng thái tải file
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");

        if (storedUserId) setUserId(parseInt(storedUserId));
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedMessages = response.data
          .filter(
            (msg) =>
              !msg.deletedForUsers.some(
                (user) => user.id == parseInt(storedUserId)
              ) // Exclude messages deleted for current user
          )
          .map((msg) => ({
            id: msg.id,
            text: msg.content,
            createdAt: new Date(msg.timeStamp),
            user: {
              id: msg.user.id,
              name: msg.user.name,
              avatar: msg.user.avatar,
            },
            attachmentUrl: msg.attachmentUrl,
            attachmentType: msg.attachmentType,
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

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: chatTitle,
        headerTitle: () => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: `/chat/chatdetail`,
                params: { chatId, chatName },
              })
            }
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {chatTitle}
            </Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/chat/meeting`,
                  params: { chatId, chatName },
                })
              }
            >
              <Image
                source={require("@/assets/images/call.png")}
                style={{ width: 24, height: 24, marginRight: 20 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/chat/chatdetail`,
                  params: { chatId, chatName },
                })
              }
            >
              <Ionicons name="information-circle" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation, chatTitle])
  );
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          return;
        }
        const socket = new SockJS(`${WEBSOCKET_URL}?token=${token}`);
        const client = new Client({
          webSocketFactory: () => socket,
          debug: (str) => console.log("STOMP Debug:", str),
          reconnectDelay: 5000,
          onConnect: () => {
            client.subscribe(`/topic/chat/${chatId}`, (message) => {
              try {
                const receivedMessage = JSON.parse(message.body);
                console.log("📩 Nhận tin nhắn:", receivedMessage);
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
                    attachmentUrl: receivedMessage.attachmentUrl,
                    attachmentType: receivedMessage.attachmentType,
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
  // 🔹 Xử lý chọn file
  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Chấp nhận tất cả các loại tệp
        copyToCacheDirectory: true,
      });

      console.log("Document Picker Result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log("Selected file:", selectedFile);
        setFile(selectedFile); // Lưu tệp đã chọn vào state
      } else if (result.canceled) {
        console.log("User canceled file picker");
      } else {
        console.error("Unexpected result from DocumentPicker:", result);
      }
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };
  // 🔹 Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!messageText.trim() && !file) return;

    let fileUrl = null;
    if (file) {
      fileUrl = await uploadFile(file);
      console.log("fileurl hanhlde:", fileUrl); // Upload file và lấy URL
      if (!fileUrl) return; // Nếu upload thất bại thì không gửi tin nhắn
    }
    console.log("đã upload");
    sendMessage(fileUrl); // Gửi tin nhắn kèm file URL (nếu có)
  };

  // 📌 Gửi tin nhắn
  const sendMessage = async (data) => {
    console.log("📤 Gửi tin nhắn:", messageText, data);
    if ((!messageText.trim() && !file) || !stompClient || !userId) return;
    const newMessage = {
      chatId: chatId,
      senderId: userId,
      content: messageText,
      attachmentUrl: file ? data.fileUrl : null,
      attachmentType: file ? data.attachmentType : null,
      timeStamp: new Date().toISOString(),
    };
    stompClient.publish({
      destination: `/app/chat/send`,
      body: JSON.stringify(newMessage),
    });
    console.log("📤 Tin nhắn đã được gửi:", newMessage);

    setMessageText("");
  };
  const uploadFile = async (file) => {
    setUploading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("❌ Không tìm thấy token, vui lòng đăng nhập lại.");
      setUploading(false);
      return null;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream", // MIME type mặc định
    });

    try {
      const response = await fetch(`${API_URL}/chat/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log(`📌 API Response Status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Lỗi upload file: ${errorText}`);
        setUploading(false);
        return null;
      }

      const data = await response.json();
      console.log("✅ File uploaded thành công:", data.fileUrl);

      setUploading(false);
      setFile(null); // Reset file state after upload
      return data;
    } catch (error) {
      console.error("❌ Upload file thất bại:", error);
      setUploading(false);
      return null;
    }
  };
  // 📌 Hiển thị tin nhắn
  const renderMessageItem = ({ item, index }) => {
    const isCurrentUser = item.user.id === userId;
    const isSameSenderAsPrevious =
      index < messages.length - 1 &&
      messages[index + 1].user.id === item.user.id;
    const isSameSenderAsNext =
      index > 0 && messages[index - 1].user.id === item.user.id;

    const handleDeleteMessage = async (messageId) => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        await axios.delete(`${API_URL}/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
        console.log("✅ Tin nhắn đã được xóa:", messageId);
      } catch (error) {
        console.error("❌ Lỗi khi xóa tin nhắn:", error);
      }
    };
    const handleHideMessage = async (messageId) => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // Gọi API để ẩn tin nhắn
        await axios.post(
          `${API_URL}/messages/${messageId}/hide`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Cập nhật danh sách tin nhắn sau khi ẩn
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
        console.log("✅ Tin nhắn đã được ẩn:", messageId);
      } catch (error) {
        console.error("❌ Lỗi khi ẩn tin nhắn:", error);
      }
    };
    const handleDownloadFile = async (fileUrl) => {
      try {
        const fileName = fileUrl.split("/").pop(); // Lấy tên file từ URL
        setCurrentDownloadingFile(fileName); // Lưu tên file vào state
        setFileStatus("Đang tải..."); // Hiển thị trạng thái đang tải
    
        const fileUri = `${FileSystem.documentDirectory}${fileName}`; // Đường dẫn lưu file cục bộ
    
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          fileUri
        );
    
        const { uri } = await downloadResumable.downloadAsync();
        console.log("✅ File đã được tải về:", uri);
    
        setFileStatus("Đã tải xong"); // Cập nhật trạng thái tải xong
        setCurrentDownloadingFile(null); // Xóa tên file sau khi tải xong
    
        // Kiểm tra xem thiết bị có hỗ trợ chia sẻ file không
        if (await Sharing.isAvailableAsync()) {
          setFileStatus("Đang chia sẻ..."); // Cập nhật trạng thái chia sẻ
          await Sharing.shareAsync(uri);
          setFileStatus("Đã chia sẻ xong"); // Cập nhật trạng thái chia sẻ xong
        } else {
          Alert.alert("Thông báo", "File đã được tải về thiết bị.");
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải file:", error);
        Alert.alert("Lỗi", "Không thể tải file. Vui lòng thử lại.");
        setFileStatus("Lỗi khi tải file"); // Cập nhật trạng thái lỗi
        setCurrentDownloadingFile(null); // Xóa tên file khi xảy ra lỗi
      } finally {
        setTimeout(() => setFileStatus(null), 3000); // Ẩn trạng thái sau 3 giây
      }
    };
    return (
      <View
        style={[
          styles.messageRow,
          isCurrentUser ? styles.alignRight : styles.alignLeft,
        ]}
      >
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            {!isSameSenderAsPrevious && (
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            )}
          </View>
        )}

        <TouchableOpacity
          style={{ width: "100%" }}
          onPress={() => {
            if (item.attachmentUrl) {
              if (item.attachmentType === "image") {
                setSelectedImage(item.attachmentUrl); // Hiển thị ảnh
              } else if (item.attachmentType === "video") {
              } else {
                handleDownloadFile(item.attachmentUrl); // Tải file khác
              }
            }
          }}
          onLongPress={() => {
            const options = [];

            // Nếu là tin nhắn của chính mình
            if (isCurrentUser) {
              options.push({
                text: "Ẩn",
                onPress: () => {
                  // Mở alert phụ: chọn giữa Ẩn và Xóa
                  Alert.alert(
                    "Tin nhắn của bạn",
                    "Bạn muốn ẩn hay xóa tin nhắn này?",
                    [
                      {
                        text: "Ẩn",
                        onPress: () => handleHideMessage(item.id),
                      },
                      {
                        text: "Xóa với mọi người",
                        onPress: () => handleDeleteMessage(item.id),
                        style: "destructive",
                      },
                      {
                        text: "Hủy",
                        style: "cancel",
                      },
                    ]
                  );
                },
              });
            } else {
              // Nếu là tin nhắn của người khác
              options.push({
                text: "Ẩn",
                onPress: () => handleHideMessage(item.id),
              });
            }

            // Chia sẻ (ai cũng có)
            options.push({
              text: "Chia sẻ",
              onPress: () =>
                router.push({
                  pathname: "/chat/selectchat",
                  params: { messageId: item.id },
                }),
            });

            // Hủy (luôn ở cuối, không lọc)
            options.push({
              text: "Hủy",
              style: "cancel",
            });

            // Hiển thị Alert chính
            Alert.alert(
              "Tùy chọn tin nhắn",
              "Bạn muốn làm gì với tin nhắn này?",
              options
            );
          }}
        >
          {item.attachmentUrl && (
            <Attachment
              attachmentUrl={item.attachmentUrl}
              attachmentType={item.attachmentType}
              style={[
                isCurrentUser
                  ? { alignItems: "flex-end", width: "100%" }
                  : { alignItems: "flex-start", width: "100%" },
              ]}
            />
          )}
          {item.text && (
            <View
              style={[
                styles.messageBubble,
                isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                isSameSenderAsPrevious ? styles.groupedTop : {},
                isSameSenderAsNext ? styles.groupedBottom : {},
              ]}
            >
              <Text
                style={isCurrentUser ? styles.messageText : styles.receivedText}
              >
                {item.text}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
      {fileStatus && (
  <View style={styles.fileStatusContainer}>
    <Text style={styles.fileStatusText}>
      {fileStatus} {currentDownloadingFile ? `: ${currentDownloadingFile}` : ""}
    </Text>
  </View>
)}
      {/* Modal hiển thị ảnh toàn màn hình */}
      {selectedImage && (
        <Modal visible={true} transparent={true}>
          <View style={styles.fullscreenImageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)} // Đóng modal
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {file && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.selectedFileName}>{file.name}</Text>
          <TouchableOpacity
            onPress={() => setFile(null)} // Xóa tệp đã chọn
            style={styles.removeFileButton}
          >
            <Text style={styles.removeFileButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { height: Math.max(40, inputHeight) }]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Nhập tin nhắn..."
          multiline={true}
          onContentSizeChange={(contentWidth, contentHeight) =>
            setInputHeight(contentHeight)
          }
        />
        <TouchableOpacity onPress={handleFileChange} style={styles.fileButton}>
          <Text style={styles.fileButtonText}>Chọn tệp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSendMessage}
          style={styles.sendButton}
          disabled={uploading}
        >
          {!uploading ? (
            <Text style={styles.sendButtonText}>Gửi</Text>
          ) : (
            <Text style={styles.sendButtonText}>Đang gửi...</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "center",
  },
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
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(156, 39, 176, 0.85)",
    borderTopRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F3F5",
    borderTopLeftRadius: 0,
  },
  groupedTop: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  groupedBottom: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  receivedText: {
    fontSize: 16,
    color: "#000",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  fileStatusContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  fileStatusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
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
  selectedFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F3F5",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  removeFileButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeFileButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

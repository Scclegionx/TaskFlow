//@ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import moment from "moment";
import { Video } from "expo-av";
import AddMemberModal from "@/app/chat/addmember"; // Import your modal component
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
const ChatDetailScreen = () => {
  const { chatId, chatName } = useLocalSearchParams();
  const [chatDetail, setChatDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("image");
  const [tabFiles, setTabFiles] = useState<any[]>([]);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State để quản lý ảnh được chọn
  const navigation = useNavigation();
  const router = useRouter(); // Sử dụng router từ expo-router
  const handleLeaveGroup = async () => {
    if (chatDetail?.admin?.id === userId) {
      Alert.alert(
        "Thông báo",
        "Bạn là admin, không thể rời nhóm. Vui lòng chuyển quyền admin trước."
      );
      return;
    }
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn rời nhóm?", [
      {
        text: "Rời nhóm",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const response = await fetch(
              `${API_BASE_URL}/chat/${chatId}/leave`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Lỗi khi rời nhóm:", errorText);
              Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại.");
              return;
            }

            Alert.alert("Thành công", "Bạn đã rời nhóm.");
            // Điều hướng về màn hình danh sách chat
            router.push({
              pathname: "/(tabs)/message",
            });
          } catch (error) {
            console.error("❌ Lỗi khi gọi API rời nhóm:", error);
            Alert.alert("Lỗi", "Không thể rời nhóm. Vui lòng thử lại.");
          }
        },
        style: "destructive",
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };
  const handleDeleteGroup = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa nhóm?", [
      {
        text: "Xóa nhóm",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const response = await fetch(
              `${API_BASE_URL}/chat/${chatId}/delete`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Lỗi khi xóa nhóm:", errorText);
              Alert.alert("Lỗi", "Không thể xóa nhóm. Vui lòng thử lại.");
              return;
            }

            Alert.alert("Thành công", "Nhóm đã được xóa.");
            router.push({
              pathname: "/(tabs)/message",
            });
          } catch (error) {
            console.error("❌ Lỗi khi gọi API xóa nhóm:", error);
            Alert.alert("Lỗi", "Không thể xóa nhóm. Vui lòng thử lại.");
          }
        },
        style: "destructive",
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };
  useEffect(() => {
    navigation.setOptions({
      title: chatName,
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
      },
    });
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Tùy chọn",
              "Bạn muốn làm gì?",
              [
                {
                  text: "Rời nhóm",
                  onPress: handleLeaveGroup,
                  style: "destructive",
                },
                chatDetail?.admin?.id === userId && {
                  text: "Xóa nhóm",
                  onPress: handleDeleteGroup,
                  style: "destructive",
                },
                { text: "Hủy", style: "cancel" },
              ].filter(Boolean) // Loại bỏ null nếu không phải admin
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [chatDetail, userId]);
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Đặt ảnh được chọn
  };
  const handleCloseImageModal = () => {
    setSelectedImage(null); // Đóng modal
  };
  useEffect(() => {
    const fetchChatDetail = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!token || !storedUserId) return;

        setUserId(Number(storedUserId));

        const res = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChatDetail(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetail();
  }, [chatId]);

  const handleAvatarPress = async () => {
    let imageUrl = "";

    if (chatDetail.isGroup) {
      imageUrl = chatDetail.avatarUrl;
      console.log("group", chatDetail.avatarUrl);
    } else {
      const otherUser = chatDetail.users.find((u: any) => u.id !== userId);
      imageUrl = otherUser?.avatar;
      console.log("otherUser", otherUser);
    }

    // Kiểm tra quyền admin và trạng thái nhóm
    if (chatDetail.isGroup && chatDetail.admin?.id === userId) {
      // Admin group
      Alert.alert("Ảnh đại diện", "Bạn muốn làm gì?", [
        {
          text: "Xem ảnh",
          onPress: () => {
            if (imageUrl) {
              handleImagePress(imageUrl);
            } else {
              Alert.alert("Thông báo", "Không có ảnh để hiển thị.");
            }
          },
        },
        {
          text: "Đổi ảnh",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled) {
              const selectedImage = result.assets[0].uri;
              console.log("Ảnh đã chọn:", selectedImage);
              await handleChangeAvatar(selectedImage);
            } else {
              console.log("Người dùng đã hủy chọn ảnh.");
            }
          },
        },
        {
          text: "Huỷ",
          style: "cancel",
        },
      ]);
    } else {
      // Không phải admin hoặc là chat 1-1
      Alert.alert("Ảnh đại diện", "Bạn muốn làm gì?", [
        {
          text: "Xem ảnh",
          onPress: () => {
            if (imageUrl) {
              handleImagePress(imageUrl);
            } else {
              Alert.alert("Thông báo", "Không có ảnh để hiển thị.");
            }
          },
        },
        {
          text: "Huỷ",
          style: "cancel",
        },
      ]);
    }
  };

  const handleChangeAvatar = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token.");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(
        `${API_BASE_URL}/chat/${chatId}/change-avatar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Lỗi khi đổi ảnh:", errorText);
        Alert.alert("Lỗi", "Không thể đổi ảnh. Vui lòng thử lại.");
        return;
      }

      const updatedChat = await response.json();
      setChatDetail(updatedChat); // Cập nhật chi tiết nhóm với ảnh mới
      Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
    } catch (error) {
      console.error("❌ Lỗi khi gọi API đổi ảnh:", error);
      Alert.alert("Lỗi", "Không thể đổi ảnh. Vui lòng thử lại.");
    }
  };

  const handleChangeAdmin = async (newAdminId: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn chuyển quyền admin?", [
      {
        text: "Chuyển quyền",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              Alert.alert("Lỗi", "Không tìm thấy token.");
              return;
            }

            const response = await fetch(
              `${API_BASE_URL}/chat/${chatId}/change-admin`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newAdminId }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Lỗi khi chuyển quyền admin:", errorText);
              Alert.alert(
                "Lỗi",
                "Không thể chuyển quyền admin. Vui lòng thử lại."
              );
              return;
            }

            const updatedChat = await response.json();
            setChatDetail(updatedChat); // Cập nhật chi tiết nhóm
            Alert.alert("Thành công", "Quyền admin đã được chuyển.");
          } catch (error) {
            console.error("❌ Lỗi khi gọi API chuyển quyền admin:", error);
            Alert.alert(
              "Lỗi",
              "Không thể chuyển quyền admin. Vui lòng thử lại."
            );
          }
        },
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };
  const handleAddMember = async (memberId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("❌ Không tìm thấy token");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/chat/${chatId}/add-member`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [memberId] }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Lỗi khi thêm thành viên:", errorText);
        Alert.alert("Lỗi", "Không thể thêm thành viên. Vui lòng thử lại.");
        return;
      }

      const updatedChat = await response.json();
      setChatDetail(updatedChat); // Cập nhật danh sách thành viên
      Alert.alert("Thành công", "Đã thêm thành viên vào nhóm.");
      setAddMemberModalVisible(false); // Đóng modal
    } catch (error) {
      console.error("❌ Lỗi khi gọi API thêm thành viên:", error);
      Alert.alert("Lỗi", "Không thể thêm thành viên. Vui lòng thử lại.");
    }
  };

  const handleRemoveMember = async (id: number) => {
    Alert.alert("Xác nhận", "Xoá thành viên này khỏi nhóm?", [
      {
        text: "Xoá",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              console.error("❌ Không tìm thấy token");
              return;
            }

            const response = await fetch(
              `${API_BASE_URL}/chat/${chatId}/remove-member`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds: [id] }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Lỗi khi xoá thành viên:", errorText);
              Alert.alert("Lỗi", "Không thể xoá thành viên. Vui lòng thử lại.");
              return;
            }

            const updatedChat = await response.json();
            setChatDetail(updatedChat); // Cập nhật lại danh sách thành viên
            Alert.alert("Thành công", "Đã xoá thành viên khỏi nhóm.");
          } catch (error) {
            console.error("❌ Lỗi khi gọi API xoá thành viên:", error);
            Alert.alert("Lỗi", "Không thể xoá thành viên. Vui lòng thử lại.");
          }
        },
        style: "destructive",
      },
      { text: "Huỷ", style: "cancel" },
    ]);
  };

  const fetchFilesByType = async (type: string) => {
    try {
      setLoadingTab(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/messages/${chatId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTabFiles(data || []);
    } catch (err) {
      console.error("Lỗi khi tải tệp:", err);
    } finally {
      setLoadingTab(false);
    }
  };
  useEffect(() => {
    fetchFilesByType(selectedTab);
  }, [selectedTab]);

  if (loading || userId === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!chatDetail) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy đoạn chat</Text>
      </View>
    );
  }
//   const handleFilePress = (fileUrl: string) => {
//     Linking.openURL(fileUrl).catch((err) =>
//       console.error("Không thể mở file:", err)
//     );
//   };


const handleFilePress = async (fileUrl: string) => {
  try {
    setFileStatus("Đang tải..."); // Cập nhật trạng thái
    const fileName = fileUrl.split("/").pop(); // Lấy tên file từ URL
    const localUri = `${FileSystem.documentDirectory}${fileName}`;

    // Tải file về thiết bị
    const downloadResumable = FileSystem.createDownloadResumable(
      fileUrl,
      localUri
    );

    const { uri } = await downloadResumable.downloadAsync();
    console.log("File đã được tải về:", uri);

    setFileStatus("Đã tải xong"); // Cập nhật trạng thái

    // Kiểm tra xem thiết bị có hỗ trợ mở file không
    if (await Sharing.isAvailableAsync()) {
      setFileStatus("Đang chia sẻ..."); // Cập nhật trạng thái
      await Sharing.shareAsync(uri);
      setFileStatus("Đã chia sẻ xong"); // Cập nhật trạng thái
    } else {
      setFileStatus("Đang mở file..."); // Cập nhật trạng thái
      IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: uri,
        flags: 1,
      });
      setFileStatus("Đã mở file"); // Cập nhật trạng thái
    }
  } catch (err) {
    console.error("Không thể tải hoặc mở file:", err);
    Alert.alert("Lỗi", "Không thể tải hoặc mở file. Vui lòng thử lại.");
    setFileStatus("Lỗi khi tải file"); // Cập nhật trạng thái
  } finally {
    setTimeout(() => setFileStatus(null), 3000); // Ẩn trạng thái sau 3 giây
  }
};
  const filteredMembers = chatDetail.users.filter((user: any) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const isGroup = chatDetail.isGroup;
  const isCurrentUserAdmin = chatDetail.admin?.id === userId;

  const otherUser = !isGroup
    ? chatDetail.users.find((u: any) => u.id !== userId)
    : null;

  const avatarUrl = isGroup
    ? chatDetail.avatarUrl || "https://via.placeholder.com/100"
    : otherUser?.avatar || "https://via.placeholder.com/100";

  return (
    <ScrollView style={styles.container}>
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
              onPress={handleCloseImageModal}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <TouchableOpacity onPress={handleAvatarPress}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      </TouchableOpacity>

      <Text style={styles.name}>{chatName}</Text>
      <AddMemberModal
        visible={isAddMemberModalVisible}
        onClose={() => setAddMemberModalVisible(false)}
        onAddMember={handleAddMember}
        chatDetail={chatDetail} // Pass chatDetail to the modal
      />
      {isGroup && (
        <View style={styles.groupSection}>
          <Text style={styles.sectionTitle}>👥 Thành viên nhóm</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thành viên..."
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <ScrollView style={styles.memberScroll}>
            {filteredMembers.map((user: any) => (
              <TouchableOpacity
                key={user.id}
                style={styles.memberRow}
                onPress={() => {
                  if (isCurrentUserAdmin && user.id !== userId) {
                    Alert.alert(
                      "Tùy chọn thành viên",
                      `Bạn muốn làm gì với thành viên ${user.name}?`,
                      [
                        {
                          text: "Chuyển quyền admin",
                          onPress: () => handleChangeAdmin(user.id),
                        },
                        {
                          text: "Xóa thành viên",
                          onPress: () => handleRemoveMember(user.id),
                          style: "destructive",
                        },
                        { text: "Hủy", style: "cancel" },
                      ]
                    );
                  } else if (user.id === userId) {
                    Alert.alert(
                      "Thông báo",
                      "Bạn không thể thực hiện hành động này với chính mình."
                    );
                  } else {
                    Alert.alert(
                      "Thông báo",
                      "Bạn không có quyền thực hiện hành động này."
                    );
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Image
                    source={{
                      uri: user.avatar || "https://via.placeholder.com/100",
                    }}
                    style={styles.memberAvatar}
                  />
                  <Text style={styles.memberName}>
                    {user.name}
                    {chatDetail.admin?.id === user.id && (
                      <Text style={styles.adminTag}> (admin)</Text>
                    )}
                    {userId === user.id && (
                      <Text style={styles.adminTag}> (bạn)</Text>
                    )}
                  </Text>
                  {/* Hiển thị nút Xóa nếu không phải chính mình */}
                </View>
                {isCurrentUserAdmin && user.id !== userId && (
                  <TouchableOpacity onPress={() => handleRemoveMember(user.id)}>
                    <Text style={styles.removeText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isCurrentUserAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddMemberModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Thêm thành viên</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    {fileStatus && (
  <View style={styles.fileStatusContainer}>
    <Text style={styles.fileStatusText}>{fileStatus}</Text>
  </View>
)}
      <View style={styles.tabSection}>
        <View style={styles.tabRow}>
          {["image", "video", "pdf", "raw"].map((type) => (
            <TouchableOpacity key={type} onPress={() => setSelectedTab(type)}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === type && styles.activeTab,
                ]}
              >
                {type === "image"
                  ? "📷 Ảnh"
                  : type === "video"
                  ? "🎥 Video"
                  : type === "pdf"
                  ? "📄 PDF"
                  : "📁 Khác"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingTab ? (
          <ActivityIndicator size="small" color="#555" />
        ) : tabFiles.length === 0 ? (
          <Text style={styles.emptyText}>Không có tệp nào</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.fileList}>
            {tabFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                {selectedTab === "image" ? (
                  <TouchableOpacity
                    onPress={() => handleImagePress(file.attachmentUrl)}
                  >
                    <Image
                      source={{ uri: file.attachmentUrl }}
                      style={styles.previewImage}
                    />
                  </TouchableOpacity>
                ) : selectedTab === "video" ? (
                  <Video
                    source={{ uri: file.attachmentUrl }}
                    useNativeControls
                    resizeMode="contain"
                    style={styles.previewVideo}
                  ></Video>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleFilePress(file.attachmentUrl)}
                  >
                    <Text style={styles.fileName}>
                      {file.attachmentUrl.split("/").pop()}
                    </Text>
                    <Text
                      style={{ color: "blue", textDecorationLine: "underline" }}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.fileDetails}>
                  {file.user.name} -{" "}
                  {moment(file.timeStamp).format("YYYY-MM-DD HH:mm:ss")}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#fff",
    padding: 16,
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 12,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  groupSection: {
    marginBottom: 20,
  },
  memberScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  memberName: {
    fontSize: 14,
  },
  adminTag: {
    fontSize: 12,
    color: "green",
  },
  removeText: {
    color: "red",
    fontSize: 14,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  tabSection: {
    marginTop: 20,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabText: {
    fontSize: 14,
    color: "#007BFF",
  },
  activeTab: {
    fontWeight: "bold",
  },
  fileList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  fileItem: {
    width: "48%",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  previewVideo: {
    width: "100%",
    height: 200,
  },
  fileName: {
    fontSize: 12,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
  fileDetails: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  fileStatusContainer: {
    position: "absolute",
    bottom: 20,
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
});

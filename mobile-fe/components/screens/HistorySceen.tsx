import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Modal, ScrollView } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@/constants/api";
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";



interface UserProfile {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
  avatar: string;
}

interface inforUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
}


interface TaskHistory {
  id: number;
  taskId: number;
  modifiedBy: number;
  modifiedAt: string;
  data: {
    title: string;
    description?: string;
    status: number;
    fromDate: string;
    toDate: string;
    createdAt: string;
    level: number;
    // Thêm các trường khác theo dữ liệu thực tế
  };
  modifiedByAvatar: string;
  modifiedByName: string;
}

const AllPersonelScreen = () => {

  const router = useRouter();

  const navigation = useNavigation(); // Use the hook to get the navigation object

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Quản lý lịch sử thay đổi" }); // Cập nhật tiêu đề
  }, [navigation]);

  const [search, setSearch] = useState("");
  const [data, setData] = useState<{ name: string; email: string }[]>([]);
  const [filteredData, setFilteredData] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<TaskHistory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);


  const [searchText, setSearchText] = useState("");



  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"]; // danh sách màu



  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lấy danh sách user từ API

  useEffect(() => {
    fetchProfile(); // Chỉ gọi API lấy profile khi component mount
    fetchTaskHistory(""); // Gọi API lấy danh sách nhân sự ngay khi vào màn hình
  }, []);

  const fetchProfile = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profileData: UserProfile = await response.json();
        setProfile(profileData);
      } else {
        console.error("Lỗi khi lấy dữ liệu người dùng.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API profile:", error);
    }
  };

  const getLevelText = (status: number) => {

    switch (status) {
      case 0: return 'Dễ';
      case 1: return 'Trung bình';
      case 2: return 'Khó';
      default: return 'Không xác định';
    }
  };

  const getStatusTask = (status: number) => {

    switch (status) {
      case 0: return 'Chờ nhận việc';
      case 1: return 'Đang xử lý';
      case 2: return 'Hoàn thành';
      case 3: return 'Từ chối';
      case 4: return 'Quá hạn';
      default: return 'Không xác định';
    }
  };

  const handleRollback = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/tasks/rollback-task?taskHistoryId=${selectedItem.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Thực hiện quay lại lịch sử thành công!");
        setModalVisible(false);
        fetchTaskHistory(searchText); // Refresh lại danh sách
      } else {
        throw new Error("Rollback thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskHistory = async (searchText: string) => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/tasks/get-task-history?textSearch=${searchText}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const parsedData = data.map((item: any) => ({
          ...item,
          data: JSON.parse(item.data) // Parse JSON string to object
        }));
        setFilteredData(parsedData);
      }
    } catch (error) {
      Alert.alert("Lỗi khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTaskHistory(searchText);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const downloadExcel = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/document/download-excel-lich-su`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to download");

      // Convert response to blob
      const blob = await response.blob();

      // Convert blob to base64 với kiểm tra null
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!reader.result) {
            return reject("Không đọc được dữ liệu");
          }

          if (typeof reader.result === "string") {
            resolve(reader.result.split(",")[1]);
          } else {
            resolve(Buffer.from(reader.result).toString("base64"));
          }
        };
        reader.onerror = () => reject("Lỗi đọc file");
        reader.readAsDataURL(blob);
      });

      // Tạo file path
      const fileUri = FileSystem.documentDirectory + "NhanSu.xlsx";

      // Ghi file
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Mở file
      const contentUri = await FileSystem.getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

    } catch (error) {
      Alert.alert("Lỗi khi tải file" || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ padding: 16, backgroundColor: "#F8F9FA", flex: 1 }}>

      {/* 🔍 Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <FontAwesome name="search" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log("Download button pressed");
          downloadExcel();
        }} style={{ backgroundColor: "#007BFF", padding: 10, borderRadius: 8, marginLeft: 10 }}>
          <FontAwesome name="download" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {/* Kiểm tra nếu đang load dữ liệu */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : (
        <>

          <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>Tổng số: {filteredData.length}</Text>


          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: colors[index % colors.length],
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 8,
                  flexDirection: 'row', // Thêm dòng này
                  alignItems: 'flex-start', // Căn các item theo đầu hàng
                }}
                onPress={() => {
                  setSelectedItem(item);
                  setModalVisible(true);
                }}
              >
                {/* Phần avatar */}
                <Image
                  source={{
                    uri: item.modifiedByAvatar
                      ? item.modifiedByAvatar
                      : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s'
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginTop : 15,
                    marginRight: 10,
                  }}
                />
            
                {/* Phần thông tin bên phải */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.data.title}</Text>
                  </View>
            
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#666', fontSize: 12 }}>
                      {formatDateTime(item.modifiedAt)}
                    </Text>
                  </View>
            
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 14 }}>
                      Người chỉnh sửa: {item.modifiedByName}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedItem && (
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết trước khi thay đổi</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Nội dung scroll được */}
              <ScrollView style={styles.modalBody}>
                <InfoRow label="Tiêu đề:" value={selectedItem.data.title} />
                <InfoRow label="Mô tả:" value={selectedItem.data.description || 'Không có'} />

                <InfoRow
                  label="Mức độ:"
                  value={getLevelText(selectedItem.data.level)}
                />

                <InfoRow
                  label="Trạng thái:"
                  value={getStatusTask(selectedItem.data.status)}
                />

                <InfoRow
                  label="Từ ngày:"
                  value={formatDateTime(selectedItem.data.fromDate)}
                />

                <InfoRow
                  label="Đến ngày:"
                  value={formatDateTime(selectedItem.data.toDate)}
                />

                <InfoRow
                  label="Ngày tạo:"
                  value={formatDateTime(selectedItem.data.createdAt)}
                />

               
                {/* Thêm các trường dữ liệu khác tùy ý */}
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.rollbackButton}
                  onPress={handleRollback}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Quay lại với lịch sử này</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ADDCE3",
    borderRadius: 10,
    marginBottom: 10,
  },
  istItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contentWrapper: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold', 
    fontSize: 16
  },
  timeText: {
    color: '#666', 
    fontSize: 12
  },
  modifierText: {
    fontSize: 14,
    marginTop: 8
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10
  },
  searchButton: {
    // backgroundColor: "#007BFF",
    backgroundColor: "#8384F8",
    padding: 10,
    borderRadius: 8
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#666',
    width: '30%',
  },
  infoValue: {
    width: '65%',
    color: '#333',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rollbackButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
export default AllPersonelScreen;

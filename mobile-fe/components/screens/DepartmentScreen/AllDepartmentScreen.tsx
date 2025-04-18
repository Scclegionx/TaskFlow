import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, Modal, Pressable } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@/constants/api";
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  leader: User;
  status: string | null;
}

const AllDepartmentScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredData, setFilteredData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    leaderId: ""
  });

  const [users, setUsers] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [isUserListVisible, setIsUserListVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"];

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Danh sách phòng ban" });
  }, [navigation]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async (search = "") => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Missing auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/department/get-all-department?textSearch=${search}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        setFilteredData(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDepartments(searchText);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      fetchUsers();
    }
  };

  // Hàm xử lý chọn leader
  const handleSelectLeader = (user: User) => {
    setSelectedLeader(user);
    setIsUserListVisible(false);
    setNewDepartment({ ...newDepartment, leaderId: user.id.toString() });
  };

  // Render item trong danh sách user
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleSelectLeader(item)}
    >
      <Image
        source={{ uri: item.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s" }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleCreateDepartment = async () => {
    if (!newDepartment.name || !newDepartment.leaderId) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/department/create-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newDepartment),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Tạo phòng ban thành công");
        toggleModal();
        fetchDepartments(); // Load lại danh sách
        setNewDepartment({ name: "", description: "", leaderId: "" }); // Reset form
      } else {
        const errorData = await response.json();
        Alert.alert("Lỗi", errorData.message || "Tạo phòng ban thất bại");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    }
  };

  const fetchUsers = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/get-all-user`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    }
  };

  const renderCreateModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tạo phòng ban mới</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên phòng ban"
            value={newDepartment.name}
            onChangeText={(text) => setNewDepartment({ ...newDepartment, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={newDepartment.description}
            onChangeText={(text) => setNewDepartment({ ...newDepartment, description: text })}
          />

          <TouchableOpacity
            style={styles.leaderSelector}
            onPress={() => setIsUserListVisible(!isUserListVisible)}
          >
            {selectedLeader ? (
              <View style={styles.selectedLeader}>
                <Image
                  source={{ uri: selectedLeader.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s" }}
                  style={styles.selectedAvatar}
                />
                <View>
                  <Text style={styles.leaderName}>{selectedLeader.name}</Text>
                  <Text style={styles.leaderEmail}>{selectedLeader.email}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Chọn trưởng phòng</Text>
            )}
          </TouchableOpacity>

          {isUserListVisible && (
            <View style={styles.userListContainer}>
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.userListContent}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={toggleModal}>
              <Text style={styles.buttonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateDepartment}
              disabled={!selectedLeader}
            >
              <Text style={styles.buttonText}>Tạo</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chỉnh sửa phòng ban</Text>

          {/* Các trường input giống modal tạo mới */}
          <TextInput
            style={styles.input}
            placeholder="Tên phòng ban"
            value={newDepartment.name}
            onChangeText={(text) => setNewDepartment({ ...newDepartment, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={newDepartment.description}
            onChangeText={(text) => setNewDepartment({ ...newDepartment, description: text })}
          />

          {/* Phần chọn leader giống modal tạo mới */}
          <TouchableOpacity
            style={styles.leaderSelector}
            onPress={() => setIsUserListVisible(!isUserListVisible)}
          >
            {selectedLeader ? (
              <View style={styles.selectedLeader}>
                <Image
                  source={{ uri: selectedLeader.avatar || "https://via.placeholder.com/50" }}
                  style={styles.selectedAvatar}
                />
                <View>
                  <Text style={styles.leaderName}>{selectedLeader.name}</Text>
                  <Text style={styles.leaderEmail}>{selectedLeader.email}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Chọn trưởng phòng</Text>
            )}
          </TouchableOpacity>

          {isUserListVisible && (
            <View style={styles.userListContainer}>
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.userListContent}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.createButton]}
              onPress={handleUpdateDepartment}
            >
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDepartmentItem = ({ item, index }: { item: Department; index: number }) => (
    <TouchableOpacity
      style={[styles.departmentItem, { backgroundColor: colors[index % colors.length] }]}
      // onPress={() => router.push({ pathname: "/departmentDetail", params: { departmentId: item.id } })}
      onPress={() => router.push({ pathname: "/Department/detailDepartment", params: { departmentId: item.id } })}
    >
      <View style={styles.departmentInfo}>
        <Text style={styles.departmentName}>Phòng : {item.name}</Text>



        <View style={styles.iconContainer}>
  <Text style={styles.departmentDescription}>Mô tả : {item.description}</Text>

  <View style={styles.actionButtons}>
    <TouchableOpacity onPress={(e) => {
      e.stopPropagation();
      openEditModal(item);
    }}>
      <Icon name="edit" size={20} color="#666" style={styles.iconButton} />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc chắn muốn xóa phòng ban này?",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", onPress: () => handleDeleteDepartment(item.id) }
          ]
        );
      }}
      disabled={deleteLoading}
    >
      {deleteLoading ? (
        <ActivityIndicator size="small" color="#ff4444" />
      ) : (
        <Icon name="trash" size={20} color="#ff4444" style={styles.iconButton} />
      )}
    </TouchableOpacity>
  </View>
</View>

        <View style={styles.leaderContainer}>

          <Text style={styles.leaderName}>Trưởng phòng: {item.leader.name}   </Text>
          <Image
            source={{ uri: item.leader.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s" }}
            style={styles.avatar}
          />


        </View>




      </View>
    </TouchableOpacity>
  );

  const downloadExcel = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/document/download-excel-phong-ban`, {
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
      const fileUri = FileSystem.documentDirectory + "PhongBan.xlsx";

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

  const handleDeleteDepartment = async (id: number) => {
    try {
      setDeleteLoading(true);
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/department/delete-department?departmentId=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Xóa phòng ban thành công");
        fetchDepartments();
      } else {
        throw new Error("Xóa phòng ban thất bại");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      Alert.alert("Lỗi", "Không thể xóa phòng ban");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Thêm hàm mở modal chỉnh sửa
  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description,
      leaderId: department.leader.id.toString()
    });
    setSelectedLeader(department.leader);
    setEditModalVisible(true);
    fetchUsers();
  };

  // Thêm hàm cập nhật phòng ban
  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !newDepartment.name || !newDepartment.leaderId) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/department/update-department`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...newDepartment,
          id: selectedDepartment.id.toString()
        }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Cập nhật phòng ban thành công");
        setEditModalVisible(false);
        fetchDepartments();
      } else {
        const errorData = await response.json();
        Alert.alert("Lỗi", errorData.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    }
  };
  return (
    <View style={styles.container}>
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

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.totalText}>Tổng số: {filteredData.length}</Text>
            <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
              <FontAwesome name="plus-circle" size={24} color="#007BFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDepartmentItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
      {renderCreateModal()}
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // để mô tả và icon nằm 2 bên
  },
  
  departmentDescription: {
    flex: 1,
    fontSize: 16,
  },
  
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 'auto', // đẩy icon về bên phải
  },
  
  iconButton: {
    marginLeft: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  // actionButtons: {
  //   flexDirection: 'row',
  //   gap: 12,
  // },
  // iconButton: {
  //   padding: 4,
  // },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ADDCE3",
    borderRadius: 10,
    marginBottom: 10,
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
  departmentItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  // departmentDescription: {
  //   fontSize: 16,
  //   color: "#666",
  //   marginBottom: 8,
  // },
  
  leaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    marginLeft: 10,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  createButton: {
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },





  leaderSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  selectedLeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  leaderEmail: {
    fontSize: 12,
    color: '#666',
  },
  selectorPlaceholder: {
    color: '#888',
  },
  userListContainer: {
    maxHeight: 200,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  userListContent: {
    padding: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 4,
    borderRadius: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
});

export default AllDepartmentScreen;
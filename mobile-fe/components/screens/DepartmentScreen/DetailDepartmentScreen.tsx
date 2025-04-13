import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Pressable, ActivityIndicator, TextInput, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_BASE_URL } from "@/constants/api";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

interface Department {
  id: number;
  name: string;
  description: string;
  leaderId: number;
  status: string | null;
  leaderName: string;
  listTeam: Team[];
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  status: number;
  members: Member[];
}

interface Member {
  id: number;
  role: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

const DetailDepartmentScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { departmentId } = useLocalSearchParams();
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<User | null>(null);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
const [isEditModalVisible, setIsEditModalVisible] = useState(false);
const [currentLeader, setCurrentLeader] = useState<User | null>(null);
const [editTeam, setEditTeam] = useState({
  name: '',
  description: '',
});

  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"];

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Thông tin phòng ban" });
  }, [navigation]);

  useEffect(() => {
    fetchDepartment();
  }, []);

  const fetchDepartment = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/department/get-detail-department?departmentId=${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartmentData(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phòng ban:", error);
    } finally {
      setIsLoading(false);
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

  const handleOpenTeamModal = () => {
    setIsTeamModalVisible(true);
    fetchUsers();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        setSelectedLeader(item);
        setIsUserListVisible(false);
      }}
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

  const handleCreateTeam = async () => {
    if (!newTeam.name || !selectedLeader) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsCreating(true);
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/department/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...newTeam,
          departmentId: departmentId?.toString(),
          teamLeaderId: selectedLeader.id.toString()
        }),
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Tạo tổ mới thành công');
        setIsTeamModalVisible(false);
        setNewTeam({ name: '', description: '' });
        fetchDepartment(); // Load lại dữ liệu
      } else {
        const errorData = await response.json();
        Alert.alert('Lỗi', errorData.message || 'Tạo tổ thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi tạo tổ:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    } finally {
      setIsCreating(false);
    }
  };

  // Thêm modal tạo tổ
  const renderCreateTeamModal = () => (
    <Modal
      visible={isTeamModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsTeamModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tạo tổ mới</Text>



          <TextInput
            style={styles.input}
            placeholder="Tên tổ *"
            value={newTeam.name}
            onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={newTeam.description}
            onChangeText={(text) => setNewTeam({ ...newTeam, description: text })}
            multiline
          />

          <TouchableOpacity
            style={styles.leaderSelector}
            onPress={() => setIsUserListVisible(true)}
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
              <Text style={styles.selectorPlaceholder}>Chọn tổ trưởng </Text>
            )}
          </TouchableOpacity>

          {isUserListVisible && (
            <View style={styles.userListContainer}>
              <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={styles.userListContent}
              />
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsTeamModalVisible(false)}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateTeam}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Tạo</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleDeleteTeam = async (teamId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tổ này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Xóa", 
          onPress: async () => {
            try {
              const authToken = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_BASE_URL}/department/delete-team?teamId=${teamId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );
  
              if (response.ok) {
                Alert.alert('Thành công', 'Xóa tổ thành công');
                fetchDepartment();
              } else {
                const errorData = await response.json();
                Alert.alert('Lỗi', errorData.message || 'Xóa tổ thất bại');
              }
            } catch (error) {
              console.error('Lỗi khi xóa tổ:', error);
              Alert.alert('Lỗi', 'Không thể kết nối đến server');
            }
          } 
        }
      ]
    );
  };


  const handleOpenEditModal = async (team: Team) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      // Lấy thông tin trưởng nhóm hiện tại
      const leaderResponse = await fetch(
        `${API_BASE_URL}/department/get-teamLeader?teamId=${team.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (leaderResponse.ok) {
        const leaderData = await leaderResponse.json();
        setSelectedLeader(leaderData);
        setCurrentLeader(leaderData);
      }
    } catch (error) {
      console.error("Error fetching leader:", error);
    }
  
    setSelectedTeam(team);
    setEditTeam({
      name: team.name,
      description: team.description || '',
    });
    fetchUsers();
    setIsEditModalVisible(true);
  };

  const handleUpdateTeam = async () => {
    if (!editTeam.name || !selectedLeader) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
  
    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/department/update-team`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...editTeam,
          id: selectedTeam?.id,
          departmentId : departmentId,
          teamLeaderId: selectedLeader.id // Thêm trường leaderId
        })
      });
  
      if (response.ok) {
        Alert.alert('Thành công', 'Cập nhật tổ thành công');
        fetchDepartment();
        setIsEditModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Thất bại', 'Cập nhật tổ thất bại');
      console.error('Update error:', error);
    }
  };

  const renderEditTeamModal = () => (
    <Modal
      visible={isEditModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chỉnh sửa tổ</Text>
  
          <TextInput
            style={styles.input}
            placeholder="Tên tổ *"
            value={editTeam.name}
            onChangeText={(text) => setEditTeam({ ...editTeam, name: text })}
          />
  
          <TextInput
            style={styles.input}
            placeholder="Mô tả"
            value={editTeam.description}
            onChangeText={(text) => setEditTeam({ ...editTeam, description: text })}
            multiline
          />
  
          {/* Phần chọn trưởng tổ */}
          <TouchableOpacity
            style={styles.leaderSelector}
            onPress={() => setIsUserListVisible(true)}
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
              <Text style={styles.selectorPlaceholder}>
                {currentLeader?.name || 'Chọn trưởng tổ'}
              </Text>
            )}
          </TouchableOpacity>
  
          {isUserListVisible && (
            <View style={styles.userListContainer}>
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={item => item.id.toString()}
              />
            </View>
          )}
  
          <View style={styles.modalButtonContainer}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.createButton]}
              onPress={handleUpdateTeam}
            >
              <Text style={styles.buttonText}>Cập nhật</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );



  const renderTeamItem = ({ item, index }: { item: Team, index: number }) => (
    <TouchableOpacity
      style={[styles.teamItem, { backgroundColor: colors[index % colors.length] }]}
      onPress={() => router.push({ pathname: "/Department/detailTeam", params: { teamId: item.id } })}
    >
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        
      </View>
  
      {item.description && (
        <Text style={styles.teamDescription}>Mô tả : {item.description}</Text>
      )}
  
      <View style={styles.footerContainer}>
        <View style={styles.memberInfo}>
          <Icon name="users" size={14} color="#666" />
          <Text style={styles.memberCount}>
            {item.members.length} thành viên
          </Text>
        </View>
  
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleOpenEditModal(item);
            }}
            style={styles.actionButton}
          >
            <Icon name="edit" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteTeam(item.id);
            }}
            style={styles.actionButton}
          >
            <Icon name="trash" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* <ActivityIndicator size="large" color="#3B82F6" /> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            style={styles.avatar}
            source={{ uri: "https://img.lovepik.com/original_origin_pic/19/01/05/6f4d13b75395ed0a74482eaab763e0ec.png_wh860.png" }}
          />
          <Text style={styles.departmentName}>{departmentData?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          {/* Phần mô tả */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, styles.centeredContent]}>
             Mô tả :  {departmentData?.description || 'Chưa có mô tả'}
            </Text>
          </View>

          {/* Phần trưởng phòng */}
          <View style={[styles.infoRow, styles.centeredRow]}>

            <Text style={[styles.infoText, styles.centeredContent]}>
              Trưởng phòng: {departmentData?.leaderName || 'Chưa có thông tin'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.teamSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách tổ ({departmentData?.listTeam.length}) </Text>
          <TouchableOpacity
            // onPress={() => setIsTeamModalVisible(true)}
            onPress={handleOpenTeamModal}
            style={styles.addButton}
          >
            <Icon name="plus-circle" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={departmentData?.listTeam || []}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có nhóm nào trong phòng ban</Text>
          }
        />
      </View>
      {renderCreateTeamModal()}
      {renderEditTeamModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },

  teamItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 120, // Đảm bảo chiều cao tối thiểu
    justifyContent: 'space-between', // Căn nội dung từ trên xuống dưới
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Căn giữa theo chiều ngang
    gap: 8,
  },
  centeredContent: {
    textAlign: 'center', // Căn giữa text
    width: '100%', // Đảm bảo chiều rộng đầy đủ
  },


  leaderSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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

  teamActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // actionButton: {
  //   padding: 4,
  // },
  userListContainer: {
    maxHeight: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#D1D8EF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  departmentName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    marginTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  teamSection: {
    marginTop: 24,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },

  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3B82F6',
  },
  teamDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },

  memberCount: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default DetailDepartmentScreen;
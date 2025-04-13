import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_BASE_URL } from "@/constants/api";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

interface Team {
  id: number;
  name: string;
  description: string | null;
  departmentId: number;
  departmentName: string;
  status: number;
  leaderName: string | null;
  leaderId: number | null;
  members: Member[];
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  gender: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

const DetailTeamScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [users, setUsers] = useState<Member[]>([]);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const MEMBER_COLORS = ["#FEE2E2", "#D1E7DD", "#EDEBDE", "#ADDCE3"];


  useLayoutEffect(() => {
    navigation.setOptions({ title: "Thông tin tổ/nhóm" });
  }, [navigation]);


  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/department/get-detail-team?teamId=${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Lỗi tải dữ liệu nhóm');

      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberItem = ({ item, index }: { item: Member; index: number }) => (
    <TouchableOpacity
      style={[styles.memberItem, { backgroundColor: MEMBER_COLORS[index % MEMBER_COLORS.length] }]}
      // onPress={() => router.push(`/user/${item.id}`)}
      onPress={() => router.push({ pathname: "/personelDetail", params: { userId: item.id } })}
    >
      <Image
        source={{ uri: item.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s' }}
        style={styles.memberAvatar}
      />

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        {item.phoneNumber && (
          <Text style={styles.memberDetail}>
            <Icon name="phone" size={12} color="#666" /> {item.phoneNumber}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }


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

  // Hàm thêm thành viên
  const handleAddMember = async () => {
    if (!selectedUser) {
      Alert.alert("Lỗi", "Vui lòng chọn thành viên");
      return;
    }

    try {
      setIsAdding(true);
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/department/add-user-to-team?userId=${selectedUser.id}&teamId=${teamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Thêm thành viên thành công");
        fetchTeam(); // Load lại dữ liệu
        setIsUserModalVisible(false);
        setSelectedUser(null);
      } else {
        Alert.alert("Lỗi", "Đã tồn tại thành viên này trước đó rồi ");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Lỗi", "Không thể thêm thành viên");
    } finally {
      setIsAdding(false);
    }
  };

  // Thêm render modal chọn user
  const renderUserModal = () => (
    <Modal
      visible={isUserModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsUserModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn thành viên</Text>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => setSelectedUser(item)}
              >
                <Image
                  source={{ uri: item.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s' }}
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {selectedUser?.id === item.id && (
                  <Icon name="check" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsUserModalVisible(false)}
            >
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleAddMember}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Thêm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>

      {renderUserModal()}
      {/* Thông tin nhóm */}

      <View style={styles.teamHeader}>
        {/* Thêm ảnh đại diện team */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://img.lovepik.com/png/20231119/illustration-of-a-group-of-schoolkids-using-computers-clipart-vector_641470_wh1200.png' }}
            style={styles.teamAvatar}
          />
        </View>

        <Text style={styles.teamName}>{teamData?.name}</Text>

        <View style={styles.metaInfo}>
          <Text style={styles.departmentName}>
            <Icon name="building" size={14} /> Phòng :  {teamData?.departmentName}
          </Text>

          {teamData?.leaderName ? (
            <Text style={styles.leaderText}>
              <Icon name="user" size={14} /> Trưởng nhóm: {teamData.leaderName}
            </Text>
          ) : (
            <Text style={styles.leaderText}>
              <Icon name="exclamation-circle" size={16} /> Chưa có trưởng nhóm
            </Text>
          )}
        </View>

        {teamData?.description && (
          <Text style={styles.description}>Mô tả : {teamData.description}</Text>
        )}
      </View>

      {/* Danh sách thành viên */}
      <View style={styles.memberSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Thành viên ({teamData?.members?.length || 0})
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsUserModalVisible(true);
              fetchUsers();
            }}
            style={styles.addButton}
          >
            <Icon name="plus-circle" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={teamData?.members || []}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nhóm chưa có thành viên nào</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },


  teamHeader: {
    backgroundColor: '#FFECD5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center', // Căn giữa các phần tử con
  },
  avatarContainer: {
    marginBottom: 16,
  },
  teamAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center', // Căn giữa text
  },
  metaInfo: {
    marginBottom: 12,
    alignItems: 'center', // Căn giữa các text con
  },
  departmentName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  leaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginTop: -5,
    fontStyle: 'italic',
    textAlign: 'center', // Căn giữa mô tả
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },

  memberSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memberDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default DetailTeamScreen;
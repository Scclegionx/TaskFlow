import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal 
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

const DetailDepartmentScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { departmentId } = useLocalSearchParams();
  const [departmentData, setDepartmentData] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamItem}
      // onPress={() => router.push(`/teamDetail/${item.id}`)}
      onPress={() => router.push({ pathname: "/Department/detailTeam", params: { teamId: item.id } })}
    >
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Icon name="chevron-right" size={16} color="#666" />
      </View>
      
      {item.description && (
        <Text style={styles.teamDescription}>{item.description}</Text>
      )}

      <View style={styles.memberInfo}>
        <Icon name="users" size={14} color="#666" />
        <Text style={styles.memberCount}>
          {item.members.length} thành viên
        </Text>
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
            // source={{ uri: departmentData?.leader?.avatar || 'https://via.placeholder.com/100' }}
          />
          <Text style={styles.departmentName}>{departmentData?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="info-circle" size={16} color="#666" />
            <Text style={styles.infoText}>{departmentData?.description}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="user" size={16} color="#666" />
            <Text style={styles.infoText}>
              Trưởng phòng: {departmentData?.leaderName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="signal" size={16} color="#666" />
            <Text style={styles.infoText}>
              Trạng thái: {departmentData?.status || 'Đang hoạt động'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>Danh sách nhóm</Text>
        <FlatList
          data={departmentData?.listTeam || []}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có nhóm nào trong phòng ban</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
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
    marginTop: 10,
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
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default DetailDepartmentScreen;
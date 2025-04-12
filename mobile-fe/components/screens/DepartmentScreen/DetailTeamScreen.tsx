import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator 
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

  const MEMBER_COLORS = ["#FEE2E2", "#D1E7DD", "#EDEBDE", "#ADDCE3"];


  useLayoutEffect(() => {
    navigation.setOptions({ title: "Danh sách phòng ban" });
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

  return (
    <View style={styles.container}>
      {/* Thông tin nhóm */}
      <View style={styles.teamHeader}>
        <Text style={styles.teamName}>{teamData?.name}</Text>
        
        <View style={styles.metaInfo}>
          <Text style={styles.departmentName}>
            <Icon name="building" size={14} /> {teamData?.departmentName}
          </Text>
          
          {teamData?.leaderName ? (
            <Text style={styles.leaderText}>
              <Icon name="user" size={14} /> Trưởng nhóm: {teamData.leaderName}
            </Text>
          ) : (
            <Text style={styles.leaderText}>
              <Icon name="exclamation-circle" size={14} /> Chưa có trưởng nhóm
            </Text>
          )}
        </View>

        {teamData?.description && (
          <Text style={styles.description}>{teamData.description}</Text>
        )}
      </View>

      {/* Danh sách thành viên */}
      <View style={styles.memberSection}>
        <Text style={styles.sectionTitle}>
          Thành viên ({teamData?.members?.length || 0})
        </Text>

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
  teamHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metaInfo: {
    marginBottom: 12,
  },
  departmentName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  leaderText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    fontStyle: 'italic',
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
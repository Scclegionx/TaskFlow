import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface DetailRowProps {
    label: string;
    value: string;
  }
  
  interface TaskDetail {
    id: number;
    title: string;
    description: string;
    fromDate: string | null;
    toDate: string | null;
    status: number;
    project: {
      name: string;
    };
    createdBy: number;
    assignees: Array<{
      name: string;
    }>;
  }

  interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  }
  

const TaskDetailScreen  = () => {

    const router = useRouter();
    const navigation = useNavigation();
    const { taskId } = useLocalSearchParams();
    const [jobData, setJobData] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatorInfo, setCreatorInfo] = useState<User | null>(null);
    const [loadingCreator, setLoadingCreator] = useState(false);


    useLayoutEffect(() => {
        navigation.setOptions({ title: "Chi tiết công việc" }); // Cập nhật tiêu đề
      }, [navigation]);


      useEffect(() => {
        const fetchTaskDetail = async () => {
          try {
            const authToken = await AsyncStorage.getItem("token");
            if (!authToken) throw new Error("Vui lòng đăng nhập");
    
            const response = await fetch(
              `${API_BASE_URL}/tasks/get-task-detail?taskId=${taskId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
    
            if (!response.ok) throw new Error("Không tải được dữ liệu");
            const data = await response.json();
            setJobData(data);
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message); // Safely access the message property
            } else {
              setError("Đã xảy ra lỗi không xác định"); // Handle non-Error types
            }
          } finally {
            setLoading(false);
          }
        };
    
        if (taskId) fetchTaskDetail();
        
      }, [taskId]);

      useEffect(() => {
        const fetchCreatorInfo = async () => {
          try {
            if (!jobData?.createdBy) return;
    
            const authToken = await AsyncStorage.getItem('token');
            const response = await fetch(
              `${API_BASE_URL}/users/get-user-by-id?userId=${jobData.createdBy}`,
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
    
            if (!response.ok) throw new Error('Failed to load creator info');
            const userData: User = await response.json();
            setCreatorInfo(userData);
          } catch (err) {
            console.error('Error fetching creator:', err);
          }
        };
    
        jobData?.createdBy && fetchCreatorInfo();
      }, [jobData?.createdBy]);
     

      
    
      const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Không có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      };
    
      const statusMap: { [key: number]: string } = {
        1: 'Đang xử lý',
        2: 'Hoàn thành',
        3: 'Từ chối',
        4: 'Quá hạn'
        // Thêm các trạng thái khác nếu cần
      };

      const statusColorMap: { [key: number]: string } = {
        1: 'white',    //  cho trạng thái "Đang xử lý"
        2: 'white',    //   cho trạng thái "Hoàn thành"
        3: 'white',    //  cho trạng thái "Từ chối"
        4: 'white'     // chữ  trắng "Quá hạn"
      };
      
      const statusBackgroundMap: { [key: number]: string } = {
        1: '#F59E0B',    // Nền cam nhạt.
        2: '#2ecc71',    // Nền xanh lá nhạt 
        3: '#e74c3c',    // Nền đỏ nhạt
        4: '#3B82F6'     // xanh
      };
    
      if (loading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        );
      }
    
      if (error) {
        return (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }
    
      if (!jobData) {
        return (
          <View style={styles.center}>
            <Text>Không tìm thấy công việc</Text>
          </View>
        );
      }



      return (
        <SafeAreaView style={styles.container}>
          
            <View style={styles.header}>
              <Text style={styles.title}>{jobData.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusBackgroundMap[jobData.status] }]}>
                <Text style={[styles.statusText, { color: statusColorMap[jobData.status] }]}>
                  {statusMap[jobData.status] || 'Không xác định'}
                </Text>
              </View>
            </View>
    
          <View style={styles.section}>
            <DetailRow label="Người giao" value={creatorInfo?.name || "Không có"} />
            <DetailRow 
              label="Người thực hiện" 
              value={jobData.assignees.map(a => a.name).join(', ')} 
            />
            <DetailRow 
              label="Ngày bắt đầu" 
              value={formatDate(jobData.fromDate)} 
            />
            <DetailRow 
              label="Ngày kết thúc" 
              value={formatDate(jobData.toDate)} 
            />
            <DetailRow 
              label="Dự án" 
              value={jobData.project?.name || 'Không có'} 
            />
          </View>
        </SafeAreaView>
      );
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default TaskDetailScreen ;
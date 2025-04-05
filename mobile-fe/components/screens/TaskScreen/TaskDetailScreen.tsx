import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';



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
    id: number;
    name: string;
  }>;
  waitFinish: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  taskId: number;
  date: string;
  userName: string;

}

const TaskDetailScreen = () => {

  const router = useRouter();
  const navigation = useNavigation();
  const { taskId } = useLocalSearchParams();


  const [jobData, setJobData] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<User | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  // Thêm state trong component
  const [commentData, setCommentData] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [currentUserId, setCurrentUserId] = useState(Number);  // id của người đang đăng nhập



  useLayoutEffect(() => {
    navigation.setOptions({ title: "Chi tiết công việc" }); // Cập nhật tiêu đề
  }, [navigation]);



  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const authToken = await AsyncStorage.getItem("token");
        const currentUser_id = await AsyncStorage.getItem("userId");
        setCurrentUserId(Number(currentUser_id));
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

  const fetchCommentData = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/comments/get-comment?taskId=${taskId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.ok) {
        const comments = await response.json();
        setCommentData(comments);
      }
    } catch (error) {
      console.error('Lỗi khi tải bình luận:', error);
    }
  };

  // Sử dụng trong useEffect
  useEffect(() => {
    if (taskId) {
      fetchCommentData();
    }
  }, []);


  const fetchMarkComplete = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) throw new Error("Vui lòng đăng nhập");

      const response = await fetch(
        `${API_BASE_URL}/tasks/mark-complete?taskId=${taskId}`,
        {
          method: 'PUT',
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


  const fetchApproveComplete = async () => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) throw new Error("Vui lòng đăng nhập");

      const response = await fetch(
        `${API_BASE_URL}/tasks/task-approve-finish?taskId=${taskId}`,
        {
          method: 'PUT',
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


  const fetchTask_Detail = async () => {
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



  const handleMarkComplete = async () => {
    Alert.alert(
      "Thông báo",
      "Bạn có muốn xác nhận hoàn thành công việc này không?",
      [
        {
          text: "Không",
          style: "cancel", // Đóng hộp thoại mà không làm gì
        },
        {
          text: "Có",
          onPress: async () => {
            await fetchMarkComplete();// Gọi API xác nhận
            await fetchTask_Detail(); // Cập nhật lại dữ liệu
          },
        },
      ]
    );
  };



  const handleApproveComplete = async () => {
    Alert.alert(
      "Thông báo",
      "Bạn có muốn xác nhận hoàn thành công việc này không?",
      [
        {
          text: "Không",
          style: "cancel", // Đóng hộp thoại mà không làm gì
        },
        {
          text: "Có",
          onPress: async () => {
            await fetchApproveComplete(); // Gọi API xác nhận
            await fetchTask_Detail(); // Cập nhật lại dữ liệu
          },
        },
      ]
    );
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


  // Thêm hàm xử lý gửi bình luận
  const handleSendComment = async () => {
    try {
      if (!newComment.trim()) return;

      const userId = await AsyncStorage.getItem("userId");

      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/comments/create-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          taskId,
          content: newComment,
          userId: userId,
        })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setCommentData([...commentData, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Lỗi khi gửi bình luận:', error);
    }
  };



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


  // Thêm phần render bình luận
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: 'http://res.cloudinary.com/doah3bdw6/image/upload/v1743153165/r0nulby5tat56nq1q394.png' }} // Thay bằng avatar thực tế nếu có
        style={styles.avatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.userName}</Text>
          <Text style={styles.commentTime}>
            {/* {formatDateTime(item.date)} */}
            {item.date}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );



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

        {/* Thêm nút ở đây */}
        {/* đang xử lý , mà chưa chọn xác nhận hoàn thành */}
        {/* chỉ có  người thực hiện mới được quyền */}
        {/* status = 1 là trạng thái chờ duyệt */}
        {jobData.status === 1 && jobData.waitFinish != 1 && jobData.assignees.some(a => a.id === currentUserId) && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Đánh dấu hoàn thành</Text>
          </TouchableOpacity>
        )}



        {jobData.waitFinish === 1 && (
          <View style={styles.waitFinishContainer}>
            <Icon name="hourglass" size={16} color="#2ecc71" />
            <Text style={styles.waitFinishText}>Chờ duyệt hoàn thành</Text>
          </View>
        )}

        {jobData.waitFinish === 1 && jobData.createdBy === currentUserId && (
          <TouchableOpacity
            style={styles.duyetButton} // Thêm một style mới cho nút này
            onPress={handleApproveComplete} // Hàm xử lý khi nhấn nút
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.duyetButtonText}> Xác nhận hoàn thành </Text>
            <Icon name="check" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>


      {/* Phần bình luận */}
      <View style={styles.commentSection}>
        <Text style={styles.sectionTitle}>Bình luận ({commentData.length})</Text>

        {/* dữ liệu  */}
        <FlatList
          data={commentData}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyComment}>Chưa có bình luận nào</Text>
          }
        />

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Thêm bình luận..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendComment}
            disabled={!newComment.trim()}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  waitFinishContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  waitFinishText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8, // Khoảng cách giữa icon và text
  },

  completeButton: {
    flexDirection: 'row', // Căn icon + text theo chiều ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    backgroundColor: '#99CCFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8, // Tạo khoảng cách giữa icon và chữ
    fontWeight: 'bold',
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

  duyetButton: {
    backgroundColor: "#66CC66",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  duyetButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },


  commentSection: {
    marginTop: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentName: {
    fontWeight: '500',
    color: '#333',
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    color: '#444',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyComment: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
});

export default TaskDetailScreen;
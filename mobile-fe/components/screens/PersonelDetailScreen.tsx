import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';


interface DetailRowProps {
  label: string;
  value: string;
}


interface inforPerson {
  id: number;
  name: string;
  email: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  totalPoint: string;
  totalHours: number;
  avatar: string;
}

interface Review {
  id: number;
  userId: number;
  content: string;
  createdBy: number;
  star: number;
  createdAt: string;
  avatar: string;
  createdByName: string;
  averageStar: number;

}


const PersonelDetailScreen = () => {

  const router = useRouter();
  const navigation = useNavigation();
  const { userId } = useLocalSearchParams();

  const [inforPersonData, setInforPersonData] = useState<inforPerson | null>(null);


  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);


  useLayoutEffect(() => {
    navigation.setOptions({ title: "Thông tin nhân sự" }); // Cập nhật tiêu đề
  }, [navigation]);

  useEffect(() => {
    fetchInforPerson();
    fetchListReviews();
  }, []);

  const fetchListReviews = async () => {
    try {

      const authToken = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/get-rating-user?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
    }
  };

  const fetchInforPerson = async () => {

    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let infoUrl = `${API_BASE_URL}/users/get-user-by-id?userId=${userId}`;

      const response = await fetch(infoUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const inforUser = await response.json();
        setInforPersonData(inforUser);
      } else {
        console.error("Lỗi khi lấy danh sách thành viên. personDailtail");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh sách thành viên:", error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (rating === 0) {
        alert('Vui lòng chọn số sao');
        return;
      }

      const authToken = await AsyncStorage.getItem("token");
      const currentUser_id = await AsyncStorage.getItem("userId");

      const response = await fetch(`${API_BASE_URL}/users/rating-user?userId=${userId}&star=${rating}&comment=${reviewText}&createdBy=${currentUser_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([...reviews, newReview]);
        setIsRatingModalVisible(false);
        setRating(0);
        setReviewText('');
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
    } finally {
      fetchListReviews();
    }
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Icon
        key={star}
        name={star <= rating ? 'star' : 'star-o'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const COMMENT_COLORS = ["#FEE2E2", "#D1E7DD", "#EDEBDE", "#ADDCE3"];



  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Thêm Image ở đây */}
        <Image
          style={styles.avatar}
          source={{ uri: inforPersonData?.avatar || 'https://img.lovepik.com/png/20231028/Japanese-social-media-male-user-avatar-characters-anime_394434_wh860.png' }} // Đường dẫn đến ảnh
          resizeMode="cover"
        />

        <View style={styles.row}>
          <Text style={styles.label}>Tên : </Text>
          <Text style={styles.value}>{inforPersonData?.name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email : </Text>
          <Text style={styles.value}>{inforPersonData?.email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Giới tính : </Text>
          <Text style={styles.value}>{inforPersonData?.gender}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngày sinh: </Text>
          <Text style={styles.value}>{inforPersonData?.dateOfBirth}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Điểm số: </Text>
          <Text style={styles.value}>{inforPersonData?.totalPoint}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thời gian làm việc: </Text>
          <Text style={styles.value}>{inforPersonData?.totalHours}</Text>
        </View>




      </View>
      {/* Phần đánh giá */}

      <View style={styles.reviewSection}>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}> Đánh giá ({(reviews[0]?.averageStar ?? 0).toFixed(1)} ✨) </Text>



          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setIsRatingModalVisible(true)}
          >
            <Text style={styles.addReviewButtonText}>Thêm đánh giá</Text>
          </TouchableOpacity>
        </View>



        <FlatList
          data={reviews}
          renderItem={({ item, index }) => (
            <View
              // style={styles.reviewItemContainer }
              style={[
                styles.reviewItemContainer,
                { backgroundColor: COMMENT_COLORS[index % COMMENT_COLORS.length] }
              ]}
            >
              {/* Avatar nằm bên trái */}
              <Image
                source={{ uri: item.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s' }}
                style={styles.reviewItemAvatar}
              />

              {/* Khối chứa tên + nội dung nằm bên phải avatar */}
              <View style={styles.reviewItemContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{item.createdByName}</Text>
                  <Text style={styles.reviewDate}>{item.createdAt}</Text>
                  <View style={styles.starContainer}>
                    {renderStars(item.star)}
                  </View>
                </View>

                <Text style={styles.reviewItemText}>{item.content}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />



      </View>



      {/* Modal đánh giá */}
      <Modal
        visible={isRatingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRatingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đánh giá nhân sự</Text>

            <View style={styles.starRatingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Icon
                    name={star <= rating ? 'star' : 'star-o'}
                    size={40}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Nhập nội dung đánh giá..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsRatingModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.buttonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewItemContainer: {
    flexDirection: 'row',         // Xếp avatar và nội dung theo chiều ngang
    alignItems: 'center',         // Căn giữa theo trục dọc
    // backgroundColor: '#EAF4FF',   // Màu nền nhẹ (có thể thay đổi theo ý thích)

    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },

  reviewItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,             // Avatar hình tròn
    marginRight: 10,
  },

  reviewItemContent: {
    flex: 1,                      // Chiếm hết không gian còn lại
  },

  reviewItemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },

  reviewItemText: {
    fontSize: 14,
    color: '#333',
  },



  reviewSection: {
    marginTop: 20,
    flex: 1,
  },
  addReviewButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  addReviewButtonText: {
    color: 'white',
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  reviewerName: {
    fontWeight: '500',
  },
  reviewContent: {
    color: '#444',
    marginBottom: 5,
  },
  reviewDate: {
    color: '#666',
    fontSize: 12,
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
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  submitButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#96C9D1',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    flex: 1,
    color: 'black',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Để tạo hình tròn
    alignSelf: 'center', // Căn giữa theo chiều ngang
    marginBottom: 20, // Khoảng cách với phần thông tin phía dưới
    backgroundColor: '#e1e4e8', // Màu nền dự phòng
  },
  status: {
    color: 'orange', // Màu cho trạng thái
    fontWeight: '500',
  },
});

export default PersonelDetailScreen;
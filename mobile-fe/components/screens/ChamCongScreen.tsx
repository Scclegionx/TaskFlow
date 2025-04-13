import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
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
import DateTimePickerModal from "@react-native-community/datetimepicker";



interface UserProfile {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
  avatar: string;
}

interface ChamCong {
  id: number;
  user_id: number;
  checkin: string;
  checkout: string;
  status: number;
  total_hours: number;
  username: string;
  avatar: string;
}


const ChamCongScreen = () => {


  const router = useRouter();

  const navigation = useNavigation(); // Use the hook to get the navigation object

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Quản lý chấm công" }); // Cập nhật tiêu đề
  }, [navigation]);

  const [search, setSearch] = useState("");
  const [data, setData] = useState<{ name: string; email: string }[]>([]);

  const [loading, setLoading] = useState(true);

  const [chamCongData, setChamCongData] = useState<ChamCong[]>([]);


  const [searchText, setSearchText] = useState("");


  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(1); // Đặt ngày về 1 (đầu tháng)
    return date;
  }); // khởi tạo ngày đầu tháng
  const [endDate, setEndDate] = useState<Date>(new Date()); // khởi tạo ngày hiện tại
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser_id, setCurrentUser_id] = useState<number | null>(null); // Khởi tạo state cho user_id

  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"]; // danh sách màu


  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lấy danh sách user từ API

  useEffect(() => {
    fetchProfile(); // Chỉ gọi API lấy profile khi component mount
    fetchChamCong("", startDate, endDate);
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


  const handleSearch = () => {
    fetchChamCong(searchText, startDate, endDate);
  };


  const downloadExcel = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/document/download-excel-cham-cong`, {
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
      const fileUri = FileSystem.documentDirectory + "ChamCong.xlsx";

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



  const fetchChamCong = async (searchText: string, startDate: Date | null, endDate: Date | null) => {
    setLoading(true);

    try {
      const authToken = await AsyncStorage.getItem("token");
      const userCurrentId = await AsyncStorage.getItem("userId");
      setCurrentUser_id(Number(userCurrentId)); // Chuyển đổi giá trị user_id thành số
      console.log("userId", userCurrentId);
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        setLoading(false);
        return;
      }

      let isFirstParam = true;  // Biến flag để kiểm tra xem đây có phải là tham số đầu tiên không

      let chamCongsUrl = `${API_BASE_URL}/tydstate/get-tydstate`;
      if (searchText.trim()) {
        chamCongsUrl += `?textSearch=${encodeURIComponent(searchText)}`;
        isFirstParam = false;
      }

      if (startDate) {
        chamCongsUrl += `${isFirstParam ? '?' : '&'}startDate=${formatDate(startDate)}`;
        isFirstParam = false;
      }

      if (endDate) {
        chamCongsUrl += `${isFirstParam ? '?' : '&'}endDate=${formatDate(endDate)}`;
        isFirstParam = false;
      }


      console.log("API URL:", chamCongsUrl);
      const response = await fetch(chamCongsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const cham_cong = await response.json();

        setChamCongData(cham_cong);
      } else {
        console.error("Lỗi khi lấy danh sách thành viên. dashBoard");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh sách thành viên:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm 1 vào tháng vì tháng bắt đầu từ 0
    const day = date.getDate().toString().padStart(2, '0'); // Đảm bảo ngày có 2 chữ số

    return `${year}-${month}-${day}`;
  };


  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // fetchKPIByMonth(formatDate(selectedDate), searchText);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      fetchChamCong(searchText, selectedDate, endDate);
    }
  };

  // TypeScript: Định nghĩa enum (nếu có)
  enum Status {
    Du = 0,
    DiMuon = 1,
    VeSom = 2,
    DiMuonVeSom = 3,
    CoPhep = 4
  }

  // Hàm lấy nhãn trạng thái
  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return "Đủ công ";
      case 1:
        return "Đi muộn ";
      case 2:
        return "Về sớm ";
      case 3:
        return "Đi muộn về sớm ";
      case 4:
        return "Nghỉ phép ";
      case 5:
        return "Chưa ra về";
      default:
        return "Không xác định ";
    }
  };

  // Hàm lấy màu theo trạng thái
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return "green"; // Đủ công
      case 1:
        return "rgb(138, 0, 147)"; // Đi muộn
      case 2:
        return "rgb(255, 149, 0)"; //  sớm
      case 3:
        return "red"; // Đi muộn + về sớm
      case 4:
        return "blue"; // Nghỉ phép
      case 5:
        return "blue"; // chua về
      default:
        return "black"; // Mặc định
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/tydstate/check-in?userId=${currentUser_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        Alert.alert("Thành công", "Chấm công vào thành công");
        fetchChamCong(searchText, startDate, endDate);
      } else {
        Alert.alert("Thất bại", "Bạn đã chấm công hôm nay rồi");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chấm công");
    } finally {
      setActionLoading(false);
      setShowPopup(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/tydstate/check-out?userId=${currentUser_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        Alert.alert("Thành công", "Chấm công ra về thành công");
        fetchChamCong(searchText, startDate, endDate);
      } else {
        Alert.alert("Thất bại", "Chấm công ra về thất bại. Bạn đã chấm công ra về trước đó rồi");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chấm công");
    } finally {
      setActionLoading(false);
      setShowPopup(false);
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


      {/* // Trong phần JSX, thêm các nút chọn thời gian: */}
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Từ: {startDate ? startDate.toLocaleDateString() : "Chọn ngày"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Đến: {endDate ? endDate.toLocaleDateString() : "Chọn ngày"}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePickerModal
          value={startDate}
          mode="date"
          display="spinner"
          onChange={handleStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePickerModal
          value={endDate}
          mode="date"
          display="spinner"
          onChange={handleEndDateChange}
        />
      )}
      {/* Kiểm tra nếu đang load dữ liệu */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Tổng số thành viên */}
          {/* <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>Tổng số: {chamCongData.length}</Text> */}

          {/* Tổng số thành viên và nút chấm công */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Tổng số: {chamCongData.length}</Text>

            <TouchableOpacity
              onPress={() => setShowPopup(!showPopup)}
              style={{ padding: 8 }}
            >
              <FontAwesome name="plus-circle" size={24} color="#007BFF" />
            </TouchableOpacity>

            {/* Popup chấm công */}
            {showPopup && (
              <View style={styles.popupContainer}>
                <TouchableOpacity
                  style={styles.popupButton}
                  onPress={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.popupButtonText}>Chấm công vào</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popupRaVeButton}
                  onPress={handleCheckOut}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.popupButtonText}>Ra về</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Overlay để đóng popup khi click ra ngoài */}
          {showPopup && (
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setShowPopup(false)}
            />
          )}

          {/* Danh sách người dùng */}
          <FlatList
            data={chamCongData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors[index % colors.length], // đổi màu theo index
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 8,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/personelDetail",
                    params: { userId: item.user_id },
                  })
                }
              >
                <Image
                  source={{
                    uri: item.avatar
                      ? item.avatar
                      : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s' // link ảnh mặc định
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {item.username}
                  </Text>
                  <Text style={{ fontSize: 16, color: "black" }}>
                    Giờ đến : {item.checkin}
                  </Text>
                  <Text style={{ fontSize: 16, color: "black" }}>
                    Giờ về : {item.checkout}
                  </Text>
                  <Text style={{ fontSize: 16, color: "black" }}>
                    Số giờ làm việc : {item.total_hours}
                  </Text>
                  <Text style={{ fontSize: 17 }}>
                    <Text style={{ color: 'black' }}>Trạng thái: </Text>
                    <Text style={{ color: getStatusColor(item.status) }}>
                      {getStatusLabel(item.status)}
                    </Text>
                    <Icon
                      name={item.status === 0 ? 'check-circle' : 'close'}
                      size={18}
                      color={item.status === 0 ? 'green' : 'red'}
                      style={{ marginLeft: 5 }}
                    />
                  </Text>

                </View>
              </TouchableOpacity>
            )}
          />

        </>
      )}
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

  popupContainer: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    elevation: 4,
    zIndex: 1000,
  },
  popupButton: {
    backgroundColor: '#219653',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
    minWidth: 150,
    alignItems: 'center',
  },
  popupRaVeButton: {
    backgroundColor: '#EB5757',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4,
    minWidth: 150,
    alignItems: 'center',
  },
  popupButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },


  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#FB958D',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  dateButtonText: {
    textAlign: 'center',
    color: 'black',
  },

  searchButton: {
    // backgroundColor: "#007BFF",
    backgroundColor: "#8384F8",
    padding: 10,
    borderRadius: 8
  },

});
export default ChamCongScreen;

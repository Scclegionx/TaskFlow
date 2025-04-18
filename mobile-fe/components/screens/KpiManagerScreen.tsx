import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button, Modal, Image } from "react-native";
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
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
import DateTimePickerModal from "@react-native-community/datetimepicker";



interface UserProfile {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
  avatar: string;
}


interface KPIEntry {
  id: number;
  userId: number;
  kpiRegistry: number;
  totalPoint: number | null;
  plusPoint: number | null;
  minusPoint: number | null;
  time: string;
  userName: string;
  avatar: string;
}


const AllPersonelScreen = () => {

  const router = useRouter();

  const navigation = useNavigation(); // Use the hook to get the navigation object

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Quản lý KPI" }); // Cập nhật tiêu đề
  }, [navigation]);


  const [kpiData, setKpiData] = useState<Array<KPIEntry>>([]); // kpi  co dung de lay du lieu kpi


  const [loading, setLoading] = useState(true);


  const [selectedKpi, setSelectedKpi] = useState<KPIEntry | null>(null); //  null là đăng ký mới, có dữ liệu là sửa


  const [searchText, setSearchText] = useState("");



  const [modalVisible, setModalVisible] = useState(false); // popup đăng ký KPI
  const [kpiValue, setKpiValue] = useState(""); // Giá trị nhập trong ô input



  const [kpi_Id, setkpi_Id] = useState<number>(0);

  const [user_Id, setuser_Id] = useState<number>(0);


  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);


  const [profileUserKPI, setProfileUserKPI] = useState<UserProfile | null>(null);

  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(1); // Đặt ngày về 1 (đầu tháng)
    return date;
  }); // khởi tạo ngày đầu tháng
  const [endDate, setEndDate] = useState<Date>(new Date()); // khởi tạo ngày hiện tại
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [kpiDate, setKpiDate] = useState(new Date()); // Thêm state cho ngày KPI
  const [showDatePicker, setShowDatePicker] = useState(false); // Hiển thị date picker

  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"]; // danh sách màu


  // Lấy danh sách user từ API

  useEffect(() => {
    fetchKPIByMonth(startDate, endDate, "");
    fetchProfile(); // Chỉ gọi API lấy profile khi component mount
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



  const fetchInforUserKPI = async (user_id: number) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let infoUrl = `${API_BASE_URL}/users/get-user-by-id?userId=${user_id}`;

      const response = await fetch(infoUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const inforUser = await response.json();
        setProfileUserKPI(inforUser);
      } else {
        console.error("Lỗi khi lấy danh sách thành viên. personDailtail");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh sách thành viên:", error);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Thêm 1 vào tháng vì tháng bắt đầu từ 0
    const day = date.getDate().toString().padStart(2, '0'); // Đảm bảo ngày có 2 chữ số

    return `${year}-${month}-${day}`;
  };


  const fetchKPIByMonth = async (startDate: Date | null, endDate: Date | null,
    searchText: string) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let isFirstParam = true;  // Biến flag để kiểm tra xem đây có phải là tham số đầu tiên không

      let kpiMonthUrl = `${API_BASE_URL}/kpi/get-kpi-by-month`;
      if (searchText.trim()) {
        kpiMonthUrl += `?textSearch=${encodeURIComponent(searchText)}`;
        isFirstParam = false;
      }

      if (startDate) {
        kpiMonthUrl += `${isFirstParam ? '?' : '&'}startDate=${formatDate(startDate)}`;
        isFirstParam = false;
      }

      if (endDate) {
        kpiMonthUrl += `${isFirstParam ? '?' : '&'}endDate=${formatDate(endDate)}`;
        isFirstParam = false;
      }

      console.log("URL KPI:", kpiMonthUrl);

      const response = await fetch(
        kpiMonthUrl,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const kpiData: KPIEntry[] = await response.json();
        setKpiData(kpiData);

      } else {
        console.error("Lỗi khi lấy dữ liệu KPI theo tháng.");
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi gọi API KPI:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/document/download-excel-kpi`, {
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
      const fileUri = FileSystem.documentDirectory + "DanhSachKPI.xlsx";

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




  const fetchRegistryKPI = async (pointKpi: number, date: Date) => {
    try {
      const formattedDate = formatDate(date); // Sử dụng hàm formatDate đã có
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiRegistryUrl = `${API_BASE_URL}/kpi/register-kpi?userId=${profile?.id}&pointKpi=${pointKpi}&time=${formattedDate}`;

      const response = await fetch(
        kpiRegistryUrl,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response;


    } catch (error) {
      console.error("Lỗi khi gọi API KPI:", error);

    } finally {
      setLoading(false);
    }
  };



  const fetchDeleteKPI = async (kpiId: number) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiDeleteUrl = `${API_BASE_URL}/kpi/delete-kpi?kpiId=${kpiId}`;

      const response = await fetch(
        kpiDeleteUrl,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response;


    } catch (error) {
      console.error("Lỗi khi gọi API KPI:", error);

    } finally {
      setLoading(false);
    }
  };



  const fetchEditKPI = async (userId: number, kpiId: number, total_point: number, date: Date) => {
    console.log("hahaah")
    try {
      const formattedDate = formatDate(date); // Sử dụng hàm formatDate đã có
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiDeleteUrl = `${API_BASE_URL}/kpi/edit-kpi?kpiId=${kpiId}&pointKpi=${total_point}&time=${formattedDate}&userId=${userId}`;

      const response = await fetch(
        kpiDeleteUrl,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );


      return response;


    } catch (error) {
      console.error("Lỗi khi gọi API KPI:", error);

    } finally {
      setLoading(false);
    }
  };






  const handleSearch = () => {
    fetchKPIByMonth(startDate, endDate, searchText); // Gọi API với từ khóa tìm kiếm
  };


  // Hàm gọi API khi bấm xác nhận
  const handleRegisterKpi = async () => {

    console.info("bắt đầu đăng ký kpi");
    if (!kpiValue) {
      Alert.alert("Lỗi", "Vui lòng nhập mục tiêu KPI!");
      return;
    }


    // Gọi API đăng ký KPI
    const response = await fetchRegistryKPI(Number(kpiValue), kpiDate); // Gọi API và chờ kết quả

    if (response && response?.status === 200) {
      Alert.alert("Thành công", "Đăng ký KPI thành công!");
      setModalVisible(false); // Đóng popup
      setKpiValue(""); // Reset input
    } else {
      const formattedDate = formatDate(kpiDate);
      Alert.alert("Thất bại ", `Bạn đã đăng ký KPI cho tháng ${formattedDate} trước đó rồi!`);
    }

    setKpiDate(new Date()); // set lai ngay hien tai

    fetchKPIByMonth(startDate, endDate, ""); // Lấy lại dữ liệu KPI sau khi đăng ký

    // Ẩn popup sau khi gửi API
    setModalVisible(false);
    setSelectedKpi(null); // Reset selected KPI
    setKpiValue(""); // Reset input

  };


  // Hàm gọi API khi bấm xác nhận
  const handleEditKpi = async () => {

    console.log(" bắt đầu sửa kpi ");
    if (!kpiValue) {
      Alert.alert("Lỗi", "Vui lòng nhập mục tiêu KPI!");
      return;
    }

    console.log('userID hiện tại hhahaha :', profile?.id);
    console.log('userID hiện tại phamtu :', user_Id);
    if (user_Id === profile?.id) {
      console.log('bắt đầu Xóa KPI với userID:', user_Id);


      const response = await fetchEditKPI(profile?.id, kpi_Id, Number(kpiValue), kpiDate); // Gọi API và chờ kết quả


      if (response && response?.status === 200) {
        Alert.alert("Thành công", "Sửa KPI thành công!");
        setModalVisible(false); // Đóng popup
        setKpiValue(""); // Reset input

      } else {
        const formattedDate = formatDate(kpiDate);
        Alert.alert("Thất bại ", `Bạn đã có KPI cho tháng ${formattedDate} rồi`);
      }
    } else {
      console.log("lỗi khi sửa kpi");
      Alert.alert("Thất bại ", "Bạn không có quyền sửa KPI này");
    }

    setKpiDate(new Date()); // set lai ngay hien tai


    fetchKPIByMonth(startDate, endDate, ""); // Lấy lại dữ liệu KPI

    // Ẩn popup sau khi gửi API
    setModalVisible(false);
    setSelectedKpi(null); // Reset selected KPI
    setKpiValue(""); // Reset input

    setkpi_Id(0);
    setuser_Id(0);// set lai nho de y
  };



  // Xử lý sửa
  const handleEdit = (kpi: KPIEntry) => {
    fetchInforUserKPI(kpi.userId); // Lấy thông tin người dùng từ API
    setuser_Id(kpi.userId ? kpi.userId : 0);
    setkpi_Id(kpi.id);
    setSelectedKpi(kpi); // Lưu KPI đang chọn vào state
    setKpiValue(kpi.kpiRegistry.toString()); // Điền giá trị hiện tại vào input
    setEditModalVisible(true); // Mở popup sửa // Mở popup
  };




  // Xử lý xóa
  const handleDelete = async (kpiId: number, user_id: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa KPI này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",

          onPress: async () => {
            console.log(' userID hiện tại :', profile?.id);
            console.log(' userID xoá :', user_id);
            if (user_id === profile?.id) {
              console.log('bắt đầu Xóa KPI với userID:', user_id);

              // Gọi API xoa KPI
              const response = await fetchDeleteKPI(kpiId);

              if (response && response?.status === 200) {
                Alert.alert("Thành công", "Xoá KPI thành công!");
              } else {
                console.log("xoá thất bại");
                Alert.alert("Thất bại ", "Bạn không có quyền xoá KPI này");
              }
            } else {
              Alert.alert("Thất bại ", "Bạn không có quyền xoá KPI này");
            }
            fetchKPIByMonth(startDate, endDate, ""); // Lấy lại dữ liệu KPI sau khi xoa
          }
        }
      ]
    );
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
      fetchKPIByMonth(startDate, selectedDate, "");
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
          {/* Tổng số bản ghi KPI */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Tổng số KPI: {kpiData.length}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#007bff",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
              onPress={() => {
                setSelectedKpi(null); // Reset selected KPI
                setKpiValue(""); // Xóa giá trị cũ
                setRegisterModalVisible(true); // Mở popup

              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Đăng ký</Text>
            </TouchableOpacity>
          </View>



          <Modal visible={registerModalVisible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: 300, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Đăng ký KPI mới</Text>

                <Text style={{ fontSize: 18, marginBottom: 10, color: "red" }}>Thông tin : {profile?.name} </Text>

                {/* Input chọn ngày */}
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>Thời gian: {kpiDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePickerModal
                    value={kpiDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setKpiDate(selectedDate);
                      }
                    }}
                  />
                )}

                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="Nhập số KPI..."
                  value={kpiValue}
                  onChangeText={setKpiValue}
                />

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setRegisterModalVisible(false);
                      setKpiValue("");
                      setKpiDate(new Date());

                    }}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleRegisterKpi}
                  >
                    <Text style={styles.buttonText}>Đăng ký</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>


          <Modal visible={editModalVisible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: 300, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Chỉnh sửa KPI</Text>
                <Text style={{ fontSize: 18, marginBottom: 10, color: "red" }}>Thông tin : {profileUserKPI?.name} </Text>
                {/* Input chọn ngày */}

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>Thời gian: {kpiDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePickerModal
                    value={kpiDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setKpiDate(selectedDate);
                      }
                    }}
                  />
                )}
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="Nhập số KPI..."
                  value={kpiValue}
                  onChangeText={setKpiValue}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditModalVisible(false);
                      setKpiValue("");
                      setSelectedKpi(null);
                      setKpiDate(new Date());

                    }}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleEditKpi}
                  >
                    <Text style={styles.buttonText}>Cập nhật</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>




          {/* Danh sách KPI */}
          <FlatList
            data={kpiData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: colors[index % colors.length], // đổi màu theo index
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 10,
                  elevation: 3,

                }}
              // onPress={() => handleKPIPress(item)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Icon người dùng */}
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

                  {/* Thông tin chính */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Nhân sự:</Text>
                      <Text style={styles.value}>{item.userName}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Điểm cộng:</Text>
                      <Text style={styles.value}>{item.plusPoint ? item.plusPoint : "0"}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Điểm trừ:</Text>
                      <Text style={styles.value}>{item.minusPoint ? item.minusPoint : "0"}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Tổng điểm:</Text>
                      <Text style={[
                        styles.value,
                        { color: '#2196F3' }
                      ]}>
                        {item.totalPoint ? item.totalPoint : "0"} / {item.kpiRegistry ? item.kpiRegistry : "0"}
                      </Text>
                      {/* Thêm icon điều kiện */}
                      {(item.totalPoint || 0) >= (item.kpiRegistry || 0) ? (
                        <Icon
                          name="check-circle"
                          size={20}
                          color="#4CAF50"
                          style={{ marginLeft: 8 }}
                        />
                      ) : (
                        <Icon
                          name="close"
                          size={20}
                          color="#F44336"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Thời gian:</Text>
                      <Text style={styles.value}>{item.time}</Text>
                    </View>
                  </View>


                </View>

                {/* Thanh công cụ dưới cùng */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#999'
                }}>
                  {/* Nút sửa bên trái */}
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Icon name="pencil" size={18} color="#4CAF50" />
                    <Text style={{ marginLeft: 8, color: '#4CAF50' }}>Sửa</Text>
                  </TouchableOpacity>



                  {/* Nút xóa bên phải */}
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.userId ? item.userId : 0)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Icon name="trash" size={18} color="#f44336" />
                    <Text style={{ marginLeft: 8, color: '#f44336' }}>Xóa</Text>
                  </TouchableOpacity>
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

  dateInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },

  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "red",
  },
  confirmButton: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3436',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  pointBox: {
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    padding: 6,
    marginVertical: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  plusPoint: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  minusPoint: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
export default AllPersonelScreen;

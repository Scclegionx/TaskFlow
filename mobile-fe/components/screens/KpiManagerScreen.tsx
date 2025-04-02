import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button, Modal } from "react-native";
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
}


const AllPersonelScreen = () => {

  const router = useRouter();

  const navigation = useNavigation(); // Use the hook to get the navigation object

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Quản lý KPI" }); // Cập nhật tiêu đề
  }, [navigation]);


  const [kpiData, setKpiData] = useState<Array<KPIEntry>>([]); // kpi  co dung de lay du lieu kpi


  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPIEntry | null>(null); //  null là đăng ký mới, có dữ liệu là sửa


  const [searchText, setSearchText] = useState("");

  const [time, setTime] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false); // popup đăng ký KPI
  const [kpiValue, setKpiValue] = useState(""); // Giá trị nhập trong ô input



  const [kpi_Id, setkpi_Id] = useState<number>(0);

  const [user_Id, setuser_Id] = useState<number>(0);


  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lấy danh sách user từ API

  useEffect(() => {
    fetchKPIByMonth("", "");
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




  const fetchKPIByMonth = async (time: string,
    textSearch: string) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiMonthUrl = `${API_BASE_URL}/kpi/get-kpi-by-month`;
      if (textSearch.trim()) {
        kpiMonthUrl += `?textSearch=${encodeURIComponent(searchText)}`;
      }


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

      const response = await fetch(`${API_BASE_URL}/document/download`, {
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
      const fileUri = FileSystem.documentDirectory + "data.xlsx";

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




  const fetchRegistryKPI = async (pointKpi: number) => {
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiRegistryUrl = `${API_BASE_URL}/kpi/register-kpi?userId=${profile?.id}&pointKpi=${pointKpi}`;

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



  const fetchEditKPI = async (kpiId: number, total_point: number) => {
    console.log("hahaah")
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      let kpiDeleteUrl = `${API_BASE_URL}/kpi/edit-kpi?kpiId=${kpiId}&pointKpi=${total_point}`;

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
    fetchKPIByMonth(time, searchText);
  };


  // Hàm gọi API khi bấm xác nhận
  const handleRegisterKpi = async () => {
    if (!kpiValue) {
      Alert.alert("Lỗi", "Vui lòng nhập mục tiêu KPI!");
      return;
    }


    // Gọi API đăng ký KPI
    const response = await fetchRegistryKPI(Number(kpiValue)); // Gọi API và chờ kết quả

    if (response && response?.status === 200) {
      Alert.alert("Thành công", "Đăng ký KPI thành công!");
      setModalVisible(false); // Đóng popup
      setKpiValue(""); // Reset input
    } else {
      Alert.alert("Thất bại ", "Bạn đã đăng ký KPI cho tháng này trước đó rồi!");
    }

    fetchKPIByMonth("", ""); // Lấy lại dữ liệu KPI sau khi đăng ký

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


      const response = await fetchEditKPI(kpi_Id, Number(kpiValue)); // Gọi API và chờ kết quả


      if (response && response?.status === 200) {
        Alert.alert("Thành công", "Sửa KPI thành công!");
        setModalVisible(false); // Đóng popup
        setKpiValue(""); // Reset input
      } else {
        Alert.alert("Thất bại ", "Bạn không có quyền sửa KPI này");
      }
    } else {
      console.log("lỗi khi sửa kpi");
      Alert.alert("Thất bại ", "Bạn không có quyền sửa KPI này");
    }


    fetchKPIByMonth("", ""); // Lấy lại dữ liệu KPI

    // Ẩn popup sau khi gửi API
    setModalVisible(false);
    setSelectedKpi(null); // Reset selected KPI
    setKpiValue(""); // Reset input

    setkpi_Id(0);
    setuser_Id(0);// set lai nho de y
  };



  // Xử lý sửa
  const handleEdit = (kpi: KPIEntry) => {
    setuser_Id(kpi.userId ? kpi.userId : 0);
    setkpi_Id(kpi.id);
    setSelectedKpi(kpi); // Lưu KPI đang chọn vào state
    setKpiValue(kpi.kpiRegistry.toString()); // Điền giá trị hiện tại vào input
    setModalVisible(true); // Mở popup
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
            fetchKPIByMonth("", ""); // Lấy lại dữ liệu KPI sau khi xoa
          }
        }
      ]
    );
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
                setModalVisible(true); // Mở popup
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Đăng ký</Text>
            </TouchableOpacity>
          </View>


          {/* Popup nhập KPI */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: 300, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                  {selectedKpi ? "Chỉnh sửa KPI" : "Đăng ký KPI mới"}
                </Text>
                <TextInput
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                    padding: 10,
                    fontSize: 16,
                    marginBottom: 15,
                    textAlign: "center",
                  }}
                  keyboardType="numeric"
                  placeholder="Nhập số KPI..."
                  value={kpiValue}
                  onChangeText={setKpiValue}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                  <TouchableOpacity
                    style={{ backgroundColor: "red", padding: 10, borderRadius: 5, flex: 1, marginRight: 10 }}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedKpi(null);
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: "green", padding: 10, borderRadius: 5, flex: 1 }}
                    onPress={handleEditKpi}
                  >
                    <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
                      {selectedKpi ? "Cập nhật" : "Đăng ký"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Danh sách KPI */}
          <FlatList
            data={kpiData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: "#CECECE", // xám nhạt
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 10,
                  elevation: 3,

                }}
              // onPress={() => handleKPIPress(item)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Icon người dùng */}
                  <Icon
                    name="user-circle"
                    size={32}
                    color="#4CAF50"
                    style={{ marginRight: 15 }}
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
    backgroundColor: "#f1f1f1"
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
    backgroundColor: "#D3D3D3",
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

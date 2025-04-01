import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert  } from "react-native";
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
  user_id: number;
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


  const [searchText, setSearchText] = useState("");

  const [time, setTime] = useState<string>("");


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
  



  const fetchKPIByMonth = async (time: string , textSearch : string) => {    try {
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
    }finally{
      setLoading(false);
    }
  };


  
  const handleSearch = () => {
    fetchKPIByMonth(time, searchText);
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
      <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 15 }}>
        Tổng số KPI: {kpiData.length}
      </Text>

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
                    { color: '#2196F3'  }
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

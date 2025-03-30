import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@/constants/api";


interface UserProfile {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
  avatar: string;
}


const PersonelScreen = () => {
  const navigation = useNavigation(); // Use the hook to get the navigation object
  
  useLayoutEffect(() => {
    navigation.setOptions({ title: "Nhân sự" }); // Cập nhật tiêu đề
  }, [navigation]);

  const [search, setSearch] = useState("");
  const [data, setData] = useState<{ name: string; email: string }[]>([]);
  const [filteredData, setFilteredData] = useState<{ name: string; email: string }[]>([]); // Dữ liệu sau khi lọc
  const [loading, setLoading] = useState(true);

  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lấy danh sách user từ API
  useEffect(() => {


    const fetchProfile = async () => {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu người dùng");
        }

        const data: UserProfile = await response.json(); // Ép kiểu dữ liệu
        setProfile(data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();


    const fetchMembers = async () => {
      setLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage

        if (!authToken) {
          console.error("Không tìm thấy token! Vui lòng đăng nhập.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/projects/get-all-member-in-project`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Mã lỗi: ${response.status}`);
        }

        const result = await response.json();
        setData(result); // Lưu toàn bộ dữ liệu
        setFilteredData(result); // Mặc định hiển thị tất cả
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Hàm tìm kiếm
const handleSearch = (text: string) => {
  setSearch(text);
  if (text) {
    setFilteredData(data.filter((item) => item.name.toLowerCase().includes(text.toLowerCase())));
  } else {
    setFilteredData(data);
  }
};

  return (
    <View style={{ padding: 16, backgroundColor: "#F8F9FA", flex: 1 }}>
      {/* Ô tìm kiếm */}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#E9ECEF", borderRadius: 10, paddingHorizontal: 10 }}>
      <Avatar.Image size={30} source={{ uri: profile?.avatar || "" }} />
        <TextInput
          style={{ flex: 1, height: 40, marginLeft: 10 }}
          placeholder="Tìm kiếm"
          value={search}
          onChangeText={handleSearch}
        />
        <Icon name="search" size={20} color="gray" />
      </View>

      {/* Kiểm tra nếu đang load dữ liệu */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Tổng số thành viên */}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}>Tổng số: {filteredData.length}</Text>

          {/* Danh sách người dùng */}
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#DEE2E6",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                <Icon name="user-circle" size={24} color="red" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                  {/* <Text style={{ fontSize: 12, color: "gray" }}>{item.email}</Text> */}
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
};

export default PersonelScreen;

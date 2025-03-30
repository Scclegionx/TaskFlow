import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@/constants/api";
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


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


  const [searchText, setSearchText] = useState("");


  // profile để hiển thị ảnh
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Lấy danh sách user từ API

  useEffect(() => {
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
  
  const fetchMembers = async (searchText: string) => {
    setLoading(true);
  
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Không tìm thấy token! Vui lòng đăng nhập.");
        setLoading(false);
        return;
      }
  
      let membersUrl = `${API_BASE_URL}/projects/get-all-member-in-project`;
      if (searchText.trim()) {
        membersUrl += `?textSearch=${encodeURIComponent(searchText)}`;
      }
  
      const response = await fetch(membersUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const membersData = await response.json();
        setData(membersData);
        setFilteredData(membersData);
      } else {
        console.error("Lỗi khi lấy danh sách thành viên.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh sách thành viên:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    fetchMembers(searchText);
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

});
export default PersonelScreen;

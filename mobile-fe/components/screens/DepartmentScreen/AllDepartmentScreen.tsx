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
import { useRouter } from "expo-router";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  leader: User;
  status: string | null;
}

const AllDepartmentScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredData, setFilteredData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"];

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Danh sách phòng ban" });
  }, [navigation]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async (search = "") => {
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        console.error("Missing auth token");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/department/get-all-department?textSearch=${search}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        setFilteredData(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDepartments(searchText);
  };

  const renderDepartmentItem = ({ item, index }: { item: Department; index: number }) => (
    <TouchableOpacity
      style={[styles.departmentItem, { backgroundColor: colors[index % colors.length] }]}
      // onPress={() => router.push({ pathname: "/departmentDetail", params: { departmentId: item.id } })}
      onPress={() => router.push({ pathname: "/Department/detailDepartment", params: { departmentId: item.id } })}
    >
      <View style={styles.departmentInfo}>
        <Text style={styles.departmentName}>{item.name}</Text>
        <Text style={styles.departmentDescription}>{item.description}</Text>
        <View style={styles.leaderContainer}>
          <Image
            source={{ uri: item.leader.avatar || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s" }}
            style={styles.avatar}
          />
          <Text style={styles.leaderName}>Trưởng phòng: {item.leader.name}</Text>
        
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phòng ban..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <FontAwesome name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.totalText}>Tổng số phòng ban: {filteredData.length}</Text>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderDepartmentItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#8384F8",
    padding: 12,
    borderRadius: 8,
  },
  departmentItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  departmentDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  leaderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  leaderName: {
    fontSize: 14,
    color: "#444",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  loader: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default AllDepartmentScreen;
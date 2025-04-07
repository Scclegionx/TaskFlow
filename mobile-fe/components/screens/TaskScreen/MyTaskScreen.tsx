import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Header from "../../Header";
import { FontAwesome } from '@expo/vector-icons';
import { Avatar, Card, IconButton } from "react-native-paper";
import { API_BASE_URL } from "@/constants/api";
import { useRouter } from "expo-router";


// interface này task nhá
interface Task {
  id: string;
  title: string;
  toDate?: string; // Optional if it can be undefined
  date: string; // Add this property;
  status: number,
  waitFinish: number,

}

// bieu do cot trong home
type TaskStatusData = {
  IN_PROGRESS: number;
  CANCELLED: number;
  COMPLETED: number;
  OVERDUE: number;
} | null;



interface TaskStatus {
  IN_PROGRESS?: number;
  COMPLETED?: number;
}

const MyTaskScreen = () => {

  const router = useRouter();
  const navigation = useNavigation();


  // danh sách task
  const [tasks, setTasks] = useState<Task[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Công việc của tôi" }); // Cập nhật tiêu đề
  }, [navigation]);


  // loading
  const [loading, setLoading] = useState(true);

  // bieu do tron     du an
  const [numberTaskStatusData, setNumberTaskStatusData] = useState<TaskStatusData>(null);

  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null); // Lưu trạng thái lấy từ API

  const [taskType, setTaskType] = useState<number | null>(null);// Lưu loại công việc

  const [searchText, setSearchText] = useState("");

  const colors = ["#ADDCE3", "#D1E7DD", "#FEE2E2", "#EDEBDE", "#FDE8C9"]; // danh sách màu






  const fetchTasks = async (taskType: number | null = null, searchText: string = "") => {
    const authToken = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    if (!authToken) return;

    let url = `${API_BASE_URL}/tasks/get-my-task?userId=${userId}`;
    if (taskType !== null) url += `&type=${taskType}`;
    if (searchText.trim()) url += `&textSearch=${encodeURIComponent(searchText)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const taskData: Task[] = await response.json();
        setTasks(taskData.map((task, index) => ({
          id: task.id || String(index),
          title: task.title,
          date: task.toDate || "Không có ngày hết hạn",
          status: task.status,
          waitFinish: task.waitFinish
        })));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Tách hàm fetch số liệu thống kê
  const fetchTaskCount = async (taskType: number | null = null) => {
    const authToken = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    if (!authToken) return;

    let url = `${API_BASE_URL}/tasks/get-task-count-by-status?userId=${userId}`;
    if (taskType !== null) url += `&type=${taskType}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNumberTaskStatusData(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Tách hàm fetch trạng thái công việc
  const fetchTaskStatus = async () => {
    const authToken = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/get-status-all-tasks`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTaskStatus(data);
      }
    } catch (error) {
      console.error("Error fetching task status:", error);
    }
  };



  // Gọi API khi component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTasks(),
          fetchTaskCount(),
          fetchTaskStatus()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // // Gọi API khi có thay đổi filter
  // useEffect(() => {
  //   const loadFilteredData = async () => {
  //     setLoading(true);
  //     try {
  //       await Promise.all([
  //         fetchTasks(taskType, searchText),
  //         fetchTaskCount(taskType)
  //       ]);
  //     } catch (error) {
  //       console.error("Error loading filtered data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };



  //   if (taskType !== null) loadFilteredData();
  // }, [taskType, searchText]);

  // doan check nay can thiet de khong null
  // if (!numberTaskStatusData) {
  //   return <Text>Loading...</Text>; // Hoặc hiển thị UI phù hợp
  // }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 🔍 Thanh tìm kiếm */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity onPress={() => fetchTasks(null, searchText)} style={styles.searchButton}>
                <FontAwesome name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>


            {/* Header danh sách công việc */}
            <View style={{ padding: 20, backgroundColor: '#C8D9CF', marginBottom: - 5, borderRadius: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Danh sách công việc</Text>
              {/* Bộ lọc */}
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowCategoryFilter(!showCategoryFilter)}
                >
                  <Text style={styles.filterText}>Phân loại</Text>
                </TouchableOpacity>
              </View>

              {showCategoryFilter && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(1);
                      fetchTasks(1, "");
                      setShowCategoryFilter(false);
                    }}
                  >
                    <Text>Đang xử lý</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(2);
                      fetchTasks(2, "");
                      setShowCategoryFilter(false);
                    }}
                  >
                    <Text>Hoàn thành</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(3);
                      fetchTasks(3, "");
                      setShowCategoryFilter(false);
                    }}
                  >
                    <Text>Từ chối</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(4);
                      fetchTasks(4, "");
                      setShowCategoryFilter(false);
                    }}
                  >
                    <Text>Quá hạn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(null);
                      fetchTasks(null, "");
                      setShowCategoryFilter(false);
                    }}
                  >
                    <Text>Tất cả</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        }

        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: "/Task/taskDetail", params: { taskId: item.id.toString() } })}>


            <Card style={{
              marginVertical: 8,
              backgroundColor: colors[index % colors.length], // đổi màu theo index
              borderRadius: 15, marginHorizontal: 20
            }}>
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: getStatusColor(item.status),
                        marginRight: 5
                      }}
                    />
                    <Text style={{ fontSize: 14, color: "black" }}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5, color: "#000000" }}>{item.title}</Text>
                  <Text style={{ fontSize: 14, color: 'black', marginVertical: 5 }}>📅 {item.date}</Text>
                  {item.waitFinish === 1 && (
                    <Text style={{ fontSize: 14, color: 'green', marginVertical: 5 }}>⏳ Chờ duyệt </Text>
                  )}
                </View>
                <IconButton icon="star-outline" size={24} />
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const getStatusLabel = (status: number): string => {
  switch (status) {
    case 1:
      return "Đang xử lý";
    case 2:
      return "Hoàn thành";
    case 3:
      return "Từ chối";
    case 4:
      return "Quá hạn";
    default:
      return "Chờ nhận việc";
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1:
      return "#F59E0B"; // vàng
    case 2:
      return "#28A745"; // Xanh lá
    case 3:
      return "#DC3545"; // Đỏ
    case 4:
      return "#3B82F6"; //  xanh dương
    default:
      return "#CCFF33"; // Mặc định
  }
};


const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  taskSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  taskBox: { padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center" },
  blueBox: { backgroundColor: "#1E90FF" },
  grayBox: { backgroundColor: "#6C757D" },
  redBox: { backgroundColor: "#DC4C64" },
  taskText: { color: "white", fontWeight: "bold", textAlign: "center" },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  chart: { marginBottom: 20 },
  inProgress: {
    backgroundColor: "#FFBF57", // Màu vàng khi đang xử lý
  },
  completed: {
    backgroundColor: "green", // Màu xanh khi hoàn thành
  },

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
  searchButton: {
    // backgroundColor: "#007BFF",
    backgroundColor: "#8384F8",
    padding: 10,
    borderRadius: 8
  },

  pieWrapper: { flexDirection: "row", alignItems: "center" },
  pieContainer: { position: "relative", width: 250, height: 250 },
  innerCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    backgroundColor: "white",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    left: 25.5, // Đặt lại để căn giữa
    top: 50.5,  // Đặt lại để căn giữa
  },
  innerCircleText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  innerCircleNumber: { fontSize: 24, fontWeight: "bold", color: "#DC4C64" },

  legendContainer: { marginLeft: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 14, color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  processingTag: {
    backgroundColor: "#FFA500",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 10,
  },

  processingText: {
    color: "#fff",
    fontWeight: "bold",
  },


  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 15,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#FB958D",
  },

  filterText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold", // chữ đậm
  },

  dropdown: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

});

export default MyTaskScreen;

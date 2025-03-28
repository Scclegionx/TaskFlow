import React , { useEffect, useState }from "react";
import { View, Text, ScrollView, FlatList,TouchableOpacity,Image, StyleSheet ,ActivityIndicator } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Header from "../Header";
import { FontAwesome } from '@expo/vector-icons';
import { Avatar, Card, IconButton } from "react-native-paper";
import { API_BASE_URL } from "@/constants/api";


// interface này task nhá
interface Task {
    id: string;
    title: string;
    toDate?: string; // Optional if it can be undefined
    date: string; // Add this property
  }

// bieu do tron trong home
type ProjectStatusData = {
    total: number;
    overdue: number;
    processing: number;
    finished: number;
} | null;



const AllTaskScreen = () => {
    const navigation = useNavigation();


    // danh sách task
    const [tasks, setTasks] = useState<Task[]>([]);

    useLayoutEffect(() => {
        navigation.setOptions({ title: "Tất cả công việc" }); // Cập nhật tiêu đề
      }, [navigation]);


    // loading
    const [loading, setLoading] = useState(true);
 
    // bieu do tron     du an
    const [projectStatusData, setProjectStatusData] = useState<ProjectStatusData>(null);

    const [showCategoryFilter, setShowCategoryFilter] = useState(false);

    useEffect(() => {
        
        const fetchData = async () => {
            const authToken = await AsyncStorage.getItem("token"); // Lấy token từ bộ nhớ
    
            console.log("Token:", authToken);

            if (!authToken) {
                console.error("No token found! Please log in.");
                return;
            }
    
            try {
                // danh sach task , bieu doi tron
                const [taskRes, projectStatusResponse] = await Promise.all([

                    fetch(`${API_BASE_URL}/projects/get-all-task-in-project`, {
                        method: "GET",
                        headers: {
                          "Authorization": `Bearer ${authToken}`,
                          "Content-Type": "application/json"
                        }
                      }),

    
                    fetch(`${API_BASE_URL}/projects/get-number-project-by-status`, {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" }
                    }),
                ]);


                

                // Xử lý dữ liệu công việc (tasks)
        if (taskRes.ok) {
           const taskData: Task[] = await taskRes.json();
           setTasks(taskData.map((task, index) => ({
            id: task.id || String(index),
            title: task.title,
            date: task.toDate || "Không có ngày"
           
          })));
          } else {
            console.error("Lỗi lấy danh sách công việc.");
          }
        

                if (projectStatusResponse.ok) setProjectStatusData(await projectStatusResponse.json());
                else console.error("Failed to fetch project status data.");


            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

    
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                {/* <ActivityIndicator size="large" color="#1E90FF" /> */}
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    // doan check nay can thiet de khong null
    if (  !projectStatusData ) {
        return <Text>Loading...</Text>; // Hoặc hiển thị UI phù hợp
    }

    return (
        <ScrollView style={styles.container}>

                        {/* Dải màu vàng cho chữ "Đang xử lý" */}
            <View style={styles.statusContainer}>
                <Text >Tiến độ công việc</Text>
                <View style={styles.processingTag}>
                    <Text style={styles.processingText}>Đang xử lý</Text>
                </View>
            </View>
        
            {/* Pie Chart (Donut) */}
            <View style={styles.pieWrapper}>
                <View style={styles.pieContainer}>
                    <PieChart
                          data={[
                            { name: "Hoàn thành", population: projectStatusData.finished || 0, color: "#4285F4", legendFontColor: "#222", legendFontSize: 12 },
                            { name: "Đang xử lý", population: projectStatusData.processing || 0, color: "#FFA500", legendFontColor: "#222", legendFontSize: 12 },
                            { name: "Quá hạn", population: projectStatusData.overdue || 0, color: "#34A853", legendFontColor: "#222", legendFontSize: 12 },
                        ]}
                        width={400}
                        height={250}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                    />
                    {/* Vòng tròn trắng ở giữa */}
                    <View style={styles.innerCircle}>
                        <Text style={styles.innerCircleText}>Tổng số</Text>
                        <Text style={styles.innerCircleNumber}>{projectStatusData.total}</Text>
                    </View>
                </View>
            </View>




            // danh sách công việc

            <View style={{ padding: 20, backgroundColor: '#F8F8F8', flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Danh sách công việc</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginVertical: 8, backgroundColor: '#D9D9D9', borderRadius: 15 }}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#333', fontWeight: 'bold' }}>Đang xử lý</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>📅 {item.date}</Text>
              </View>
              {/* <Avatar.Image size={40} source={{ uri: item.avatar }} /> */}
              <IconButton icon="star-outline" size={24} />
            </Card.Content>
          </Card>
        )}
      />
    </View>

        </ScrollView>
    );
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
        backgroundColor: "#f9f9f9",
      },
      
      filterText: {
        fontSize: 14,
        color: "#333",
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

export default AllTaskScreen;

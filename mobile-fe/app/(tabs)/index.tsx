import React , { useEffect, useState }from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";


// 3 cai tren cung cua home
type ApiResponse = {
    projects: number;
    tasks: number;
    users: number;
  } | null;


  // bieu do cot trong home
  type TaskStatusData = {
    IN_PROGRESS: number;
    CANCELLED: number;
    COMPLETED: number;
    OVERDUE: number;
} | null;

// bieu do tron trong home
type ProjectStatusData = {
    total: number;
    overdue: number;
    processing: number;
    finished: number;
} | null;

const HomeScreen = () => {

    //  du an , cong viec , nhan su
    const [data, setData] = useState<ApiResponse>(null);

    // bieu do cot cong viec
    const [taskData, setTaskData] = useState<TaskStatusData>(null);
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
                // lan lượt  3 cai tren cung, task , du an
                const [projectResponse, taskResponse, projectStatusResponse] = await Promise.all([
                    fetch("http://localhost:8080/api/projects/get-number-project-task-member", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${authToken}`,
                            "Content-Type": "application/json"
                        }
                    }),
                    fetch("http://localhost:8080/api/tasks/get-task-count-by-status", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${authToken}`,
                            "Content-Type": "application/json"
                        }
                    }),
                    fetch("http://localhost:8080/api/projects/get-number-project-by-status", {
                        method: "GET",
                        headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" }
                    }),
                ]);

                if (projectResponse.ok) {
                    setData(await projectResponse.json());
                } else {
                    console.error("Failed to fetch project data.");
                }

                if (taskResponse.ok) {
                    setTaskData(await taskResponse.json());
                } else {
                    console.error("Failed to fetch task data.");
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
    if (!data || !taskData || !projectStatusData ) {
        return <Text>Loading...</Text>; // Hoặc hiển thị UI phù hợp
    }

    return (
        <ScrollView style={styles.container}>
            {/* Task Summary */}
            <View style={styles.taskSummary}>
                <TouchableOpacity style={[styles.taskBox, styles.blueBox]}>
                    <Text style={styles.taskText}> Dự án ({data?.projects ?? 0})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.taskBox, styles.grayBox]}>
                    <Text style={styles.taskText}>Công việc ({data?.tasks ?? 0}) </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.taskBox, styles.redBox]}>
                    <Text style={styles.taskText}>Nhân sự ({data?.users ?? 0})</Text>
                </TouchableOpacity>
            </View>

            

            {/* Bar Chart */}
            <Text style={styles.chartTitle}>Công việc</Text>
                    
               {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
        >
          <Text style={styles.filterText}>Phân loại</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Thời gian</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị danh sách khi bấm vào "Phân loại" */}
      {showCategoryFilter && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text>Giao</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text>Được giao</Text>
          </TouchableOpacity>
        </View>
      )}
        
            <BarChart
                data={{
                    labels: ["Đang xử lý", "Hoàn thành", "Từ chối", "Quá hạn"],
                    datasets: [{
                        data: [
                            taskData.IN_PROGRESS || 0,
                            taskData.COMPLETED || 0,
                            taskData.CANCELLED || 0,
                            taskData.OVERDUE || 0
                        ]
                    }]
                }}
                width={350}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisSuffix=""
                showValuesOnTopOfBars={true} // Hiển thị giá trị trên đầu cột
            />

            {/* Pie Chart (Donut) */}
            <Text style={styles.chartTitle}>Dự án</Text>
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

export default HomeScreen;

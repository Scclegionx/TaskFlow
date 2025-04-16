import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/constants/api";
import { useFocusEffect } from '@react-navigation/native';

import Icon from "react-native-vector-icons/FontAwesome"; // Import icon
import { Dimensions } from 'react-native';


const { width } = Dimensions.get('window');

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
    PENDING: number
} | null;

// bieu do tron trong home
type ProjectStatusData = {
    total: number;
    overdue: number;
    processing: number;
    finished: number;
} | null;

const HomeScreen = () => {

    const router = useRouter();

    //  du an , cong viec , nhan su
    const [data, setData] = useState<ApiResponse>(null);

    // bieu do cot cong viec
    const [taskData, setTaskData] = useState<TaskStatusData>(null);
    // loading
    const [loading, setLoading] = useState(true);

    // bieu do tron     du an
    const [projectStatusData, setProjectStatusData] = useState<ProjectStatusData>(null);

    const [showTaskCategoryFilter, setShowTaskCategoryFilter] = useState(false);
    const [showProjectCategoryFilter, setShowProjectCategoryFilter] = useState(false);

    const [taskType, setTaskType] = useState<number | null>(null);// Lưu loại công việc

    const [projectType, setProjectType] = useState<number | null>(null);// Lưu loại dự án



    // hàm này sẽ chạy mỗi khi tab được focus (tức là bấm vào lại)
    useFocusEffect(
        useCallback(() => {
            // Hàm này sẽ chạy mỗi khi tab được focus (tức là bấm vào lại)
            fetchData();

            return () => {
                // Optional: cleanup nếu cần
            };
        }, [])
    );



    const fetchData = async (
        taskType: number | null = null,
        projectType: number | null = null) => {
        const authToken = await AsyncStorage.getItem("token"); // Lấy token từ bộ nhớ

        const userId = await AsyncStorage.getItem("userId");  //  Lấy userId từ AsyncStorage

        console.log("Token:", authToken);
        console.log("phamtu haha  UserId: ", userId);

        if (!authToken) {
            console.error("No token found! Please log in.");
            return;
        }

        try {

            let tasktUrl = `${API_BASE_URL}/tasks/get-task-count-by-status?userId=${userId}`;
            if (taskType !== null) {
                tasktUrl += `&type=${taskType}`;
            }

            let projectUrl = `${API_BASE_URL}/projects/get-number-project-by-status?userId=${userId}`;
            if (projectType !== null) {
                projectUrl += `&type=${projectType}`;
            }


            // lan lượt  3 cai tren cung, task , du an
            const [projectResponse, taskResponse, projectStatusResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/projects/get-number-project-task-member`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(tasktUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch(projectUrl, {
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

    // Gọi API khi component mount lần đầu
    useEffect(() => {
        fetchData();
    }, []);

    // Gọi API lại mỗi khi taskType thay đổi
    useEffect(() => {
        if (taskType !== null) {
            fetchData(taskType, projectType);
        }
    }, [taskType, projectType]);



    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                {/* <ActivityIndicator size="large" color="#1E90FF" /> */}
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    // doan check nay can thiet de khong null
    if (!data || !taskData || !projectStatusData) {
        return <Text>Loading...</Text>; // Hoặc hiển thị UI phù hợp
    }

    return (
        <View style={styles.container}>
            <Image 
                source={require('@/assets/images/project-background.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollView}>
                    {/* Task Summary */}

                    {/* Phần 3 task box cần scroll ngang */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.taskSummaryScroll}
                    >
                        <TouchableOpacity style={[styles.taskBox, styles.blueBox]} onPress={() => router.push("/project")}  >
                            <Text style={styles.taskText}> Dự án ({data?.projects ?? 0})</Text>
                            <Icon name="folder" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.taskBox, styles.grayBox]}
                            onPress={() => router.push("/Task/allTask")}
                        >
                            <Text style={styles.taskText}>Công việc ({data?.tasks ?? 0})</Text>
                            <Icon name="tasks" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.taskBox, styles.redBox]}
                            onPress={() => router.push("/allPersonel")}
                        >
                            <Text style={styles.taskText}>Nhân sự ({data?.users ?? 0})</Text>
                            <Icon name="users" size={24} color="#fff" />
                        </TouchableOpacity>
                    </ScrollView>



                    {/* Bar Chart */}
                    <Text style={styles.chartTitle}>Công việc</Text>

                    {/* Bộ lọc */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowTaskCategoryFilter(!showTaskCategoryFilter)} // Sửa thành setShowTaskCategoryFilter
                        >
                            <Text style={styles.filterText}>Phân loại</Text>
                        </TouchableOpacity>


                    </View>

                    {/* Hiển thị danh sách khi bấm vào "Phân loại" */}
                    {showTaskCategoryFilter && (
                        <View style={styles.dropdown}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setTaskType(0); // Gọi API với type = 0
                                    fetchData(0, projectType);    // Gọi API ngay khi chọn
                                    setShowTaskCategoryFilter(false);
                                }}
                            >
                                <Text>Giao</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setTaskType(1); // Gọi API với type = 1
                                    fetchData(1, projectType);    // Gọi API ngay khi chọn
                                    setShowTaskCategoryFilter(false);
                                }}
                            >
                                <Text>Được giao</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setTaskType(null);
                                    fetchData(null, projectType);    // Gọi API ngay khi chọn
                                    setShowTaskCategoryFilter(false);
                                }}
                            >
                                <Text>Tất cả</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                    <ScrollView horizontal>
                        <BarChart
                            data={{
                                labels: ["Đang xử lý", "Hoàn thành", "Từ chối", "Quá hạn", "Chờ nhận việc"],
                                datasets: [{
                                    data: [
                                        taskData.IN_PROGRESS || 0,
                                        taskData.COMPLETED || 0,
                                        taskData.CANCELLED || 0,
                                        taskData.OVERDUE || 0,
                                        taskData.PENDING || 0
                                    ]
                                }]
                            }}
                            width={430}
                            height={220}
                            yAxisLabel=""
                            chartConfig={chartConfig}
                            style={styles.chart}
                            yAxisSuffix=""
                            showValuesOnTopOfBars={true} // Hiển thị giá trị trên đầu cột
                        />

                    </ScrollView>
                    {/* Pie Chart (Donut) */}
                    <Text style={styles.chartTitle}>Dự án</Text>
                    {/* Bộ lọc */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowProjectCategoryFilter(!showProjectCategoryFilter)} // Sửa thành setShowProjectCategoryFilter
                        >
                            <Text style={styles.filterText}>Phân loại</Text>
                        </TouchableOpacity>


                    </View>

                    {/* Hiển thị danh sách khi bấm vào "Phân loại" */}
                    {showProjectCategoryFilter && (
                        <View style={styles.dropdown}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setProjectType(0); // Gọi API với type = 0
                                    fetchData(taskType, 0);    // Gọi API ngay khi chọn
                                    setShowProjectCategoryFilter(false);
                                }}
                            >
                                <Text>Giao</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setProjectType(1); // Gọi API với type = 1
                                    fetchData(taskType, 1);    // Gọi API ngay khi chọn
                                    setShowProjectCategoryFilter(false);
                                }}
                            >
                                <Text>Được giao</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setProjectType(null);
                                    fetchData(taskType, null);    // Gọi API ngay khi chọn
                                    setShowProjectCategoryFilter(false);
                                }}
                            >
                                <Text>Tất cả</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.pieWrapper}>
                        <View style={styles.pieContainer}>
                            <PieChart
                                data={[
                                    { name: "Hoàn thành", population: projectStatusData.finished || 0, color: "#34A853", legendFontColor: "#222", legendFontSize: 12 },
                                    { name: "Đang xử lý", population: projectStatusData.processing || 0, color: "#F59E0B", legendFontColor: "#222", legendFontSize: 12 },
                                    { name: "Quá hạn", population: projectStatusData.overdue || 0, color: "#3B82F6", legendFontColor: "#222", legendFontSize: 12 },
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
            </View>
        </View>
    );
};


const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Màu chữ
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    fillShadowGradientFrom: "#3762D0", // Màu xanh dương
    fillShadowGradientFromOpacity: 1, // Độ đậm của màu bắt đầu
    fillShadowGradientTo: "#3762D0", // Giữ nguyên màu
    fillShadowGradientToOpacity: 1, // Độ đậm màu kết thúc
    barPercentage: 1, // Điều chỉnh độ rộng cột (có thể thay đổi)
    style: {
        borderRadius: 16
    }
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        position: 'relative',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    taskSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    // taskBox: { padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center" },
    taskBox: {
        width: 171.67,  // Đặt chiều rộng
        height: 94,     // Đặt chiều cao
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        margin: 5,
    },
    taskSummaryScroll: {
        paddingVertical: 0, // Thêm padding dọc nếu cần
        marginBottom: 20,
        marginTop: -5,
    },
    blueBox: { backgroundColor: "#4B7BE5" },
    grayBox: { backgroundColor: "#778190" },
    redBox: { backgroundColor: "#D06537" },
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
        backgroundColor: "#ADDCE3",
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
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const HomeScreen = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Task Summary */}
            <View style={styles.taskSummary}>
                <TouchableOpacity style={[styles.taskBox, styles.blueBox]}>
                    <Text style={styles.taskText}>Dự án (20)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.taskBox, styles.grayBox]}>
                    <Text style={styles.taskText}>Công việc (10)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.taskBox, styles.redBox]}>
                    <Text style={styles.taskText}>Nhắc nhở (19)</Text>
                </TouchableOpacity>
            </View>

            {/* Bar Chart */}
            <Text style={styles.chartTitle}>Công việc</Text>
            <BarChart
                data={{
                    labels: ["Đang xử lý", "Hoàn thành", "Từ chối"],
                    datasets: [{ data: [400, 700, 450] }],
                }}
                width={350}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisSuffix=""
            />

            {/* Pie Chart (Donut) */}
            <Text style={styles.chartTitle}>Dự án</Text>
            <View style={styles.pieWrapper}>
                <View style={styles.pieContainer}>
                    <PieChart
                        data={[
                            { name: "Hoàn thành", population: 28, color: "#4285F4", legendFontColor: "#222", legendFontSize: 12 },
                            { name: "Đang xử lý", population: 12, color: "#FFA500", legendFontColor: "#222", legendFontSize: 12 },
                            { name: "Quá hạn", population: 6, color: "#34A853", legendFontColor: "#222", legendFontSize: 12 },
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
                        <Text style={styles.innerCircleNumber}>46</Text>
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
});

export default HomeScreen;

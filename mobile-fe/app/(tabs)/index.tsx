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
             yAxisSuffix=""/>

            {/* Pie Chart */}
            <Text style={styles.chartTitle}>Dự án</Text>
            <PieChart
                data={[
                    { name: "Hoàn thành", population: 28, color: "#4285F4", legendFontColor: "#222", legendFontSize: 12 },
                    { name: "Đang xử lý", population: 12, color: "#FFA500", legendFontColor: "#222", legendFontSize: 12 },
                    { name: "Quá hạn", population: 6, color: "#DC4C64", legendFontColor: "#222", legendFontSize: 12 },
                ]}
                width={350}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
            />
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
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "#222" },
    headerIcons: { flexDirection: "row", alignItems: "center" },
    icon: { marginRight: 10 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 10, padding: 10, marginBottom: 20 },
    input: { flex: 1 },
    taskSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    taskBox: { padding: 15, borderRadius: 10, flex: 1, marginRight: 10, alignItems: "center" },
    blueBox: { backgroundColor: "#1E90FF" },
    grayBox: { backgroundColor: "#6C757D" },
    redBox: { backgroundColor: "#DC4C64" },
    taskText: { color: "white", fontWeight: "bold", textAlign: "center" },
    chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    chart: { marginBottom: 20 },
});

export default HomeScreen;

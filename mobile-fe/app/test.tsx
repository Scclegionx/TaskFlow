import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart as OriginalBarChart, PieChart as OriginalPieChart } from 'react-native-chart-kit';

// Ép kiểu để tránh lỗi TS
const BarChart: any = OriginalBarChart;
const PieChart: any = OriginalPieChart;

const screenWidth = Dimensions.get('window').width;

export default function ChartScreen() {
  // Dữ liệu cho biểu đồ cột
  const barChartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
    datasets: [
      {
        data: [20, 45, 28, 80],
      },
    ],
  };

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = [
    {
      name: 'Hạng A',
      population: 40,
      color: '#FF6384',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Hạng B',
      population: 30,
      color: '#36A2EB',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Hạng C',
      population: 30,
      color: '#FFCE56',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    labelColor: () => '#333',
    strokeWidth: 2,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Biểu đồ cột</Text>
      <BarChart
        style={styles.chartStyle}
        data={barChartData}
        width={screenWidth * 0.9}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
      />

      <Text style={styles.header}>Biểu đồ tròn</Text>
      <PieChart
        data={pieChartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  chartStyle: {
    marginVertical: 8,
  },
});

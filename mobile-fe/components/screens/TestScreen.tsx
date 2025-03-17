import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const ApexChart = () => {
  const [data, setData] = useState([
    { name: 'Category 1', population: 44, color: '#f00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Category 2', population: 55, color: '#0f0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Category 3', population: 41, color: '#00f', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Category 4', population: 17, color: '#ff0', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Category 5', population: 15, color: '#0ff', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ]);

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        width={Dimensions.get('window').width - 20}
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ApexChart;
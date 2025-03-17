import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  BarChart as OriginalBarChart,
  PieChart as OriginalPieChart,
} from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

// Ép kiểu để tránh lỗi TS
const BarChart: any = OriginalBarChart;
const PieChart: any = OriginalPieChart;

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
    
  // Dữ liệu cho biểu đồ cột (Công việc)
  const barChartData = {
    labels: ['Đang xử lý', 'Hoàn thành', 'Từ chối'],
    datasets: [
      {
        data: [200, 600, 300], // ví dụ
      },
    ],
  };

  // Dữ liệu cho biểu đồ tròn (Dự án)
  const pieChartData = [
    {
      name: 'Hoàn thành',
      population: 40,
      color: '#4ADE80', // xanh lá
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Đang xử lý',
      population: 35,
      color: '#60A5FA', // xanh dương
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Từ chối',
      population: 25,
      color: '#F87171', // đỏ
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  // Cấu hình chung cho biểu đồ
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(96,165,250,${opacity})`, // xanh dương
    labelColor: () => '#666',
  };

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Thanh header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Avatar user (ví dụ) */}
          <TouchableOpacity style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <Text style={styles.logo}>phamtu</Text>
        </View>

        {/* Icon mail (ví dụ) */}
        <TouchableOpacity style={styles.iconWrapper}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/561/561127.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* Icon thông báo (ví dụ) */}
        <TouchableOpacity style={styles.iconWrapper}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/786/786453.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* Icon menu (ví dụ) */}
        <TouchableOpacity style={styles.iconWrapper}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828859.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công việc"
        />
        {/* Icon search (ví dụ) */}
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/622/622669.png' }}
          style={styles.searchIcon}
        />
      </View>

      {/* Thanh menu ngang: Dự án, Công việc, Nhân sự */}
      <View style={styles.menuRow}>
        <View style={[styles.menuBox, { backgroundColor: '#60A5FA' }]}>
          <Text style={styles.menuBoxTitle}>Dự án</Text>
          <Text style={styles.menuBoxNumber}>20</Text>
        </View>
        <View style={[styles.menuBox, { backgroundColor: '#A3A3A3' }]}>
          <Text style={styles.menuBoxTitle}>Công việc</Text>
          <Text style={styles.menuBoxNumber}>10</Text>
        </View>
        <View style={[styles.menuBox, { backgroundColor: '#FBBF24' }]}>
          <Text style={styles.menuBoxTitle}>Nhân sự</Text>
          <Text style={styles.menuBoxNumber}>19</Text>
        </View>
      </View>

      {/* Nội dung cuộn (Biểu đồ cột + Biểu đồ tròn) */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Biểu đồ cột: Công việc */}
        <Text style={styles.sectionTitle}>Công việc</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterText}>Phân loại</Text>
          <Text style={styles.filterText}>Thời gian</Text>
        </View>
        <BarChart
          data={barChartData}
          width={screenWidth * 0.9}
          height={220}
          chartConfig={chartConfig}
          style={{ marginVertical: 8, alignSelf: 'center' }}
        />

        {/* Biểu đồ tròn: Dự án */}
        <Text style={styles.sectionTitle}>Dự án</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterText}>Phân loại</Text>
          <Text style={styles.filterText}>Thời gian</Text>
        </View>
        <PieChart
          data={pieChartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </ScrollView>

      {/* Thanh tabbar dưới cùng */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity  style={styles.tabItem} onPress={handleLogin}>
          <Text>Dự án</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}  >
          <Text>Lịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Tin nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Thông tin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const handleLogin = async () => {

    try {
        router.push('/home');
    } catch (error: any) {
        Alert.alert('Error', error.response?.data || 'Failed to login');
    }
};

// Định dạng StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // đẩy icon về bên phải
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  iconWrapper: {
    paddingHorizontal: 6,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
    tintColor: '#666',
  },
  // Menu row
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 16,
  },
  menuBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  menuBoxTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  menuBoxNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Section
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  // Tab bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

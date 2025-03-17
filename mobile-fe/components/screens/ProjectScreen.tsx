import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

// Dữ liệu dự án mẫu
const DATA = [
  {
    id: '1',
    title: 'Dự án IT',
    description: 'Dự án chủ đạo của công ty',
    status: 'Quá hạn',
    date: '25/2/2025',
    progress: 60,
    statusColor: '#FF4B4B', // màu đỏ
  },
  {
    id: '2',
    title: 'Dự án kinh doanh',
    description: 'Dự án chủ đạo của công ty',
    status: 'Đang xử lý',
    date: '25/2/2025',
    progress: 60,
    statusColor: '#00BFFF', // màu xanh dương
  },
  {
    id: '3',
    title: 'Dự án nội bộ',
    description: 'Dự án chủ đạo của công ty',
    status: 'Hoàn thành',
    date: '25/2/2025',
    progress: 60,
    statusColor: '#2ECC71', // màu xanh lá
  },
];

// Component hiển thị 1 thẻ Dự án
const ProjectCard = ({ item }: { item: any }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {/* Nút 3 chấm hoặc menu tùy chọn (tùy biến) */}
        <TouchableOpacity>
          <Text style={{ fontSize: 18 }}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>

      {/* Trạng thái */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.statusColor },
          ]}
        />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* Ngày & Progress */}
      <View style={styles.cardFooter}>
        <View style={styles.cardDate}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${item.progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
    </View>
  );
};

const App = () => {
  const renderItem = ({ item }: { item: any }) => <ProjectCard item={item} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh header trên cùng */}
      <View style={styles.header}>
        {/* Avatar giả lập (thay bằng Image nếu có) */}
        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{
              uri: 'https://i.pravatar.cc/100',
            }}
          />
        </TouchableOpacity>

        {/* Ô tìm kiếm */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
          />
        </View>

        {/* Nút + thêm mới */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách dự án */}
      <View style={styles.listContainer}>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Thanh điều hướng dưới cùng (mockup) */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={{ fontWeight: 'bold' }}>Dự án</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Lịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Tin nhắn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>Thông tin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    marginTop: 4,
    color: '#555',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  cardDate: {
    marginRight: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#444',
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

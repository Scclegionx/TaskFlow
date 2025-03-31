import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";



interface DetailRowProps {
    label: string;
    value: string;
  }
  

const PersonelDetailScreen  = () => {

    const router = useRouter();
    const navigation = useNavigation();


    useLayoutEffect(() => {
        navigation.setOptions({ title: "Thông tin nhân sự" }); // Cập nhật tiêu đề
      }, [navigation]);


  const personDetail = {
    name: 'pahmtu',
    assigner: 'Phamtu',
    assignee: 'Phạm Trưởng',
    startDate: '20/01/2025',
    endDate: '20/02/2026',
    project: 'dự án IT',
    status: 'đang xử lý'
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{personDetail.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#ffe6cc' }]}>
          <Text style={styles.statusText}>{personDetail.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <DetailRow label="Người giao" value={personDetail.assigner} />
        <DetailRow label="Người thực hiện" value={personDetail.assignee} />
        <DetailRow label="Ngày bắt đầu" value={personDetail.startDate} />
        <DetailRow label="Ngày kết thúc" value={personDetail.endDate} />
        <DetailRow label="Dự án" value={personDetail.project} />
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: '#ff9900',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default PersonelDetailScreen ;
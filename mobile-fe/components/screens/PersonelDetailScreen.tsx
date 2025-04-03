import React , {useState, useEffect} from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from 'expo-router';



interface DetailRowProps {
    label: string;
    value: string;
  }


  interface inforPerson {
    id : number;
    name : string;
    email : string;
    gender : string;
    phoneNumber : string;
    dateOfBirth : string;
  }
  

const PersonelDetailScreen  = () => {

    const router = useRouter();
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();

    const [inforPersonData, setInforPersonData] = useState<inforPerson | null>(null);


    useLayoutEffect(() => {
        navigation.setOptions({ title: "Thông tin nhân sự" }); // Cập nhật tiêu đề
      }, [navigation]);

      useEffect(() => {
        fetchInforPerson();
      }, []);

      const fetchInforPerson = async () => {
      
        try {
          const authToken = await AsyncStorage.getItem("token");
          if (!authToken) {
            console.error("Không tìm thấy token! Vui lòng đăng nhập.");
            return;
          }
  
          let infoUrl = `${API_BASE_URL}/users/get-user-by-id?userId=${userId}`;
  
          const response = await fetch(infoUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          });
    
          if (response.ok) {
            const inforUser = await response.json();
            setInforPersonData(inforUser);
          } else {
            console.error("Lỗi khi lấy danh sách thành viên.");
          }
        } catch (error) {
          console.error("Lỗi khi gọi API danh sách thành viên:", error);
        } 
      };




  return (
    <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Tên : </Text>
        <Text style={styles.value}>{inforPersonData?.name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>email : </Text>
        <Text style={styles.value}>{inforPersonData?.email}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Giới tính : </Text>
        <Text style={styles.value}>{inforPersonData?.gender}</Text>
      </View>

      
    </View>
  </View>
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#666',
  },
  status: {
    color: 'orange', // Màu cho trạng thái
    fontWeight: '500',
  },
});

export default PersonelDetailScreen ;
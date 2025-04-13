
import React from 'react';
import { View, Button, StyleSheet, Linking, Alert, TouchableOpacity} from 'react-native';
import { useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
const MeetingScreen = () => {
  const [meetingUrl, setMeetingUrl] = React.useState(''); // State để lưu URL cuộc họp
  const {chatId,chatName} = useLocalSearchParams()// Nhận messageId từ route
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: chatName,      
      });
    }, [navigation, chatName])
  );
  const openMeeting = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage
      const response = await axios.post(
        `${API_BASE_URL}/meetings/createOrJoin/${chatId}`, // Gọi API với chatId
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const { meetingUrl } = response.data;
      const configuredMeetingUrl = `${meetingUrl}?skipIntro=true&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.deeplinking.enabled=false`;
  
      setMeetingUrl(configuredMeetingUrl); // Lưu URL đã cấu hình
      const supported = await Linking.canOpenURL(configuredMeetingUrl);
  
      if (supported) {
        await Linking.openURL(configuredMeetingUrl); // Mở URL cuộc họp
      } else {
        Alert.alert("Không thể mở cuộc họp", "Thiết bị không hỗ trợ mở URL này.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo hoặc tham gia cuộc họp:", error);
      Alert.alert("Lỗi", "Không thể tạo hoặc tham gia cuộc họp.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Tham gia cuộc họp Jitsi" onPress={openMeeting} />
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

export default MeetingScreen;

import { useRouter } from "expo-router";
import { logout } from "@/hooks/useAuthApi";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Image,
  Alert, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_BASE_URL } from "../../constants/api";
import { Platform } from "react-native";
import { Avatar } from "react-native-paper";
const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [roles, setRoles] = useState([]);

  // useEffect(() => {
  //   const loadUser = async () => {
  //     const name = await AsyncStorage.getItem("username");
  //     const email = await AsyncStorage.getItem("email");
  //     const avatar = (await AsyncStorage.getItem("avatar")) || ""; // Lấy avatar từ AsyncStorage
  //     const storedRoles = await AsyncStorage.getItem('roles');
  //     setRoles(storedRoles ? JSON.parse(storedRoles) : []);
  //     if (name && email) setUser({ name, email, avatar });
  //   };
  //   console.log("hahah :    : ",user.avatar)
  //   loadUser();
  // }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [name, email, avatar, storedRoles] = await Promise.all([
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("email"),
          AsyncStorage.getItem("avatar"),
          AsyncStorage.getItem("roles"),
        ]);

        // Xử lý giá trị avatar
        let processedAvatar = avatar || ""; // Chuyển null thành chuỗi rỗng

        // Nếu avatar là chuỗi rỗng hoặc "null", gán thành chuỗi rỗng
        if (processedAvatar === "null" || processedAvatar.trim() === "") {
          processedAvatar = "";
        }

        setRoles(storedRoles ? JSON.parse(storedRoles) : []);

        if (name && email) {
          setUser({
            name,
            email,
            avatar: processedAvatar,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    loadUser();
  }, []);
  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log(result.assets[0].uri);
    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  // Gọi API để cập nhật avatar

  const uploadAvatar = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
        return;
      }

      let formData = new FormData();
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("avatar", blob, "avatar.jpg");
      } else {
        formData.append("avatar", {
          uri: imageUri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });
      }

      const res = await axios.post(
        `${API_BASE_URL}/users/change-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
      setUser((prevUser) => ({
        ...prevUser,
        avatar: res.data.avatar,
      }));
      await AsyncStorage.setItem("avatar", res.data.avatar);
      Alert.alert("Thành công", "Avatar đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.multiRemove([
        "token",
        "username",
        "exp",
        "email",
        "avatar",
        "userId",
      ]);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={styles.profileContainer}>
      {/* <Image
        source={require('@/assets/images/project-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      /> */}
      <View style={styles.contentContainer}>

        <TouchableOpacity onPress={pickImage} style={styles.profileCard}>
          {/* {user.avatar=="" ? (
            <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
          ) : (
            <Image
              source={require("@/assets/images/default-avatar.jpg")} style={styles.profileAvatar}/>
          )} */}
          <Image
            source={{
              uri: user.avatar && user.avatar.trim() !== ""
                ? user.avatar
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Sk010pigAtfv0VKmNOWxpUHr9b3eeipUPg&s",
            }}
            style={styles.profileAvatar}
            // Thêm prop này để xử lý lỗi tải ảnh
            onError={() => console.log("Error loading image")}
            // Web cần thêm defaultSource
            defaultSource={require('@/assets/images/default-avatar.jpg')}
          />

        </TouchableOpacity>

        <ScrollView style={styles.profileInfo}>
          <ProfileItem icon="👤" label="Thông tin cá nhân" onPress={() => router.push('/account-info')} />
          <ProfileItem icon="📧" label={user.email} onPress={() => router.push('/email-screen')} />
          <ProfileItem icon="🔒" label="Mật khẩu" onPress={() => router.push('/password-screen')} />
          <ProfileItem icon="📋" label="Quản lý lịch sử thay đổi" onPress={() => router.push('/history')} />
          <ProfileItem icon="🏢" label="Quản lý phòng ban" onPress={() => router.push('/Department/allDepartment')} />
          <ProfileItem icon="🏆" label="Quản lý KPI" onPress={() => router.push('/kpiManager')} />
          <ProfileItem icon="📅" label="Quản lý chấm công" onPress={() => router.push('/chamCong')} />
          <ProfileItem icon="⏳" label="Công việc chờ duyệt" onPress={() => router.push('/Task/taskPending')} />
          <ProfileItem icon="📋" label="Công việc của tôi" onPress={() => router.push('/Task/myTask')} />
          {roles.includes("ADMIN") && <ProfileItem icon="👤" label="Quyền Admin" onPress={() => router.push('/Admin')} />}
        </ScrollView>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ProfileItem = ({ icon, label, onPress }: { icon: string; label: string, onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.profileItem} activeOpacity={0.6}>
    <Text style={styles.profileItemLabel}>{icon} {label}</Text>
    <Text style={styles.profileItemEdit}>✏️</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  profileContainer: {
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
    padding: 20,
    marginTop: 40,
  },
  profileAvatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // Bỏ dòng backgroundColor xanh
    // backgroundColor: '#3B82F6', 
    // Thêm màu nền dự phòng nếu cần
    backgroundColor: '#f0f0f0',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold'
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5
  },
  profileInfo: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },

  profileItemLabel: {
    fontSize: 16,
    color: '#333'
  },
  profileItemEdit: {
    fontSize: 16,
    color: '#666'
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginTop: 20
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default Profile;

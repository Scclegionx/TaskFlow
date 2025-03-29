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
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_BASE_URL } from "../../constants/api";
import { Platform } from "react-native";
const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });

  useEffect(() => {
    const loadUser = async () => {
      const name = await AsyncStorage.getItem("username");
      const email = await AsyncStorage.getItem("email");
      const avatar = (await AsyncStorage.getItem("avatar")) || ""; // Lấy avatar từ AsyncStorage
      if (name && email) setUser({ name, email, avatar });
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
      <TouchableOpacity onPress={pickImage}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
        ) : (
          <View style={styles.profileAvatarPlaceholder}>
            <Text>🖼️</Text>
          </View>
        )}
      </TouchableOpacity>

            <View style={styles.profileInfo}>
                <ProfileItem icon="👤" label="Thông tin cá nhân" onPress={() => router.push('/account-info')} />
                <ProfileItem icon="📧" label={user.email} onPress={() => router.push('/email-screen')}/>
                <ProfileItem icon="🔒" label="Mật khẩu" onPress={() => router.push('/password-screen')}/>
                <ProfileItem icon="📝" label="Nhiệm vụ của tôi" />
                <ProfileItem icon="👤" label="Quyền Admin" />
            </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
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
    // profileAvatar: { width: 96, height: 96, borderRadius: 48 },
    profileAvatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
    profileContainer: { 
        flex: 1, 
        alignItems: 'center', 
        backgroundColor: "#F9FAFB", 
        padding: 20, 
        marginTop: 40 
    },
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
        backgroundColor: '#3B82F6', 
        alignItems: 'center', 
        justifyContent: 'center' 
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
        // backgroundColor: '#fff', 
        borderRadius: 12, 
        // padding: 10, 
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 3,
        // elevation: 2,
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
        // shadowColor: "#000",  
        // shadowOffset: { width: 0, height: 2 }, 
        // shadowOpacity: 0.1, 
        // shadowRadius: 4, 
        // elevation: 3,
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

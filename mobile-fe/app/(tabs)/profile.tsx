import { useRouter } from 'expo-router';
import { logout } from '@/hooks/useAuthApi';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View, StyleSheet, Text, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '', avatar: '' });

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('username');
            const email = await AsyncStorage.getItem('email');
            const avatar = await AsyncStorage.getItem('avatar') || '';  // Lấy avatar từ AsyncStorage
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
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Lỗi', 'Bạn chưa đăng nhập.');
                return;
            }
    
            // Tạo blob từ URI (chỉ dùng nếu chạy trên web, không cần trên mobile)
            const response = await fetch(imageUri);
            const blob = await response.blob();
    
            let formData = new FormData();
            formData.append('avatar', blob, 'avatar.jpg');
            console.log(formData);    
            const res = await axios.post(`http://192.168.1.22:8080/api/users/change-avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                }
            });
    
            console.log(res.data);
        } catch (error) {
            console.error('Lỗi tải ảnh:', error);
        }
    };
    
    



    const handleLogout = async () => {
        try {
            await logout();
            await AsyncStorage.multiRemove(['token', 'username', 'exp', 'email', 'avatar']);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
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
                <ProfileItem icon="👤" label={user.name} />
                <ProfileItem icon="📧" label={user.email} />
                <ProfileItem icon="🔒" label="Mật khẩu" />
                <ProfileItem icon="📝" label="Nhiệm vụ của tôi" />
                <ProfileItem icon="🔒" label="Quyền riêng tư" />
                <ProfileItem icon="⚙️" label="Cài đặt" />
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
};

const ProfileItem = ({ icon, label }: { icon: string; label: string }) => (
    <View style={styles.profileItem}>
        <Text style={styles.profileItemLabel}>{icon} {label}</Text>
        <Text style={styles.profileItemEdit}>✏️</Text>
    </View>
);

const styles = StyleSheet.create({
    profileContainer: { alignItems: 'center', padding: 16 },
    profileAvatar: { width: 96, height: 96, borderRadius: 48 },
    profileAvatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
    profileInfo: { width: '100%', maxWidth: 400 },
    profileItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8 },
    profileItemLabel: { color: '#ef4444' },
    logoutButton: { backgroundColor: '#3b82f6', padding: 8, borderRadius: 16, alignItems: 'center', width: '100%', maxWidth: 400, marginTop: 16 },
    logoutText: { color: '#fff', fontWeight: 'bold' }
});

export default Profile;

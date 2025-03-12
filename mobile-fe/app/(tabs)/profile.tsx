import { useRouter } from 'expo-router';
import { logout } from '@/hooks/useAuthApi';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const loadUser = async () => {
            const name = await AsyncStorage.getItem('username');
            const email = await AsyncStorage.getItem('email');
            if (name && email) setUser({ name, email });
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('exp');
            await AsyncStorage.removeItem('email');
            // localStorage.clear();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <View style={styles.profileContainer}>
            <View style={styles.profileAvatar}></View>
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
    profileAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb', marginBottom: 16 },
    profileInfo: { width: '100%', maxWidth: 400 },
    profileItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8 },
    profileItemLabel: { color: '#ef4444' },
    profileItemEdit: { },
    logoutButton: { backgroundColor: '#3b82f6', padding: 8, borderRadius: 16, alignItems: 'center', width: '100%', maxWidth: 400, marginTop: 16 },
    logoutText: { color: '#fff', fontWeight: 'bold' }
});

export default Profile;

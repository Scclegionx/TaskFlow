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
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <View style={styles.profileContainer}>
            <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                    <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            <View style={styles.profileInfo}>
                <ProfileItem icon="👤" label="Thông tin cá nhân" onPress={() => router.push('/account-info')} />
                <ProfileItem icon="📧" label="Email" />
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

// const ProfileItem = ({ icon, label }: { icon: string; label: string }) => (
//     <View style={styles.profileItem}>
//         <Text style={styles.profileItemLabel}>{icon} {label}</Text>
//         <Text style={styles.profileItemEdit}>➜</Text>
//     </View>
// );

const ProfileItem = ({ icon, label, onPress }: { icon: string; label: string, onPress?: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.profileItem} activeOpacity={0.6}>
        <Text style={styles.profileItemLabel}>{icon} {label}</Text>
        <Text style={styles.profileItemEdit}>✏️</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
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

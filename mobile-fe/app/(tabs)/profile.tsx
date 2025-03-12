import { useRouter } from 'expo-router';
import { logout } from '@/hooks/useAuthApi';
import { useEffect, useState } from 'react';
import '../../assets/css/profile.css';

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const name = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        if (name && email) setUser({ name, email });
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.clear();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-avatar"></div>
            <div className="profile-info">
                <ProfileItem icon="👤" label={user.name} />
                <ProfileItem icon="📧" label={user.email} />
                <ProfileItem icon="🔒" label="Mật khẩu" />
                <ProfileItem icon="📝" label="Nhiệm vụ của tôi" />
                <ProfileItem icon="🔒" label="Quyền riêng tư" />
                <ProfileItem icon="⚙️" label="Cài đặt" />
            </div>
            <button
                onClick={handleLogout}
                className="logout-button"
            >
                Đăng xuất
            </button>
        </div>
    );
};

const ProfileItem = ({ icon, label }: { icon: string; label: string }) => (
    <div className="profile-item">
        <span className="profile-item-label">{icon} {label}</span>
        <span className="profile-item-edit">✏️</span>
    </div>
);

export default Profile;

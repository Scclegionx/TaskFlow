import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getScheduleById, deleteSchedule } from '@/hooks/useScheduleApi';
import moment from 'moment';

interface Schedule {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    user: {
        name: string;
    };
}

const PRIORITY_LABELS: Record<string, string> = {
    'LOW': 'Thấp 🟢',
    'NORMAL': 'Bình thường 🟡',
    'HIGH': 'Cao 🔴'
};

const ScheduleDetailScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const scheduleId = typeof id === 'string' ? parseInt(id) : 0;
                const data = await getScheduleById(scheduleId);
                setSchedule(data);
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải dữ liệu lịch trình');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [id]);

    const handleDelete = async () => {
        try {
            const scheduleId = typeof id === 'string' ? parseInt(id) : 0;
            await deleteSchedule(scheduleId);
            Alert.alert('Thành công', 'Đã xóa lịch trình', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa lịch trình');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#EF4444" style={styles.loader} />;
    }

    if (!schedule) {
        return <Text style={styles.errorText}>Không tìm thấy lịch trình</Text>;
    }

    const formattedDate = moment(schedule.startTime).format('DD/MM/YYYY');
    const formattedTime = moment(schedule.startTime).format('HH:mm');
    const durationMinutes = moment(schedule.endTime).diff(moment(schedule.startTime), 'minutes');
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;
    const formattedDuration = `${durationHours} giờ ${remainingMinutes} phút`;
    const priorityLabel = PRIORITY_LABELS[schedule.priority] || 'Không xác định';

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{schedule.user.name?.charAt(0)}</Text>
                </View>
                <View>
                    <Text style={styles.title}>{schedule.title}</Text>
                    <Text style={styles.creator}>Người tạo: {schedule.user.name}</Text>
                </View>
            </View>

            <Image source={require('@/assets/images/react-logo.png')} style={styles.image} />

            <View style={styles.infoContainer}>
                <Text style={styles.sectionTitle}>Thông tin</Text>
                <Text style={styles.description}>{schedule.description}</Text>
                <Text style={styles.detail}>📅 Ngày bắt đầu: {formattedDate}</Text>
                <Text style={styles.detail}>🕒 Giờ bắt đầu: {formattedTime}</Text>
                <Text style={styles.detail}>⏳ Thời lượng: {formattedDuration}</Text>
                <Text style={styles.detail}>🚀 Độ ưu tiên: {priorityLabel}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/Schedule/editSchedule?id=${schedule.id}`)}>
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FAFC',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    creator: {
        fontSize: 14,
        color: '#6B7280',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 16,
    },
    detail: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        marginRight: 8,
        color: '#EF4444',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        flex: 1,
        textAlign: 'center',
        marginTop: 20,
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ScheduleDetailScreen;

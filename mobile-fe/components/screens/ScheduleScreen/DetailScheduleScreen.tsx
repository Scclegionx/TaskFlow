import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getScheduleById, deleteSchedule } from '@/hooks/useScheduleApi';
import moment from 'moment';

const PRIORITY_LABELS: Record<string, string> = {
    'LOW': 'Thấp 🟢',
    'NORMAL': 'Bình thường 🟡',
    'HIGH': 'Cao 🔴'
};

const ScheduleDetailScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await getScheduleById(id);
                console.log(data);
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
            await deleteSchedule(id);
            Alert.alert('Thành công', 'Đã xóa lịch trình', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa lịch trình');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#7F669D" style={styles.loader} />;
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
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.header}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{schedule.user.name?.charAt(0)}</Text></View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    backButton: { marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold' },
    title: { fontSize: 20, fontWeight: 'bold' },
    creator: { color: 'gray' },
    image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
    infoContainer: { paddingVertical: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    description: { marginBottom: 5 },
    detail: { fontSize: 14, marginBottom: 5 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    deleteButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5 },
    editButton: { padding: 10, backgroundColor: '#7F669D', borderRadius: 5 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { flex: 1, textAlign: 'center', marginTop: 20, color: 'red' }
});

export default ScheduleDetailScreen;

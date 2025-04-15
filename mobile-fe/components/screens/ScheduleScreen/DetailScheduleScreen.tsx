import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { getScheduleById, deleteSchedule } from '@/hooks/useScheduleApi';
import moment from 'moment';

interface Schedule {
    id: number;
    title: string;
    content: string;
    startTime: string;
    endTime: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    user: {
        name: string;
    };
}

const PRIORITY_LABELS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    'LOW': { label: 'Thấp', icon: 'arrow-down-circle', color: '#10B981' },
    'NORMAL': { label: 'Bình thường', icon: 'remove-circle', color: '#F59E0B' },
    'HIGH': { label: 'Cao', icon: 'arrow-up-circle', color: '#EF4444' }
};

const ScheduleDetailScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [schedule, setSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);

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

    useFocusEffect(
        useCallback(() => {
            fetchSchedule();
        }, [id])
    );

    const handleDelete = async () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa lịch trình này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const scheduleId = typeof id === 'string' ? parseInt(id) : 0;
                            await deleteSchedule(scheduleId);
                            Alert.alert('Thành công', 'Đã xóa lịch trình', [{ text: 'OK', onPress: () => router.back() }]);
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa lịch trình');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (!schedule) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>Không tìm thấy lịch trình</Text>
            </View>
        );
    }

    const formattedDate = moment(schedule.startTime).format('DD/MM/YYYY');
    const formattedTime = moment(schedule.startTime).format('HH:mm');
    const durationMinutes = moment(schedule.endTime).diff(moment(schedule.startTime), 'minutes');
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;
    const formattedDuration = `${durationHours} giờ ${remainingMinutes} phút`;
    const priorityInfo = PRIORITY_LABELS[schedule.priority];

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        >
            {/* <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity> */}
            
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{schedule.user.name?.charAt(0)}</Text>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{schedule.title}</Text>
                    <View style={styles.creatorContainer}>
                        <Ionicons name="person" size={16} color="#6B7280" />
                        <Text style={styles.creator}>Người tạo: {schedule.user.name}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.imageContainer}>
                <Image 
                    source={require('@/assets/images/react-logo.png')} 
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name={priorityInfo.icon} size={16} color="white" />
                        <Text style={styles.priorityText}>{priorityInfo.label}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle" size={24} color="#3B82F6" />
                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                </View>
                
                <View style={styles.descriptionContainer}>
                    <Ionicons name="document-text" size={20} color="#6B7280" style={styles.descriptionIcon} />
                    <Text style={styles.description}>{schedule.content}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar" size={20} color="#3B82F6" />
                        <Text style={styles.detailText}>Ngày bắt đầu: {formattedDate}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Ionicons name="time" size={20} color="#3B82F6" />
                        <Text style={styles.detailText}>Giờ bắt đầu: {formattedTime}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Ionicons name="hourglass" size={20} color="#3B82F6" />
                        <Text style={styles.detailText}>Thời lượng: {formattedDuration}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Ionicons name={priorityInfo.icon} size={20} color={priorityInfo.color} />
                        <Text style={[styles.detailText, { color: priorityInfo.color }]}>
                            Độ ưu tiên: {priorityInfo.label}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => router.push(`/Schedule/editSchedule?id=${schedule.id}`)}
                >
                    <Ionicons name="create" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash" size={20} color="white" style={styles.buttonIcon} />
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '500',
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
    headerContent: {
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3B82F6',
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
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creator: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 200,
    },
    imageOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    priorityText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 8,
    },
    descriptionContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    descriptionIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    description: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    detailsContainer: {
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    detailText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 12,
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
        flexDirection: 'row',
        justifyContent: 'center',
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
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ScheduleDetailScreen;

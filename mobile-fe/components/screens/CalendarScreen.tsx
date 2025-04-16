import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image, ActivityIndicator} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {getSchedulesByDate, getHighlightedDates, deleteSchedule} from '@/hooks/useScheduleApi';
import { useRouter} from "expo-router";
import {Ionicons, MaterialIcons, FontAwesome, AntDesign} from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Schedule {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    user: {
        id: number;
        name: string;
    };
}

// Cấu hình lịch tiếng Việt
LocaleConfig.locales['vi'] = {
    monthNames: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
};
LocaleConfig.defaultLocale = 'vi';

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [highlightedDates, setHighlightedDates] = useState<{[key: string]: any}>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userIdStr = await AsyncStorage.getItem('userId');
                if (userIdStr) {
                    setCurrentUserId(parseInt(userIdStr));
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
            }
        };
        fetchCurrentUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchHighlightedDates();
            if (selectedDate) {
                fetchSchedules(selectedDate);
            }

            return () => {
                setSchedules([]);
                setModalVisible(false);
            };
        }, [selectedDate])
    );

    useEffect(() => {
        fetchHighlightedDates();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchSchedules(selectedDate);
        }
    }, [selectedDate]);

    const fetchSchedules = async (date: string, page: number = 0) => {
        setLoading(true);
        try {
            const data = await getSchedulesByDate(date, page, 5);
            console.log(data);
            if (data && data.content) {
                setSchedules(data.content);
                setTotalPages(data.totalPages);
            } else {
                setSchedules([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy lịch trình:', error);
            setSchedules([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchHighlightedDates = async () => {
        try {
            const data = await getHighlightedDates();
            let formattedDates: {[key: string]: any} = {};

            Object.keys(data).forEach(date => {
                const priorityColor = getPriorityColor(data[date]);
                formattedDates[date] = { 
                    selected: true, 
                    selectedColor: priorityColor,
                    dotColor: priorityColor
                };
            });

            setHighlightedDates(formattedDates);
        } catch (error) {
            console.error('Lỗi khi lấy ngày highlight:', error);
        }
    };

    const getPriorityColor = (priority: 'HIGH' | 'NORMAL' | 'LOW'): string => {
        switch (priority) {
            case 'HIGH': return '#EF4444'; // Đỏ
            case 'NORMAL': return '#F59E0B'; // Cam
            case 'LOW': return '#10B981'; // Xanh lá
            default: return '#6B7280'; // Xám
        }
    };

    const getPriorityLabel = (priority: 'HIGH' | 'NORMAL' | 'LOW'): string => {
        switch (priority) {
            case 'HIGH': return 'Cao';
            case 'NORMAL': return 'Bình thường';
            case 'LOW': return 'Thấp';
            default: return 'Không xác định';
        }
    };

    const handleLongPress = (schedule: Schedule) => {
        if (currentUserId === schedule.user.id) {
            setSelectedSchedule(schedule);
            setModalVisible(true);
        }
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;
        
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa lịch trình này không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteSchedule(selectedSchedule.id);
                            Alert.alert("Thành công", "Lịch trình đã được xóa!");
                            fetchSchedules(selectedDate);
                            fetchHighlightedDates();
                        } catch (error) {
                            console.error("Lỗi khi xóa lịch trình:", error);
                            Alert.alert("Lỗi", "Không thể xóa lịch trình, vui lòng thử lại!");
                        } finally {
                            setModalVisible(false);
                        }
                    }
                }
            ]
        );
    };

    const onEdit = () => {
        if (!selectedSchedule) return;
        router.push(`/Schedule/editSchedule?id=${selectedSchedule.id}`);
        setModalVisible(false);
    };

    const onDelete = () => {
        handleDelete();
    };

    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        return new Date(timeString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchSchedules(selectedDate, newPage);
    };

    return (
        <View style={styles.mainContainer}>
            <Image 
                source={require('../../assets/images/project-background.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    {/* Lịch */}
                    <View style={styles.calendarContainer}>
                        <Calendar
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={{
                                ...highlightedDates,
                                [selectedDate]: { 
                                    selected: true, 
                                    selectedColor: '#EF4444',
                                    dotColor: '#EF4444'
                                }
                            }}
                            theme={{
                                todayTextColor: '#EF4444',
                                selectedDayBackgroundColor: '#EF4444',
                                arrowColor: '#EF4444',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                                backgroundColor: 'white',
                                calendarBackground: 'white',
                                textSectionTitleColor: '#374151',
                                dayTextColor: '#1F2937',
                                textDisabledColor: '#9CA3AF',
                                dotColor: '#EF4444',
                                selectedDotColor: 'white',
                                monthTextColor: '#EF4444',
                                indicatorColor: '#EF4444',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '500',
                                stylesheet: {
                                    calendar: {
                                        header: {
                                            arrow: {
                                                color: '#EF4444'
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </View>

                    {/* Tiêu đề lịch trình */}
                    <View style={styles.sectionTitleContainer}>
                        <View style={styles.titleWrapper}>
                            <MaterialIcons name="event-note" size={24} color="#EF4444" />
                            <Text style={styles.sectionTitle}>
                                Lịch trình cho {selectedDate || 'hôm nay'}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.createButton}
                            onPress={() => router.push("/Schedule/createSchedule")}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.listContainer}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#EF4444" />
                            </View>
                        ) : schedules && schedules.length > 0 ? (
                            <>
                                {schedules.map((item) => (
                                    <TouchableOpacity 
                                        key={item.id}
                                        onPress={() => router.push(`/Schedule/detailSchedule?id=${item.id}`)}
                                        onLongPress={() => handleLongPress(item)}
                                        style={styles.itemCard}
                                    >
                                        <View style={styles.itemHeader}>
                                            <MaterialIcons name="event" size={20} color="#EF4444" />
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                        </View>
                                        <View style={styles.itemTimeContainer}>
                                            <FontAwesome name="clock-o" size={16} color="#6B7280" />
                                            <Text style={styles.itemTime}>
                                                {new Date(item.startTime).toLocaleTimeString('vi-VN')} - {new Date(item.endTime).toLocaleTimeString('vi-VN')}
                                            </Text>
                                        </View>
                                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                                            <Text style={styles.priorityText}>
                                                {getPriorityLabel(item.priority)}
                                            </Text>
                                        </View>
                                        {currentUserId === item.user.id && (
                                            <View style={styles.creatorBadge}>
                                                <Text style={styles.creatorText}>Người tạo</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {totalPages > 1 && (
                                    <View style={styles.paginationContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === 0 && styles.paginationButtonDisabled
                                            ]}
                                            onPress={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            <Text style={[
                                                currentPage === 0 ? styles.paginationTextDisabled : styles.paginationTextActive
                                            ]}>Trước</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.paginationText}>
                                            Trang {currentPage + 1} / {totalPages}
                                        </Text>
                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === totalPages - 1 && styles.paginationButtonDisabled
                                            ]}
                                            onPress={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                        >
                                            <Text style={[
                                                currentPage === totalPages - 1 ? styles.paginationTextDisabled : styles.paginationTextActive
                                            ]}>Sau</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialIcons name="event-busy" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>Không có lịch trình</Text>
                            </View>
                        )}
                    </View>

                    <Modal transparent visible={modalVisible} animationType="fade">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.titleWrapper}>
                                        <MaterialIcons name="event-note" size={24} color="#EF4444" />
                                        <Text style={styles.modalTitle}>Chọn thao tác</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <AntDesign name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.editButton]} 
                                        onPress={onEdit}
                                    >
                                        <AntDesign name="edit" size={20} color="white" />
                                        <Text style={styles.buttonText}>Sửa</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.deleteButton]} 
                                        onPress={onDelete}
                                    >
                                        <AntDesign name="delete" size={20} color="white" />
                                        <Text style={styles.buttonText}>Xóa</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
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
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F8FAFC',
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    createButton: {
        backgroundColor: '#EF4444',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    listContainer: {
        minHeight: 100,
    },
    itemCard: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 8,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    itemTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    priorityBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    priorityText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    editButton: {
        backgroundColor: '#3B82F6',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    paginationButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
    },
    paginationButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    paginationText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    paginationTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    paginationTextDisabled: {
        color: '#9CA3AF',
    },
    creatorBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    creatorText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
});

export default CalendarScreen;

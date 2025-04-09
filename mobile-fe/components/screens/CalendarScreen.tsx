import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import {getSchedulesByDate, getHighlightedDates, deleteSchedule} from '@/hooks/useScheduleApi';
import { useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

// Cấu hình lịch tiếng Việt
LocaleConfig.locales['vi'] = {
    monthNames: [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ],
    dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [highlightedDates, setHighlightedDates] = useState({});
    const today = new Date().toISOString().split('T')[0];
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const router = useRouter();

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

    const fetchSchedules = async (date) => {
        try {
            const data = await getSchedulesByDate(date);
            setSchedules(data);
        } catch (error) {
            console.error('Lỗi khi lấy lịch trình:', error);
        }
    };

    const fetchHighlightedDates = async () => {
        try {
            const data = await getHighlightedDates();
            let formattedDates = {};

            Object.keys(data).forEach(date => {
                const priorityColor = getPriorityColor(data[date]);
                formattedDates[date] = { selected: true, selectedColor: priorityColor };
            });

            console.log(data);
            console.log(formattedDates)

            setHighlightedDates(formattedDates);
        } catch (error) {
            console.error('Lỗi khi lấy ngày highlight:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'red';
            case 'NORMAL': return '#D4AF37';
            case 'LOW': return 'green';
            default: return 'gray';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'HIGH': return 'Cao';
            case 'NORMAL': return 'Bình thường';
            case 'LOW': return 'Thấp';
            default: return 'Không xác định';
        }
    };


    const handleLongPress = (schedule) => {
        setSelectedSchedule(schedule);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;
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
    };

    const onEdit = () => {
        if (!selectedSchedule) return;
        router.push(`/Schedule/editSchedule?id=${selectedSchedule?.id}`)
        setModalVisible(false);
    };

    const onDelete = () => {
        handleDelete();
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return new Date(timeString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
        >
            {/* Lịch */}
            <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={{
                        ...highlightedDates,
                        [selectedDate]: { selected: true, selectedColor: '#FFD966' }
                    }}
                    theme={{ todayTextColor: '#FF5733', selectedDayBackgroundColor: '#FFD966', arrowColor: '#FF5733' }}
                />
            </View>

            {/* Tiêu đề lịch trình */}
            <Text style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>📅 Lịch trình cho {selectedDate || 'hôm nay'}</Text>
                <TouchableOpacity onPress={() => router.push("/Schedule/createSchedule")}>
                    <Ionicons name="add-circle-outline" size={26} color="#FF5733" style={styles.createIcon} />
                </TouchableOpacity>
            </Text>
            <View style={styles.listContainer}>
                {schedules.length > 0 ? (
                    schedules.map((item) => (
                        <TouchableOpacity key={item.id}
                                          onPress={() => router.push(`/Schedule/detailSchedule?id=${item.id}`)}
                                          onLongPress={() => handleLongPress(item)}
                                          style={styles.itemCard}
                        >
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemTime}>
                                {new Date(item.startTime).toLocaleTimeString('vi-VN')} - {new Date(item.endTime).toLocaleTimeString('vi-VN')}
                            </Text>
                            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                {getPriorityLabel(item.priority)}
                            </Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text>Không có lịch trình</Text>
                )}
            </View>

            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn thao tác</Text>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.editButton]} onPress={onEdit}>
                                <Text style={styles.buttonText}>✏️ Sửa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={onDelete}>
                                <Text style={styles.buttonText}>🗑️ Xóa</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>❌ Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#F5F5F5',
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    listContainer: {
        minHeight: 80,
    },
    itemCard: {
        backgroundColor: '#FFD966',
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemTime: {
        fontSize: 14,
        color: '#555',
    },
    priorityText: {
        fontSize: 14,
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    createIcon: {
        marginLeft: 60,
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15, // Bo góc mềm mại
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Đổ bóng trên Android
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 90,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#4CAF50', // Màu xanh lá cho nút "Sửa"
    },
    deleteButton: {
        backgroundColor: '#FF5252', // Màu đỏ cho nút "Xóa"
    },
    cancelButton: {
        backgroundColor: '#757575', // Màu xám cho nút "Hủy"
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CalendarScreen;

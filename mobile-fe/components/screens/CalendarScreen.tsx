import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getSchedulesByDate, getHighlightedDates } from '@/hooks/useScheduleApi';
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
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            fetchHighlightedDates();
            return () => {};
        }, [])
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

    // Danh sách công việc mẫu
    const tasks = [
        { id: '1', title: 'Làm việc', time: '16:00 - 18:30' },
        { id: '2', title: 'Đọc sách', time: '16:00 - 18:30' },
        { id: '3', title: 'Viết báo cáo', time: '10:00 - 12:00' },
        { id: '4', title: 'Gặp khách hàng', time: '14:00 - 15:30' },
        { id: '5', title: 'Nghiên cứu dự án', time: '20:00 - 21:00' },
    ];

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
                <TouchableOpacity onPress={() => router.push("/createSchedule")}>
                    <Ionicons name="add-circle-outline" size={26} color="#FF5733" style={styles.createIcon} />
                </TouchableOpacity>
            </Text>
            <View style={styles.listContainer}>
                {schedules.length > 0 ? (
                    schedules.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemTime}>
                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </Text>
                            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                {item.priority}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text>Không có lịch trình</Text>
                )}
            </View>

            {/* Tiêu đề Công việc */}
            <Text style={styles.sectionTitle}>✅ Công việc cho {selectedDate || 'hôm nay'}</Text>
            <View style={styles.listContainer}>
                {tasks.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemTime}>{item.time}</Text>
                    </View>
                ))}
            </View>
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

});

export default CalendarScreen;

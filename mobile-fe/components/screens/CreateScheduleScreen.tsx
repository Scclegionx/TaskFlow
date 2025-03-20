import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { createSchedule } from '@/hooks/useScheduleApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

const CreateScheduleScreen = () => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [priority, setPriority] = useState('NORMAL');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const priorityMapping = {
        LOW: 'Thấp',
        NORMAL: 'Trung Bình',
        HIGH: 'Cao'
    };

    const mergeDateAndTime = (date: Date, time: Date) => {
        const newDate = new Date(date);
        newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return newDate;
    };

    const convertToLocalISO = (dateObj: Date) => {
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        return new Date(dateObj.getTime() - tzOffset).toISOString();
    };


    const handleCreateSchedule = async () => {
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề!");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
                return;
            }

            const decodedToken: any = jwtDecode(token);
            console.log(decodedToken);
            const userId = decodedToken.id;

            const mergedStartTime = mergeDateAndTime(date, startTime);
            const mergedEndTime = mergeDateAndTime(date, endTime);

            const scheduleData = {
                title,
                startTime: convertToLocalISO(mergedStartTime),
                endTime: convertToLocalISO(mergedEndTime),
                priority,
                user: { id: userId },
            };
            console.log("Đang gửi dữ liệu:", scheduleData);
            await createSchedule(scheduleData);
            Alert.alert("Thành công", "Lịch trình đã được tạo!");
            router.back(); // Quay lại màn hình trước
        } catch (error) {
            console.error("Lỗi tạo lịch trình:", error);
            Alert.alert("Lỗi", "Không thể tạo lịch trình. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📝 Tạo Lịch Trình Mới</Text>

            {/* Tiêu đề lịch trình */}
            <Text style={styles.label}>Tiêu đề</Text>
            <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề..."
                value={title}
                onChangeText={setTitle}
            />

            {/* Chọn ngày */}
            <Text style={styles.label}>Chọn ngày</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
                <Text>{date.toLocaleDateString('vi-VN')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    locale="vi"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}

            {/* Chọn thời gian bắt đầu */}
            <Text style={styles.label}>Thời gian bắt đầu</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
                <Text>{startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </TouchableOpacity>
            {showStartPicker && (
                <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={(event, selectedTime) => {
                        setShowStartPicker(false);
                        if (selectedTime) setStartTime(selectedTime);
                    }}
                />
            )}

            {/* Chọn thời gian kết thúc */}
            <Text style={styles.label}>Thời gian kết thúc</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
                <Text>{endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </TouchableOpacity>
            {showEndPicker && (
                <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={(event, selectedTime) => {
                        setShowEndPicker(false);
                        if (selectedTime) setEndTime(selectedTime);
                    }}
                />
            )}

            {/* Mức độ ưu tiên */}
            <Text style={styles.label}>Mức độ ưu tiên</Text>
            <View style={styles.priorityContainer}>
                {Object.entries(priorityMapping).map(([key, value]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.priorityButton, priority === key && styles.selectedPriority]}
                        onPress={() => setPriority(key)}
                    >
                        <Text style={{ color: priority === key ? 'white' : 'black' }}>
                            {value}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Nút tạo lịch trình */}
            <TouchableOpacity
                style={[styles.createButton, loading && styles.disabledButton]}
                onPress={handleCreateSchedule}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.createButtonText}>Tạo Lịch Trình</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    input: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#DDD',
        alignItems: 'center',
    },
    datePicker: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#DDD',
        alignItems: 'center',
    },
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    priorityButton: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedPriority: {
        backgroundColor: '#FF5733',
    },
    createButton: {
        backgroundColor: '#FF5733',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#888',
    },
});

export default CreateScheduleScreen;

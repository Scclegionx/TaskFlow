import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
    const [content, setContent] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const priorityMapping = {
        LOW: 'Thấp',
        NORMAL: 'Bình thường',
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

            if (mergedStartTime >= mergedEndTime) {
                Alert.alert("Lỗi", "Thời gian bắt đầu phải trước thời gian kết thúc!");
                return;
            }

            const scheduleData = {
                title,
                startTime: convertToLocalISO(mergedStartTime),
                endTime: convertToLocalISO(mergedEndTime),
                priority,
                content,
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
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>📝 Tạo Lịch Trình Mới</Text>
            
            <View style={styles.formContainer}>
                <Text style={styles.label}>Tiêu đề</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tiêu đề..."
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Chọn ngày</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
                    <Text style={styles.dateText}>{date.toLocaleDateString('vi-VN')}</Text>
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

                <Text style={styles.label}>Thời gian bắt đầu</Text>
                <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePicker}>
                    <Text style={styles.dateText}>
                        {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Text>
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

                <Text style={styles.label}>Thời gian kết thúc</Text>
                <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePicker}>
                    <Text style={styles.dateText}>
                        {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Text>
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

                <Text style={styles.label}>Mức độ ưu tiên</Text>
                <View style={styles.priorityContainer}>
                    {Object.entries(priorityMapping).map(([key, value]) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.priorityButton, priority === key && styles.selectedPriority]}
                            onPress={() => setPriority(key)}
                        >
                            <Text style={[styles.priorityText, priority === key && styles.selectedPriorityText]}>
                                {value}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Nội dung</Text>
                <TextInput
                    style={[styles.input, styles.contentInput]}
                    placeholder="Nhập nội dung lịch trình..."
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.createButton, loading && styles.disabledButton]}
                    onPress={handleCreateSchedule}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" />
                            <Text style={styles.loadingText}>Đang tạo lịch trình...</Text>
                        </View>
                    ) : (
                        <Text style={styles.createButtonText}>Tạo Lịch Trình</Text>
                    )}
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#1F2937',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        color: '#374151',
    },
    input: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    datePicker: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#1F2937',
    },
    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 8,
    },
    priorityButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    selectedPriority: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    selectedPriorityText: {
        color: 'white',
    },
    createButton: {
        backgroundColor: '#EF4444',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
        shadowColor: '#9CA3AF',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    contentInput: {
        height: 100,
        textAlignVertical: 'top',
    },
});

export default CreateScheduleScreen;

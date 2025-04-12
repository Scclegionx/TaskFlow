import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from "expo-router";
import { getScheduleById, updateSchedule } from '@/hooks/useScheduleApi';

const EditScheduleScreen = () => {
    const { id } = useLocalSearchParams();
    const scheduleId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [priority, setPriority] = useState('NORMAL');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    const priorityMapping = {
        LOW: 'Thấp',
        NORMAL: 'Bình thường',
        HIGH: 'Cao'
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const data = await getScheduleById(scheduleId);
            setSchedule(data);
            setTitle(data.title);
            setDate(new Date(data.startTime));
            setStartTime(new Date(data.startTime));
            setEndTime(new Date(data.endTime));
            setPriority(data.priority);
        } catch (error) {
            console.error("Lỗi lấy lịch trình:", error);
            Alert.alert("Lỗi", "Không thể lấy dữ liệu lịch trình!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async () => {
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề!");
            return;
        }

        const mergedStartTime = new Date(date);
        mergedStartTime.setHours(startTime.getHours(), startTime.getMinutes());

        const mergedEndTime = new Date(date);
        mergedEndTime.setHours(endTime.getHours(), endTime.getMinutes());

        if (mergedStartTime >= mergedEndTime) {
            Alert.alert("Lỗi", "Thời gian bắt đầu phải trước thời gian kết thúc!");
            return;
        }

        setLoading(true);
        try {
            const updatedData = {
                title,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                priority,
            };
            await updateSchedule(scheduleId, updatedData);
            Alert.alert("Thành công", "Lịch trình đã được cập nhật!");
            router.back();
        } catch (error) {
            console.error("Lỗi cập nhật lịch trình:", error);
            Alert.alert("Lỗi", "Không thể cập nhật lịch trình!");
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
            <Text style={styles.header}>✏️ Chỉnh Sửa Lịch Trình</Text>

            {loading ? <ActivityIndicator size="large" color="#FF5733" /> : (
                <>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Tiêu đề</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                        <Text style={styles.label}>Chọn ngày</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
                            <Text style={styles.dateText}>{date.toLocaleDateString('vi-VN')}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="spinner" locale="vi"
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(false);
                                                if (selectedDate) setDate(selectedDate);
                                            }} />
                        )}

                        <Text style={styles.label}>Thời gian bắt đầu</Text>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
                            <Text>{startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker value={startTime} mode="time" display="spinner" is24Hour
                                            onChange={(event, selectedTime) => {
                                                setShowStartPicker(false);
                                                if (selectedTime) setStartTime(selectedTime);
                                            }} />
                        )}

                        <Text style={styles.label}>Thời gian kết thúc</Text>
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
                            <Text>{endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker value={endTime} mode="time" display="spinner" is24Hour
                                            onChange={(event, selectedTime) => {
                                                setShowEndPicker(false);
                                                if (selectedTime) setEndTime(selectedTime);
                                            }} />
                        )}

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
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdateSchedule}>
                        <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
                    </TouchableOpacity>
                </>
            )}
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
    saveButton: {
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
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
});

export default EditScheduleScreen;

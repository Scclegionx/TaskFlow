import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
        NORMAL: 'Trung Bình',
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
        <View style={styles.container}>
            <Text style={styles.header}>✏️ Chỉnh Sửa Lịch Trình</Text>

            {loading ? <ActivityIndicator size="large" color="#FF5733" /> : (
                <>
                    <Text style={styles.label}>Tiêu đề</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                    <Text style={styles.label}>Chọn ngày</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text>{date.toLocaleDateString('vi-VN')}</Text>
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

                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdateSchedule}>
                        <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
    priorityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    priorityButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', flex: 1, alignItems: 'center', marginHorizontal: 5 },
    selectedPriority: { backgroundColor: '#FF5733' },
    saveButton: { backgroundColor: '#FF5733', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EditScheduleScreen;

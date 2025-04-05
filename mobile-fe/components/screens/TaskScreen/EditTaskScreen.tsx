import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTaskDetail, updateTask } from '@/hooks/useTaskApi';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditTaskScreen = () => {
    const { taskId } = useLocalSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showFromTimePicker, setShowFromTimePicker] = useState(false);
    const [showToTimePicker, setShowToTimePicker] = useState(false);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showLevelPicker, setShowLevelPicker] = useState(false);

    const levelOptions = [
        { label: 'Thấp', value: 1 },
        { label: 'Trung bình', value: 2 },
        { label: 'Cao', value: 3 }
    ];

    const getLevelLabel = (value: number) => {
        return levelOptions.find(option => option.value === value)?.label || 'Thấp';
    };

    useEffect(() => {
        loadTaskDetail();
    }, [taskId]);

    const loadTaskDetail = async () => {
        try {
            const data = await getTaskDetail(Number(taskId));
            setTask(data);
            setTitle(data.title);
            setDescription(data.description);
            setFromDate(new Date(data.fromDate));
            setToDate(new Date(data.toDate));
            setLevel(data.level || 1);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin nhiệm vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề nhiệm vụ');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả nhiệm vụ');
            return;
        }

        if (fromDate > toDate) {
            Alert.alert('Lỗi', 'Thời gian bắt đầu không thể sau thời gian kết thúc');
            return;
        }

        try {
            const updatedTask = {
                id: Number(taskId),
                title: title.trim(),
                description: description.trim(),
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString(),
                level,
                projectId: task.project.id
            };
            await updateTask(updatedTask);
            Alert.alert('Thành công', 'Cập nhật nhiệm vụ thành công', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật nhiệm vụ');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Tiêu đề nhiệm vụ</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề nhiệm vụ"
                />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Nhập mô tả chi tiết"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Thời gian bắt đầu</Text>
                <View style={styles.dateTimeContainer}>
                    <TouchableOpacity 
                        onPress={() => setShowFromDatePicker(true)} 
                        style={styles.datePicker}
                    >
                        <Text>{fromDate.toLocaleDateString('vi-VN')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setShowFromTimePicker(true)} 
                        style={styles.datePicker}
                    >
                        <Text>
                            {fromDate.toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                            })}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Thời gian kết thúc</Text>
                <View style={styles.dateTimeContainer}>
                    <TouchableOpacity 
                        onPress={() => setShowToDatePicker(true)} 
                        style={styles.datePicker}
                    >
                        <Text>{toDate.toLocaleDateString('vi-VN')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setShowToTimePicker(true)} 
                        style={styles.datePicker}
                    >
                        <Text>
                            {toDate.toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                            })}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Mức độ ưu tiên</Text>
                <TouchableOpacity
                    style={styles.levelPicker}
                    onPress={() => setShowLevelPicker(true)}
                >
                    <Text style={styles.levelText}>{getLevelLabel(level)}</Text>
                </TouchableOpacity>

                {showFromDatePicker && (
                    <DateTimePicker
                        value={fromDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            setShowFromDatePicker(false);
                            if (selectedDate) setFromDate(selectedDate);
                        }}
                    />
                )}

                {showFromTimePicker && (
                    <DateTimePicker
                        value={fromDate}
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        onChange={(event, selectedTime) => {
                            setShowFromTimePicker(false);
                            if (selectedTime) setFromDate(selectedTime);
                        }}
                    />
                )}

                {showToDatePicker && (
                    <DateTimePicker
                        value={toDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            setShowToDatePicker(false);
                            if (selectedDate) setToDate(selectedDate);
                        }}
                    />
                )}

                {showToTimePicker && (
                    <DateTimePicker
                        value={toDate}
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        onChange={(event, selectedTime) => {
                            setShowToTimePicker(false);
                            if (selectedTime) setToDate(selectedTime);
                        }}
                    />
                )}

                {/* Modal cho level picker */}
                <Modal
                    visible={showLevelPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn mức độ ưu tiên</Text>
                            {levelOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.levelOption,
                                        level === option.value && styles.selectedLevel
                                    ]}
                                    onPress={() => {
                                        setLevel(option.value);
                                        setShowLevelPicker(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.levelOptionText,
                                        level === option.value && styles.selectedLevelText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowLevelPicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateTask}
                >
                    <Text style={styles.updateButtonText}>Cập nhật</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    formContainer: {
        padding: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    datePicker: {
        flex: 1,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    levelPicker: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
    },
    levelText: {
        fontSize: 16,
        color: '#333',
    },
    updateButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    levelOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedLevel: {
        backgroundColor: '#007AFF',
    },
    levelOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedLevelText: {
        color: 'white',
    },
    closeButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default EditTaskScreen;

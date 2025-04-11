import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SubTask {
    id?: number;
    tempId?: number;
    title: string;
    description: string;
    fromDate: string;
    toDate: string;
    level: number;
}

interface SubTaskEditModalProps {
    visible: boolean;
    subTask: SubTask | null;
    onClose: () => void;
    onSave: (subTask: SubTask) => void;
}

const SubTaskEditModal = ({ visible, subTask, onClose, onSave }: SubTaskEditModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [level, setLevel] = useState(0);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showFromTimePicker, setShowFromTimePicker] = useState(false);
    const [showToTimePicker, setShowToTimePicker] = useState(false);
    const [showLevelPicker, setShowLevelPicker] = useState(false);

    const levelOptions = [
        { label: 'Thấp', value: 0 },
        { label: 'Trung bình', value: 1 },
        { label: 'Cao', value: 2 }
    ];

    const getLevelLabel = (value: number) => {
        return levelOptions.find(option => option.value === value)?.label || 'Thấp';
    };

    useEffect(() => {
        if (subTask) {
            setTitle(subTask.title);
            setDescription(subTask.description);
            setFromDate(new Date(subTask.fromDate));
            setToDate(new Date(subTask.toDate));
            setLevel(subTask.level);
        }
    }, [subTask]);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc con');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc con');
            return;
        }

        if (fromDate > toDate) {
            Alert.alert('Lỗi', 'Thời gian bắt đầu không thể sau thời gian kết thúc');
            return;
        }

        // Format date to YYYY-MM-DDTHH:mm:ss
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        const updatedSubTask: SubTask = {
            id: subTask?.id || undefined,
            tempId: subTask?.tempId || Date.now(),
            title: title.trim(),
            description: description.trim(),
            fromDate: formatDate(fromDate),
            toDate: formatDate(toDate),
            level
        };

        onSave(updatedSubTask);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {subTask ? 'Chỉnh sửa công việc con' : 'Thêm công việc con'}
                    </Text>
                    <ScrollView>
                        <Text style={styles.label}>Tiêu đề</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Nhập tiêu đề công việc con"
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
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.buttonText, styles.saveButtonText]}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#F2F2F2',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    saveButtonText: {
        color: 'white',
    },
});

export default SubTaskEditModal; 
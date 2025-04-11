import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createTask } from '@/hooks/useTaskApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const CreateTaskScreen = () => {
    const router = useRouter();
    const { projectId } = useLocalSearchParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showFromTimePicker, setShowFromTimePicker] = useState(false);
    const [showToTimePicker, setShowToTimePicker] = useState(false);
    const [isFromDatePicker, setIsFromDatePicker] = useState(true);
    const [isToDatePicker, setIsToDatePicker] = useState(true);
    const [isFromTimePickerVisible, setFromTimePickerVisible] = useState(false);
    const [isToTimePickerVisible, setToTimePickerVisible] = useState(false);
    const [level, setLevel] = useState(0);
    const [showLevelPicker, setShowLevelPicker] = useState(false);
    const [showSubTaskForm, setShowSubTaskForm] = useState(false);
    const [subTasks, setSubTasks] = useState<Array<{
        title: string;
        description: string;
        fromDate: Date;
        toDate: Date;
        level: number;
    }>>([]);

    const levelOptions = [
        { label: 'Thấp', value: 0 },
        { label: 'Trung bình', value: 1 },
        { label: 'Cao', value: 2 }
    ];

    const getLevelLabel = (value: number) => {
        return levelOptions.find(option => option.value === value)?.label || 'Thấp';
    };

    const handleAddSubTask = () => {
        setShowSubTaskForm(true);
    };

    const handleSaveSubTask = (subTaskData: {
        title: string;
        description: string;
        fromDate: Date;
        toDate: Date;
        level: number;
    }) => {
        setSubTasks([...subTasks, subTaskData]);
        setShowSubTaskForm(false);
    };

    const handleCreateTask = async () => {
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
            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            const taskData = {
                projectId: Number(projectId),
                title: title.trim(),
                description: description.trim(),
                fromDate: formatDate(fromDate),
                toDate: formatDate(toDate),
                status: 0,
                level: level,
                assignedTo: [],
                subTasks: subTasks.map(subTask => ({
                    ...subTask,
                    fromDate: formatDate(subTask.fromDate),
                    toDate: formatDate(subTask.toDate),
                    status: 0,
                    projectId: Number(projectId)
                }))
            };
            console.log('Task data:', taskData);
            await createTask(taskData);

            Alert.alert('Thành công', 'Đã tạo nhiệm vụ mới', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);
        } catch (error: any) {
            console.error('Error creating task:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tạo nhiệm vụ');
        }
    };

    const showDateTimePicker = (isFrom: boolean, isDate: boolean) => {
        if (isFrom) {
            setIsFromDatePicker(isDate);
            setShowFromDatePicker(true);
        } else {
            setIsToDatePicker(isDate);
            setShowToDatePicker(true);
        }
    };

    const onFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const currentDate = new Date(fromDate);
            if (isFromDatePicker) {
                selectedDate.setHours(currentDate.getHours());
                selectedDate.setMinutes(currentDate.getMinutes());
            } else {
                selectedDate.setFullYear(currentDate.getFullYear());
                selectedDate.setMonth(currentDate.getMonth());
                selectedDate.setDate(currentDate.getDate());
            }
            setFromDate(selectedDate);
        }
    };

    const onToDateChange = (event: any, selectedDate?: Date) => {
        setShowToDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const currentDate = new Date(toDate);
            if (isToDatePicker) {
                selectedDate.setHours(currentDate.getHours());
                selectedDate.setMinutes(currentDate.getMinutes());
            } else {
                selectedDate.setFullYear(currentDate.getFullYear());
                selectedDate.setMonth(currentDate.getMonth());
                selectedDate.setDate(currentDate.getDate());
            }
            setToDate(selectedDate);
        }
    };

    const formatDateTime = (date: Date) => {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const showTimePicker = (isFrom: boolean) => {
        if (isFrom) {
            setFromTimePickerVisible(true);
        } else {
            setToTimePickerVisible(true);
        }
    };

    const hideTimePicker = (isFrom: boolean) => {
        if (isFrom) {
            setFromTimePickerVisible(false);
        } else {
            setToTimePickerVisible(false);
        }
    };

    const handleTimeConfirm = (isFrom: boolean, date: Date) => {
        if (isFrom) {
            const newDate = new Date(fromDate);
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
            setFromDate(newDate);
            setFromTimePickerVisible(false);
        } else {
            const newDate = new Date(toDate);
            newDate.setHours(date.getHours());
            newDate.setMinutes(date.getMinutes());
            setToDate(newDate);
            setToTimePickerVisible(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Tiêu đề công việc</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề công việc"
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

                <Text style={styles.label}>Mức độ ưu tiên</Text>
                <TouchableOpacity
                    style={styles.levelPicker}
                    onPress={() => setShowLevelPicker(true)}
                >
                    <Text style={styles.levelText}>{getLevelLabel(level)}</Text>
                </TouchableOpacity>

                <Modal
                    visible={showLevelPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn mức độ ưu tiên</Text>
                            <FlatList
                                data={levelOptions}
                                keyExtractor={(item) => item.value.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.levelOption,
                                            level === item.value && styles.selectedLevel
                                        ]}
                                        onPress={() => {
                                            setLevel(item.value);
                                            setShowLevelPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.levelOptionText,
                                            level === item.value && styles.selectedLevelText
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowLevelPicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.subTasksSection}>
                    <Text style={styles.sectionTitle}>Công việc con</Text>
                    
                    {subTasks.map((subTask, index) => (
                        <View key={index} style={styles.subTaskItem}>
                            <Text style={styles.subTaskTitle}>{subTask.title}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    const newSubTasks = [...subTasks];
                                    newSubTasks.splice(index, 1);
                                    setSubTasks(newSubTasks);
                                }}
                                style={styles.removeSubTaskButton}
                            >
                                <Text style={styles.removeSubTaskText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addSubTaskButton}
                        onPress={handleAddSubTask}
                    >
                        <Text style={styles.addSubTaskText}>+ Thêm công việc con</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.createButton}
                    onPress={handleCreateTask}
                >
                    <Text style={styles.createButtonText}>Tạo nhiệm vụ</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showSubTaskForm}
                transparent={true}
                animationType="slide"
            >
                <SubTaskForm
                    onSave={handleSaveSubTask}
                    onClose={() => setShowSubTaskForm(false)}
                />
            </Modal>
        </ScrollView>
    );
};

interface SubTaskFormProps {
    onSave: (subTaskData: {
        title: string;
        description: string;
        fromDate: Date;
        toDate: Date;
        level: number;
    }) => void;
    onClose: () => void;
}

const SubTaskForm = ({ onSave, onClose }: SubTaskFormProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [level, setLevel] = useState(0);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showFromTimePicker, setShowFromTimePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
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

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (fromDate > toDate) {
            Alert.alert('Lỗi', 'Thời gian bắt đầu không thể sau thời gian kết thúc');
            return;
        }

        onSave({
            title: title.trim(),
            description: description.trim(),
            fromDate,
            toDate,
            level
        });
    };

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm công việc con</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Tiêu đề"
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Mô tả"
                    value={description}
                    onChangeText={setDescription}
                    multiline
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

                <Text style={styles.label}>Mức độ ưu tiên</Text>
                <TouchableOpacity
                    style={styles.levelPicker}
                    onPress={() => setShowLevelPicker(true)}
                >
                    <Text style={styles.levelText}>{getLevelLabel(level)}</Text>
                </TouchableOpacity>

                <Modal
                    visible={showLevelPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chọn mức độ ưu tiên</Text>
                            <FlatList
                                data={levelOptions}
                                keyExtractor={(item) => item.value.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.levelOption,
                                            level === item.value && styles.selectedLevel
                                        ]}
                                        onPress={() => {
                                            setLevel(item.value);
                                            setShowLevelPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.levelOptionText,
                                            level === item.value && styles.selectedLevelText
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowLevelPicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.modalButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={handleSave}
                    >
                        <Text style={styles.modalButtonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
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
    createButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    levelPicker: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    levelText: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    levelOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedLevel: {
        backgroundColor: '#007BFF',
    },
    levelOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedLevelText: {
        color: 'white',
    },
    closeButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    subTasksSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subTaskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    subTaskTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    removeSubTaskButton: {
        padding: 5,
    },
    removeSubTaskText: {
        fontSize: 20,
        color: '#FF4444',
    },
    addSubTaskButton: {
        backgroundColor: '#E8F4FF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addSubTaskText: {
        color: '#007BFF',
        fontSize: 16,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FF4444',
    },
    saveButton: {
        backgroundColor: '#007BFF',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateTaskScreen;

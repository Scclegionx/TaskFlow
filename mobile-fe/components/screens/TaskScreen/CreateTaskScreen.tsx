import React, { useState } from "react";
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
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createTask } from "@/hooks/useTaskApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "@/constants/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
const CreateTaskScreen = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
  const [documents, setDocuments] = useState([]);
  const [subTasks, setSubTasks] = useState<
    Array<{
      title: string;
      description: string;
      fromDate: Date;
      toDate: Date;
      level: number;
    }>
  >([]);

  const levelOptions = [
    { label: "Thấp", value: 0 },
    { label: "Trung bình", value: 1 },
    { label: "Cao", value: 2 },
  ];
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Chấp nhận tất cả các loại tệp
        copyToCacheDirectory: true,
      });

      console.log("Document Picker Result:", result);

      // Kiểm tra nếu người dùng không hủy và có tài liệu được chọn
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0]; // Lấy tệp đầu tiên từ danh sách
        console.log("Selected file:", selectedFile);
        setDocuments((prev) => [...prev, selectedFile]); // Lưu tệp đã chọn vào state
      } else if (result.canceled) {
        console.log("User canceled file picker");
      } else {
        console.error("Unexpected result from DocumentPicker:", result);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Lỗi", "Không thể chọn tài liệu. Vui lòng thử lại.");
    }
  };
  const handleUploadDocuments = async (taskId) => {
    if (!taskId || isNaN(taskId)) {
      console.error("Invalid taskId:", taskId);
      Alert.alert("Lỗi", "Không thể tải tài liệu vì taskId không hợp lệ.");
      return;
    }
    try {
      console.log("Danh sách tài liệu trước khi tải lên:", documents);

      const formData = new FormData();

      for (const doc of documents) {
        const fileUri = doc.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        formData.append("files", {
          uri: fileUri,
          type: doc.mimeType || "application/octet-stream",
          name: doc.name || fileInfo.uri.split("/").pop(),
        });
      }

      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/document/upload/task/${taskId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Tài liệu đã tải lên:", response.data);
      Alert.alert("Thành công", "Tài liệu đã được tải lên.");
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
      Alert.alert("Lỗi", "Không thể tải tài liệu. Vui lòng thử lại.");
    }
  };

  const getLevelLabel = (value: number) => {
    return (
      levelOptions.find((option) => option.value === value)?.label || "Thấp"
    );
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
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề nhiệm vụ");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả nhiệm vụ");
      return;
    }

    if (fromDate > toDate) {
      Alert.alert("Lỗi", "Thời gian bắt đầu không thể sau thời gian kết thúc");
      return;
    }

    try {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
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
        subTasks: subTasks.map((subTask) => ({
          ...subTask,
          fromDate: formatDate(subTask.fromDate),
          toDate: formatDate(subTask.toDate),
          status: 0,
          projectId: Number(projectId),
        })),
      };

      const createdTask = await createTask(taskData);
      console.log("Nhiệm vụ đã được tạo:", createdTask);
      await handleUploadDocuments(createdTask);

      Alert.alert("Thành công", "Đã tạo nhiệm vụ mới", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating task:", error);
      Alert.alert("Lỗi", error.message || "Không thể tạo nhiệm vụ");
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
    setShowFromDatePicker(Platform.OS === "ios");
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
    setShowToDatePicker(Platform.OS === "ios");
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
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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
            <View style={styles.formWrapper}>
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
                <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>

          {documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newDocuments = [...documents];
                  newDocuments.splice(index, 1);
                  setDocuments(newDocuments);
                  console.log("Tài liệu sau khi xóa:", newDocuments);
                }}
                style={styles.removeDocumentButton}
              >
                <Text style={styles.removeDocumentText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addDocumentButton}
            onPress={handlePickDocument}
          >
            <Text style={styles.addDocumentText}>+ Thêm tài liệu</Text>
          </TouchableOpacity>
        </View>

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
            </View>

      <Modal visible={showSubTaskForm} transparent={true} animationType="slide">
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [level, setLevel] = useState(0);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const levelOptions = [
    { label: "Thấp", value: 0 },
    { label: "Trung bình", value: 1 },
    { label: "Cao", value: 2 },
  ];

  const getLevelLabel = (value: number) => {
    return (
      levelOptions.find((option) => option.value === value)?.label || "Thấp"
    );
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (fromDate > toDate) {
      Alert.alert("Lỗi", "Thời gian bắt đầu không thể sau thời gian kết thúc");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      fromDate,
      toDate,
      level,
    });
  };

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm công việc con</Text>
                <ScrollView style={styles.modalScrollView}>
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

                    <Text style={styles.label}>Mức độ ưu tiên</Text>
                    <TouchableOpacity
                        style={styles.levelPicker}
                        onPress={() => setShowLevelPicker(true)}
                    >
                        <Text style={styles.levelText}>{getLevelLabel(level)}</Text>
                    </TouchableOpacity>
                </ScrollView>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    formWrapper: {
        flex: 1,
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    formContainer: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 8,
        color: '#374151',
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 15,
        fontSize: 16,
        color: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    datePicker: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    createButton: {
        backgroundColor: '#8B5CF6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 30,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    levelPicker: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    levelText: {
        fontSize: 16,
        color: '#1F2937',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 25,
        width: '85%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    modalScrollView: {
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    levelOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        borderRadius: 8,
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
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    subTasksSection: {
        marginTop: 25,
        marginBottom: 25,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F2937',
    },
    subTaskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    subTaskTitle: {
        fontSize: 16,
        color: '#1F2937',
        flex: 1,
    },
    removeSubTaskButton: {
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    removeSubTaskText: {
        fontSize: 20,
        color: '#EF4444',
    },
    addSubTaskButton: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    addSubTaskText: {
        color: '#8B5CF6',
        fontSize: 16,
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cancelButton: {
        backgroundColor: '#F2F2F2',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    saveButtonText: {
        color: 'white',
    },
    documentsSection: {
        marginTop: 25,
        marginBottom: 25,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      documentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      documentName: {
        fontSize: 16,
        color: "#333",
        flex: 1,
      },
      removeDocumentButton: {
        padding: 8,
        backgroundColor: "#FFF0F0",
        borderRadius: 20,
        shadowColor: "#FF4444",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      },
      removeDocumentText: {
        fontSize: 20,
        color: "#FF4444",
      },
      addDocumentButton: {
        backgroundColor: "#E8F4FF",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
      addDocumentText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "500",
      },
});

export default CreateTaskScreen;

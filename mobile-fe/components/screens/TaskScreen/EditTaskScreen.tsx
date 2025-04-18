import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import {
  getTaskDetail,
  updateTask,
  getSubTasks,
  getDocumentsByTaskId,
  deleteDocument,
  assignTask,
  unassignTask,
} from "@/hooks/useTaskApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AntDesign } from "@expo/vector-icons";
import SubTaskEditModal from "./SubTaskEditModal";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "@/constants/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProjectMembers } from "@/hooks/useProjectApi";

interface SubTask {
  id?: number;
  tempId?: number;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  level: number;
  assignees?: {
    id: number;
    name: string;
    avatar: string;
  }[];
  status?: string | number;
}

const EditTaskScreen = () => {
  const { taskId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [task, setTask] = useState<any>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false); // Trạng thái upload
  const [uploadMessage, setUploadMessage] = useState(""); // Thông báo upload
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubTaskId, setSelectedSubTaskId] = useState<number | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [assigneeSearchText, setAssigneeSearchText] = useState("");
  const [showViewAssigneesModal, setShowViewAssigneesModal] = useState(false);
  const [selectedSubTaskForView, setSelectedSubTaskForView] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("");
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

  useEffect(() => {
    navigation.setOptions({ title: "Chỉnh sửa công việc" });
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
      setLevel(data.level || 0);

      // Load subtasks
      const subTasksData = await getSubTasks(Number(taskId));
      setSubTasks(subTasksData);

      // Load documents
      const documentsData = await getDocumentsByTaskId(Number(taskId));
      setDocuments(documentsData);
      
      // Load project members and get user role
      if (data.project && data.project.id) {
        try {
          const members = await getProjectMembers(data.project.id);
          setProjectMembers(members);
          
          // Get current user role after loading members
          const userId = await AsyncStorage.getItem("userId");
          if (userId) {
            const currentMember = members.find(
              (m: any) => m.id === Number(userId)
            );
            if (currentMember) {
              setUserRole(currentMember.role);
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải danh sách thành viên:", error);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
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
      // Tạo chuỗi thời gian theo định dạng YYYY-MM-DDTHH:mm:ss
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const updatedTask = {
        id: Number(taskId),
        title: title.trim(),
        description: description.trim(),
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        level,
        projectId: task.project.id,
        subTasks: subTasks.map((subTask) => ({
          id: subTask.id || null,
          title: subTask.title,
          description: subTask.description,
          fromDate: subTask.fromDate,
          toDate: subTask.toDate,
          level: subTask.level,
        })),
      };
      await handleUploadDocuments(Number(taskId));
      await updateTask(updatedTask);
      // Tải lên tài liệu sau khi cập nhật nhiệm vụ
      Alert.alert("Thành công", "Cập nhật nhiệm vụ thành công", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật nhiệm vụ");
    }
  };
  const handleDeleteDocument = async (
    documentId: number | undefined,
    isLocal: boolean
  ) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa tài liệu này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              if (isLocal) {
                // Nếu tài liệu được thêm từ handlePickDocument, chỉ xóa khỏi state
                setDocuments((prev) =>
                  prev.filter((doc) => doc.id !== documentId)
                );
                Alert.alert(
                  "Thành công",
                  "Tài liệu đã được xóa khỏi danh sách."
                );
              } else {
                // Nếu tài liệu đã được tải lên server, gọi API để xóa
                await deleteDocument(documentId!, Number(taskId));
                setDocuments((prev) =>
                  prev.filter((doc) => doc.id !== documentId)
                );
                Alert.alert("Thành công", "Tài liệu đã được xóa thành công.");
              }
            } catch (error) {
              console.error("Lỗi khi xóa tài liệu:", error);
              Alert.alert("Lỗi", "Không thể xóa tài liệu. Vui lòng thử lại.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const getFileNameFromPath = (path: string) => {
    return path.substring(path.lastIndexOf("/") + 1);
  };
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
  const handleUploadDocuments = async (taskId: number) => {
    if (!taskId || isNaN(taskId)) {
      console.error("Invalid taskId:", taskId);
      Alert.alert("Lỗi", "Không thể tải tài liệu vì taskId không hợp lệ.");
      return;
    }

    try {
      console.log("Danh sách tài liệu trước khi tải lên:", documents);

      const formData = new FormData();

      // Lọc các tài liệu mới (không có id)
      const newDocuments = documents.filter((doc) => !doc.id);

      if (newDocuments.length === 0) {
        console.log("Không có tài liệu mới để tải lên.");
        return;
      }

      setIsUploading(true); // Bắt đầu upload
      setUploadMessage("Đang tải tài liệu...");

      for (const doc of newDocuments) {
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

      // Cập nhật danh sách tài liệu với các tài liệu đã được tải lên từ server
      setDocuments((prev) => [
        ...prev.filter((doc) => doc.id), // Giữ lại các tài liệu cũ
        ...response.data, // Thêm các tài liệu mới từ server
      ]);

      setUploadMessage("Tải tài liệu thành công!");
      setTimeout(() => setUploadMessage(""), 3000); // Ẩn thông báo sau 3 giây
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
      setUploadMessage("Lỗi khi tải tài liệu. Vui lòng thử lại.");
      setTimeout(() => setUploadMessage(""), 3000); // Ẩn thông báo sau 3 giây
    } finally {
      setIsUploading(false); // Kết thúc upload
    }
  };
  const handleAddSubTask = () => {
    setEditingSubTask(null);
    setShowSubTaskModal(true);
  };

  const handleSaveSubTask = (updatedSubTask: SubTask) => {
    console.log("Saving subtask:", updatedSubTask);
    if (editingSubTask?.id) {
      // Cập nhật subtask hiện có
      setSubTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedSubTask.id ? updatedSubTask : task
        )
      );
    } else {
      // Thêm subtask mới
      setSubTasks((prevTasks) => [...prevTasks, updatedSubTask]);
    }
    setShowSubTaskModal(false);
    setEditingSubTask(null);
  };

  const handleEditSubTask = (subTask: SubTask) => {
    setEditingSubTask(subTask);
    setShowSubTaskModal(true);
  };

  const handleShowAssignModal = (subTaskId: number) => {
    setSelectedSubTaskId(subTaskId);
    setShowAssignModal(true);
  };

  const handleShowViewAssigneesModal = (subTaskId: number) => {
    setSelectedSubTaskForView(subTaskId);
    setShowViewAssigneesModal(true);
  };

  const handleAssignSubTask = async (userId: number) => {
    if (!selectedSubTaskId) return;

    try {
      const subTask = subTasks.find(t => t.id === selectedSubTaskId);
      const isAssigned = subTask?.assignees?.some(a => a.id === userId);

      if (isAssigned) {
        // Nếu đã được gán thì gỡ gán
        await unassignTask(selectedSubTaskId, userId);
      } else {
        // Nếu chưa được gán thì gán mới
        await assignTask(selectedSubTaskId, userId);
      }
      
      // Cập nhật lại danh sách subtasks
      const subTasksData = await getSubTasks(Number(taskId));
      setSubTasks(subTasksData);
      
      setShowAssignModal(false);
      setSelectedSubTaskId(null);
      Alert.alert("Thành công", isAssigned ? "Đã gỡ gán nhiệm vụ con" : "Đã gán nhiệm vụ con cho thành viên");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể thực hiện thao tác");
    }
  };

  const filteredAssignees = useMemo(() => {
    if (!assigneeSearchText.trim()) {
      return projectMembers.filter(member => member.role !== "ADMIN");
    }
    return projectMembers.filter(
      member => 
        member.role !== "ADMIN" && 
        (member.name.toLowerCase().includes(assigneeSearchText.toLowerCase()) || 
         member.email.toLowerCase().includes(assigneeSearchText.toLowerCase()))
    );
  }, [projectMembers, assigneeSearchText]);

  const getTaskStatusText = (status: string | number): string => {
    // Chuyển status về dạng số để so sánh
    const statusNumber = Number(status);
    switch (statusNumber) {
      case 0:
        return "Chưa được giao";
      case 1:
        return "Đang xử lý";
      case 2:
        return "Hoàn thành";
      case 3:
        return "Từ chối";
      case 4:
        return "Quá hạn";
      default:
        return "Không xác định";
    }
  };

  const getTaskStatusColor = (status: string | number): string => {
    const statusNumber = Number(status);
    switch (statusNumber) {
      case 0:
        return "#A0A0A0"; // Màu xám cho chưa được giao
      case 1:
        return "#00AEEF"; // Màu xanh dương cho đang xử lý
      case 2:
        return "#4CAF50"; // Màu xanh lá cho hoàn thành
      case 3:
        return "#FF4D67"; // Màu đỏ cho từ chối
      case 4:
        return "#FF9800"; // Màu cam cho quá hạn
      default:
        return "#A0A0A0";
    }
  };

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0:
        return "#4CAF50"; // Màu xanh lá cho mức độ thấp
      case 1:
        return "#FFC107"; // Màu vàng cho mức độ trung bình
      case 2:
        return "#FF4D67"; // Màu đỏ cho mức độ cao
      default:
        return "#4CAF50";
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
      <View style={styles.formWrapper}>
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
              <Text>{fromDate.toLocaleDateString("vi-VN")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFromTimePicker(true)}
              style={styles.datePicker}
            >
              <Text>
                {fromDate.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
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
              <Text>{toDate.toLocaleDateString("vi-VN")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowToTimePicker(true)}
              style={styles.datePicker}
            >
              <Text>
                {toDate.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
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

          <View style={styles.documentsSection}>
            <Text style={styles.label}>Tài liệu đính kèm</Text>

            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text style={styles.documentName}>
                    {doc.name ? doc.name : getFileNameFromPath(doc.pathFile)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument(doc.id, !doc.id)}
                  >
                    <AntDesign name="delete" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noDocumentsText}>Không có tài liệu nào</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addDocumentButton}
            onPress={handlePickDocument}
          >
            <Text style={styles.addDocumentText}>+ Thêm tài liệu</Text>
          </TouchableOpacity>
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.uploadingText}>{uploadMessage}</Text>
            </View>
          )}

          <View style={styles.subTasksSection}>
            <View style={styles.subTasksHeader}>
              <Text style={styles.label}>Công việc con</Text>
              <TouchableOpacity
                style={styles.addSubTaskButton}
                onPress={handleAddSubTask}
              >
                <AntDesign name="plus" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {subTasks.map((subTask) => (
              <TouchableOpacity
                key={subTask.tempId || subTask.id}
                style={[
                  styles.subTaskItem,
                  { borderColor: getTaskStatusColor(subTask.status || 0) }
                ]}
                onPress={() => handleEditSubTask(subTask)}
              >
                <View style={styles.subTaskInfo}>
                  <Text style={styles.subTaskTitle}>{subTask.title}</Text>
                  <Text style={styles.subTaskDescription}>
                    {subTask.description}
                  </Text>
                  <Text style={styles.subTaskDate}>
                    Hạn chót: {new Date(subTask.toDate).toLocaleString("vi-VN", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[
                    styles.subTaskLevel,
                    { color: getLevelColor(subTask.level) }
                  ]}>
                    Mức độ: {getLevelLabel(subTask.level)}
                  </Text>
                  <Text style={[
                    styles.subTaskStatus,
                    { color: getTaskStatusColor(subTask.status || 0) }
                  ]}>
                    {getTaskStatusText(subTask.status || 0)}
                  </Text>
                  
                  {/* Hiển thị người được gán */}
                  <View style={styles.assigneeContainer}>
                    {subTask.assignees && subTask.assignees.length > 0 ? (
                      <View style={styles.assignedMembers}>
                        <TouchableOpacity 
                          onPress={(e) => {
                            e.stopPropagation();
                            if (userRole === "ADMIN") {
                              handleShowAssignModal(subTask.id!);
                            } else {
                              handleShowViewAssigneesModal(subTask.id!);
                            }
                          }}
                        >
                          <Image
                            source={
                              subTask.assignees[0].avatar
                                ? { uri: subTask.assignees[0].avatar }
                                : require("../../../assets/images/default-avatar.jpg")
                            }
                            style={styles.assigneeAvatar}
                          />
                          {subTask.assignees.length > 1 && (
                            <View style={styles.assigneeCount}>
                              <Text style={styles.assigneeCountText}>+{subTask.assignees.length - 1}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : userRole === "ADMIN" ? (
                      <TouchableOpacity
                        style={[styles.assignButton, { position: 'absolute', right: 10, bottom: 10 }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleShowAssignModal(subTask.id!);
                        }}
                      >
                        <AntDesign name="adduser" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noAssigneeText}>
                        Chưa có người được gán
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    setSubTasks((prevTasks) =>
                      prevTasks.filter(
                        (task) =>
                          (task.tempId || task.id) !==
                          (subTask.tempId || subTask.id)
                      )
                    );
                  }}
                >
                  <AntDesign name="close" size={20} color="#FF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
                      level === option.value && styles.selectedLevel,
                    ]}
                    onPress={() => {
                      setLevel(option.value);
                      setShowLevelPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.levelOptionText,
                        level === option.value && styles.selectedLevelText,
                      ]}
                    >
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

          <SubTaskEditModal
            visible={showSubTaskModal}
            subTask={editingSubTask}
            onClose={() => {
              setShowSubTaskModal(false);
              setEditingSubTask(null);
            }}
            onSave={handleSaveSubTask}
          />

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateTask}
          >
            <Text style={styles.updateButtonText}>Cập nhật</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Modal Assign SubTask */}
      <Modal
        visible={showAssignModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn thành viên</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm thành viên..."
                value={assigneeSearchText}
                onChangeText={setAssigneeSearchText}
              />
            </View>
            
            <FlatList
              data={filteredAssignees}
              keyExtractor={(member) => member.id.toString()}
              renderItem={({ item }) => {
                const subTask = subTasks.find(t => t.id === selectedSubTaskId);
                const isAssigned = subTask?.assignees?.some(a => a.id === item.id);
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.memberOption,
                      isAssigned && styles.memberOptionSelected
                    ]}
                    onPress={() => handleAssignSubTask(item.id)}
                  >
                    <View style={styles.memberOptionContent}>
                      <Image
                        source={
                          item.avatar
                            ? { uri: item.avatar }
                            : require("../../../assets/images/default-avatar.jpg")
                        }
                        style={styles.memberOptionAvatar}
                      />
                      <Text style={[
                        styles.memberOptionText,
                        isAssigned && styles.memberOptionTextSelected
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                    {isAssigned && (
                      <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAssignModal(false);
                setSelectedSubTaskId(null);
                setAssigneeSearchText("");
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal View Assignees */}
      <Modal
        visible={showViewAssigneesModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Danh sách người được gán</Text>
            <FlatList
              data={subTasks.find(t => t.id === selectedSubTaskForView)?.assignees || []}
              keyExtractor={(assignee) => assignee.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.memberOption}>
                  <View style={styles.memberOptionContent}>
                    <Image
                      source={
                        item.avatar
                          ? { uri: item.avatar }
                          : require("../../../assets/images/default-avatar.jpg")
                      }
                      style={styles.memberOptionAvatar}
                    />
                    <Text style={styles.memberOptionText}>{item.name}</Text>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowViewAssigneesModal(false);
                setSelectedSubTaskForView(null);
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  formWrapper: {
    flex: 1,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
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
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 15,
    fontSize: 16,
    color: "#1F2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  datePicker: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButton: {
    backgroundColor: "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 30,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  levelPicker: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelText: {
    fontSize: 16,
    color: "#1F2937",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 25,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1F2937",
  },
  levelOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    borderRadius: 8,
  },
  selectedLevel: {
    backgroundColor: "#8B5CF6",
  },
  levelOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  selectedLevelText: {
    color: "white",
  },
  closeButton: {
    backgroundColor: "#8B5CF6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  subTasksSection: {
    marginTop: 25,
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subTasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addSubTaskButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#E8F4FF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  subTaskItem: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderLeftWidth: 15,
  },
  subTaskInfo: {
    flex: 1,
  },
  subTaskTitle: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    paddingRight: 24,
  },
  subTaskDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  subTaskDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  subTaskLevel: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  subTaskStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
  },
  assignedMembers: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  assigneeCount: {
    position: "absolute",
    right: -8,
    bottom: -8,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  assigneeCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  assignButton: {
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  deleteButton: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  noAssigneeText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
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
  downloadButton: {
    padding: 8,
    backgroundColor: "#E8F4FF",
    borderRadius: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  noDocumentsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
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
  uploadingOverlay: {
    position: "absolute",
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  uploadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
  },
  memberOptionSelected: {
    backgroundColor: "#E8F4FF",
  },
  memberOptionTextSelected: {
    fontWeight: "bold",
  },
  memberOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export default EditTaskScreen;

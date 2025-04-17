import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  Animated,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  getProjectById,
  getStatusText,
  searchUserByEmail,
  addProjectMember,
  removeProjectMember,
  formatDateTime,
  searchProjectMembers,
  searchProjectTasks,
} from "@/hooks/useProjectApi";
import { AntDesign } from "@expo/vector-icons";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createTask,
  deleteTask,
  assignTask,
  getMainTasks,
} from "@/hooks/useTaskApi";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";

interface ItemProject {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  status: number;
  fromDate?: string | null;
  toDate?: string | null;
  members: IMember[];
  tasks: ITask[];
}

interface IMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface ITask {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  toDate: string;
  assignees: {
    id: number;
    name: string;
    avatar: string;
  }[];
  parentId: number;
}

interface RouteParams {
  project: string;
}

const getStatusColor = (status: number): string => {
  switch (status) {
    case 0: // Chưa bắt đầu
      return "#A0A0A0";
    case 1: // Đang thực hiện
      return "#00AEEF";
    case 2: // Hoàn thành
      return "#4CAF50";
    case 3: // Quá hạn
      return "#FF4D67";
    default:
      return "#A0A0A0";
  }
};

// Hàm chuyển đổi role từ tiếng Anh sang tiếng Việt
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "MEMBER":
      return "Thành viên";
    default:
      return role;
  }
};

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
      return "#FF4D67"; // Màu đỏ cho quá hạn
    default:
      return "#A0A0A0";
  }
};

const getDefaultAvatar = () => {
  return require("../../assets/images/default-avatar.jpg");
};

export default function ProjectDetail() {
  const route = useRoute();
  const router = useRouter();
  const [ItemProject, setItemProject] = useState<ItemProject>();
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const projectData = route.params as RouteParams;
  const project = projectData?.project ? JSON.parse(projectData.project) : null;
  const [userRole, setUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [memberPage, setMemberPage] = useState(0);
  const [taskPage, setTaskPage] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [memberSearchText, setMemberSearchText] = useState("");
  const [taskSearchText, setTaskSearchText] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [taskSearchResults, setTaskSearchResults] = useState<any[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [showTaskSearch, setShowTaskSearch] = useState(false);
  const [allTasks, setAllTasks] = useState<ITask[]>([]); // Lưu toàn bộ công việc
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadProjects();
      getCurrentUserAndRole();
    }, [])
  );

  const getCurrentUserAndRole = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        setCurrentUserId(Number(userId));
        if (ItemProject?.members) {
          const currentMember = ItemProject.members.find(
            (m) => m.id === Number(userId)
          );
          if (currentMember) {
            console.log("Current user role:", currentMember.role);
            setUserRole(currentMember.role);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: "Chi tiết dự án" });
    if (ItemProject && currentUserId) {
      const currentMember = ItemProject.members.find(
        (m) => m.id === currentUserId
      );
      if (currentMember) {
        console.log("Current user role:", currentMember.role);
        setUserRole(currentMember.role);
      }
    }
  }, [ItemProject, currentUserId]);

  const loadProjects = async () => {
    try {
      const data = await getProjectById(project.id, memberPage, 3, taskPage, 5);
      console.log("data", data);
      setTotalMembers(data.totalMembers);
      setTotalTasks(data.totalTasks);
      setItemProject(data);

      // Nếu đây là lần đầu tiên, tải toàn bộ công việc
      if (allTasks.length === 0) {
        let allTasksTemp: ITask[] = [];
        let currentPage = 0;
        const tasksPerPage = 5;

        while (currentPage * tasksPerPage < data.totalTasks) {
          const pageData = await getProjectById(
            project.id,
            0,
            0,
            currentPage,
            tasksPerPage
          );
          allTasksTemp = [...allTasksTemp, ...pageData.tasks];
          currentPage++;
        }

        setAllTasks(allTasksTemp); // Lưu toàn bộ công việc
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dự án:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [memberPage, taskPage]);

  const debouncedSearch = debounce(async (email: string) => {
    if (email.length > 0) {
      try {
        const users = await searchUserByEmail(email);
        setSearchResults(users);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, 500);

  const handleAddMember = async (userId: number) => {
    try {
      await addProjectMember(project.id, userId);
      await loadProjects();
      setShowAddMember(false);
      setSearchEmail("");
      Alert.alert("Thành công", "Đã thêm thành viên vào dự án");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm thành viên");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await removeProjectMember(project.id, memberId);
              await loadProjects();
              Alert.alert("Thành công", "Đã xóa thành viên khỏi dự án");
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa thành viên");
            }
          },
        },
      ]
    );
  };

  const handleRemoveTask = async (taskId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa nhiệm vụ này không?",
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
              await deleteTask(taskId);
              await loadProjects();
              Alert.alert("Thành công", "Đã xóa nhiệm vụ");
            } catch (error: any) {
              Alert.alert("Lỗi", error.message || "Không thể xóa nhiệm vụ");
            }
          },
        },
      ]
    );
  };

  const handleShowAssignModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    setShowAssignModal(true);
  };

  const handleAssignTask = async (userId: number) => {
    if (!selectedTaskId) return;

    try {
      await assignTask(selectedTaskId, userId);
      await loadProjects();
      setShowAssignModal(false);
      setSelectedTaskId(null);
      Alert.alert("Thành công", "Đã gán nhiệm vụ cho thành viên");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gán nhiệm vụ");
    }
  };

  const handleTaskPress = (taskId: number) => {
    if (userRole === "ADMIN") {
      router.push({
        pathname: "/Task/editTask",
        params: { taskId: taskId },
      });
    } else if (userRole === "MEMBER") {
      router.push({
        pathname: "/Task/taskDetail",
        params: { taskId: taskId },
      });
    }
  };

  const debouncedSearchMembers = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setMemberSearchResults([]);
        return;
      }
      try {
        const results = await searchProjectMembers(project.id, text);
        console.log("results", results);
        setMemberSearchResults(results);
      } catch (error) {
        console.error("Lỗi tìm kiếm thành viên:", error);
        setMemberSearchResults([]);
      }
    }, 300),
    [project.id]
  );

  const debouncedSearchTasks = useCallback(
    debounce(async (text: string) => {
      if (!text.trim()) {
        setTaskSearchResults([]);
        return;
      }
      try {
        const results = await searchProjectTasks(project.id, text);
        setTaskSearchResults(results);
      } catch (error) {
        console.error("Lỗi tìm kiếm công việc:", error);
        setTaskSearchResults([]);
      }
    }, 300),
    [project.id]
  );

  const handleMemberSearch = (text: string) => {
    setMemberSearchText(text);
    setShowMemberSearch(true);
    debouncedSearchMembers(text);
  };

  const handleTaskSearch = (text: string) => {
    setTaskSearchText(text);
    setShowTaskSearch(true);
    debouncedSearchTasks(text);
  };

  const handleSelectMember = (member: any) => {
    setMemberSearchText(member.fullName);
    setShowMemberSearch(false);
  };

  const handleSelectTask = (task: any) => {
    setTaskSearchText(task.title);
    setShowTaskSearch(false);
  };
  const taskStatusData = {
    pending: allTasks.filter((task) => task.status === "0").length || 0,
    inProgress: allTasks.filter((task) => task.status === "1").length || 0,
    completed: allTasks.filter((task) => task.status === "2").length || 0,
    cancelled: allTasks.filter((task) => task.status === "3").length || 0,
    overdue: allTasks.filter((task) => task.status === "4").length || 0,
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Animated.View style={styles.card}>
        <LinearGradient
          colors={["#62B2D1", "#FFFFFF"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.title}>{ItemProject?.name}</Text>
          <Text style={styles.description}>{ItemProject?.description}</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              📅 Ngày tạo:{" "}
              {ItemProject?.fromDate
                ? formatDateTime(ItemProject.fromDate)
                : "Chưa cập nhật"}
            </Text>
            <Text style={styles.date}>
              🚀 Hạn chót:{" "}
              {ItemProject?.toDate
                ? formatDateTime(ItemProject.toDate)
                : "Chưa cập nhật"}
            </Text>
          </View>
          <Text
            style={[
              styles.status,
              {
                color: ItemProject
                  ? getStatusColor(ItemProject.status)
                  : "#A0A0A0",
              },
            ]}
          >
            ⚡ Trạng thái:{" "}
            {ItemProject ? getStatusText(ItemProject.status) : "Chưa xác định"}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={styles.section}>
        <LinearGradient
          colors={["#FFA07A", "#FFFFFF"]}
          style={styles.sectionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              👥 Thành viên ({totalMembers})
            </Text>
            {userRole === "ADMIN" && (
              <TouchableOpacity onPress={() => setShowAddMember(true)}>
                <AntDesign name="plus" size={24} color="#007BFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm thành viên..."
              value={memberSearchText}
              onChangeText={handleMemberSearch}
            />
            {showMemberSearch && memberSearchResults.length > 0 && (
              <View style={styles.searchResults}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsHeaderText}>
                    Thành viên tìm thấy
                  </Text>
                </View>
                <ScrollView
                  style={styles.resultsContent}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {memberSearchResults.map((item) => (
                    <View key={item.id} style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberAvatarContainer}>
                          <Image
                            source={
                              item.avatar
                                ? { uri: item.avatar }
                                : getDefaultAvatar()
                            }
                            style={styles.memberAvatar}
                          />
                          <View style={styles.memberDetails}>
                            <Text style={styles.memberName}>{item.name}</Text>
                            <Text style={styles.memberEmail}>{item.email}</Text>
                            <Text
                              style={[
                                styles.roleText,
                                {
                                  color:
                                    item.role === "ADMIN" ? "#007BFF" : "#666",
                                },
                              ]}
                            >
                              {getRoleDisplayName(item.role)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {userRole === "ADMIN" && item.id !== currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMember(item.id)}
                        >
                          <AntDesign name="delete" size={20} color="#FF4D67" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.resultsFooter}>
                  <Text style={styles.resultsFooterText}>Nhấn để chọn</Text>
                </View>
              </View>
            )}
          </View>

          <FlatList
            data={ItemProject?.members}
            keyExtractor={(member) => member.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatarContainer}>
                    <Image
                      source={
                        item.avatar ? { uri: item.avatar } : getDefaultAvatar()
                      }
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      <Text style={styles.memberEmail}>{item.email}</Text>
                      <Text
                        style={[
                          styles.roleText,
                          { color: item.role === "ADMIN" ? "#007BFF" : "#666" },
                        ]}
                      >
                        {getRoleDisplayName(item.role)}
                      </Text>
                    </View>
                  </View>
                </View>
                {userRole === "ADMIN" && item.id !== currentUserId && (
                  <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
                    <AntDesign name="delete" size={20} color="#FF4D67" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            scrollEnabled={false}
          />

          {totalMembers > 3 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  memberPage === 0 && styles.disabledButton,
                ]}
                onPress={() => setMemberPage((prev) => Math.max(0, prev - 1))}
                disabled={memberPage === 0}
              >
                <AntDesign
                  name="left"
                  size={16}
                  color={memberPage === 0 ? "#999" : "#007BFF"}
                />
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                Trang {memberPage + 1} / {Math.ceil(totalMembers / 3)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  (memberPage + 1) * 3 >= totalMembers && styles.disabledButton,
                ]}
                onPress={() => setMemberPage((prev) => prev + 1)}
                disabled={(memberPage + 1) * 3 >= totalMembers}
              >
                <AntDesign
                  name="right"
                  size={16}
                  color={
                    (memberPage + 1) * 3 >= totalMembers ? "#999" : "#007BFF"
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Modal thêm thành viên */}
      <Modal visible={showAddMember} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm thành viên</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập email để tìm kiếm"
              value={searchEmail}
              onChangeText={(text) => {
                setSearchEmail(text);
                debouncedSearch(text);
              }}
            />
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleAddMember(item.id)}
                >
                  <Image
                    source={
                      item.avatar ? { uri: item.avatar } : getDefaultAvatar()
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddMember(false);
                setSearchEmail("");
                setSearchResults([]);
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.pieWrapper}>
        <Text style={styles.chartTitle}>Trạng thái công việc</Text>
        <PieChart
          data={[
            {
              name: "Chờ xử lý",
              population: taskStatusData.pending,
              color: "#9E9E9E",
              legendFontColor: "#333",
              legendFontSize: 12,
            },
            {
              name: "Đang xử lý",
              population: taskStatusData.inProgress,
              color: "#00AEEF",
              legendFontColor: "#333",
              legendFontSize: 12,
            },
            {
              name: "Hoàn thành",
              population: taskStatusData.completed,
              color: "#4CAF50",
              legendFontColor: "#333",
              legendFontSize: 12,
            },
            {
              name: "Đã từ chối",
              population: taskStatusData.cancelled,
              color: "#FF4D67",
              legendFontColor: "#333",
              legendFontSize: 12,
            },
            {
              name: "Quá hạn",
              population: taskStatusData.overdue,
              color: "#FF9800",
              legendFontColor: "#333",
              legendFontSize: 12,
            },
          ]}
          width={400} // Chiều rộng biểu đồ
          height={250} // Chiều cao biểu đồ
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population" // Trường dữ liệu để hiển thị
          backgroundColor="transparent" // Nền trong suốt
          paddingLeft="15" // Căn lề trái
          absolute // Hiển thị giá trị tuyệt đối
        />
      </View>

      <Animated.View style={styles.taskSection}>
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          style={styles.taskGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📌 Công việc ({totalTasks})</Text>
            {userRole === "ADMIN" && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/Task/createTask",
                    params: { projectId: project.id },
                  })
                }
              >
                <AntDesign name="plus" size={24} color="#007BFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm công việc..."
              value={taskSearchText}
              onChangeText={handleTaskSearch}
            />
            {showTaskSearch && taskSearchResults.length > 0 && (
              <View style={styles.searchResults}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsHeaderText}>
                    Công việc tìm thấy
                  </Text>
                </View>
                <ScrollView
                  style={styles.resultsContent}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {taskSearchResults.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.taskItem,
                        userRole === "ADMIN" && styles.taskItemClickable,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.taskContent}
                        onPress={() => handleTaskPress(item.id)}
                      >
                        <View style={styles.taskHeader}>
                          <Text style={styles.taskTitle}>🔹 {item.title}</Text>
                          {userRole === "ADMIN" && (
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleRemoveTask(item.id);
                              }}
                            >
                              <AntDesign
                                name="close"
                                size={16}
                                color="#FF4D67"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        {/* <Text style={styles.taskDescription}>
                          {item.description}
                        </Text> */}
                        <Text style={styles.taskDate}>
                          {formatDateTime(item.createdAt)}
                        </Text>
                        <View style={styles.taskFooter}>
                          <Text
                            style={[
                              styles.statusText,
                              { color: getTaskStatusColor(item.status) },
                            ]}
                          >
                            {getTaskStatusText(item.status)}
                          </Text>
                          {item.assignees && item.assignees.length > 0 ? (
                            <View style={styles.assigneeContainer}>
                              <View style={styles.assignedAvatar}>
                                <Image
                                  source={
                                    item.assignees[0].avatar
                                      ? { uri: item.assignees[0].avatar }
                                      : getDefaultAvatar()
                                  }
                                  style={styles.avatarImage}
                                />
                                {userRole === "ADMIN" && (
                                  <TouchableOpacity
                                    style={styles.changeAssignBadge}
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      handleShowAssignModal(item.id);
                                    }}
                                  >
                                    <AntDesign
                                      name="edit"
                                      size={8}
                                      color="#FFF"
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                              {item.assignees.length > 1 && (
                                <View style={styles.assigneeCount}>
                                  <Text style={styles.assigneeCountText}>
                                    +{item.assignees.length - 1}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : userRole === "ADMIN" ? (
                            <TouchableOpacity
                              style={styles.assignButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleShowAssignModal(item.id);
                              }}
                            >
                              <AntDesign
                                name="adduser"
                                size={20}
                                color="#007BFF"
                              />
                            </TouchableOpacity>
                          ) : (
                            <Text style={styles.noAssigneeText}>
                              Chưa có người được gán
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.resultsFooter}>
                  <Text style={styles.resultsFooterText}>Nhấn để chọn</Text>
                </View>
              </View>
            )}
          </View>

          {ItemProject?.tasks && ItemProject.tasks.length > 0 ? (
            <FlatList
              data={ItemProject.tasks.filter(task => task.parentId === null)}
              keyExtractor={(task) => task.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.taskItem,
                    userRole === "ADMIN" && styles.taskItemClickable,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.taskContent}
                    onPress={() => handleTaskPress(item.id)}
                  >
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>🔹 {item.title}</Text>
                      {userRole === "ADMIN" && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveTask(item.id);
                          }}
                        >
                          <AntDesign name="close" size={16} color="#FF4D67" />
                        </TouchableOpacity>
                      )}
                    </View>
                    {/* <Text style={styles.taskDescription}>
                      {item.description}
                    </Text> */}
                    <Text style={styles.taskDate}>
                      Hạn chót: {formatDateTime(item.toDate)}
                    </Text>
                    <View style={styles.taskFooter}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: getTaskStatusColor(item.status) },
                        ]}
                      >
                        {getTaskStatusText(item.status)}
                      </Text>
                      {item.assignees && item.assignees.length > 0 ? (
                        <View style={styles.assigneeContainer}>
                          <View style={styles.assignedAvatar}>
                            <Image
                              source={
                                item.assignees[0].avatar
                                  ? { uri: item.assignees[0].avatar }
                                  : getDefaultAvatar()
                              }
                              style={styles.avatarImage}
                            />
                            {userRole === "ADMIN" && (
                              <TouchableOpacity
                                style={styles.changeAssignBadge}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleShowAssignModal(item.id);
                                }}
                              >
                                <AntDesign name="edit" size={8} color="#FFF" />
                              </TouchableOpacity>
                            )}
                          </View>
                          {item.assignees.length > 1 && (
                            <View style={styles.assigneeCount}>
                              <Text style={styles.assigneeCountText}>
                                +{item.assignees.length - 1}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : userRole === "ADMIN" ? (
                        <TouchableOpacity
                          style={styles.assignButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleShowAssignModal(item.id);
                          }}
                        >
                          <AntDesign name="adduser" size={20} color="#007BFF" />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.noAssigneeText}>
                          Chưa có người được gán
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có nhiệm vụ nào</Text>
            </View>
          )}

          {totalTasks > 5 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  taskPage === 0 && styles.disabledButton,
                ]}
                onPress={() => setTaskPage((prev) => Math.max(0, prev - 1))}
                disabled={taskPage === 0}
              >
                <AntDesign
                  name="left"
                  size={16}
                  color={taskPage === 0 ? "#999" : "#007BFF"}
                />
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                Trang {taskPage + 1} / {Math.ceil(totalTasks / 5)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  (taskPage + 1) * 5 >= totalTasks && styles.disabledButton,
                ]}
                onPress={() => setTaskPage((prev) => prev + 1)}
                disabled={(taskPage + 1) * 5 >= totalTasks}
              >
                <AntDesign
                  name="right"
                  size={16}
                  color={(taskPage + 1) * 5 >= totalTasks ? "#999" : "#007BFF"}
                />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Modal Assign Task */}
      <Modal visible={showAssignModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn thành viên</Text>
            <FlatList
              data={ItemProject?.members.filter(
                (member) => member.role !== "ADMIN"
              )}
              keyExtractor={(member) => member.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberOption}
                  onPress={() => handleAssignTask(item.id)}
                >
                  <Text style={styles.memberOptionText}>
                    {item.name} ({item.email})
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAssignModal(false);
                setSelectedTaskId(null);
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  card: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    color: "black",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: "black",
    marginBottom: 20,
    lineHeight: 26,
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 12,
    borderRadius: 8,
    textAlign: 'justify',
  },
  dateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  date: {
    fontSize: 14,
    color: "black",
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  sectionGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 15,
    color: "black",
    flexDirection: "row",
    alignItems: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  memberEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  taskItem: {
    padding: 15,
    backgroundColor: "#F3F4F6",
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
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    paddingRight: 24,
  },
  taskDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  assigneeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  assignedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  assigneeCount: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  assigneeCountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginTop: 10,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  taskItemClickable: {
    opacity: 1,
  },
  taskContent: {
    flex: 1,
  },
  deleteButton: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  assignButton: {
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  memberOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  memberOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  noAssigneeText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  changeAssignBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "blue",
    borderRadius: 10,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  taskSection: {
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  taskGradient: {
    padding: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  paginationText: {
    marginHorizontal: 10,
    color: "#666",
  },
  searchContainer: {
    marginBottom: 16,
    position: "relative",
  },
  searchResults: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultsHeader: {
    padding: 12,
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  resultsHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  resultsFooter: {
    padding: 12,
    backgroundColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
  },
  resultsFooterText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resultsContent: {
    maxHeight: 200,
    paddingVertical: 8,
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  pieWrapper: {
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
});

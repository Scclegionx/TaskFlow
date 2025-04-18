import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal, FlatList, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { getScheduleById, updateSchedule } from '@/hooks/useScheduleApi';
import { searchUserByEmail } from '@/hooks/useProjectApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { debounce } from "lodash";
import Toast from 'react-native-toast-message';

// Component Modal tìm kiếm người dùng
const UserSearchModal = ({ 
    visible, 
    searchResults, 
    onSelectUser, 
    searchInput, 
    onChangeSearch, 
    onClose 
}: {
    visible: boolean;
    searchResults: any[];
    onSelectUser: (user: any) => void;
    searchInput: string;
    onChangeSearch: (text: string) => void;
    onClose: () => void;
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Nhập email để tìm kiếm"
                            value={searchInput}
                            onChangeText={onChangeSearch}
                            autoFocus={true}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => onSelectUser(item)}
                            >
                                <Image 
                                    source={item.avatar ? { uri: item.avatar } : getDefaultAvatar()}
                                    style={styles.avatar}
                                />
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{item.name}</Text>
                                    <Text style={styles.userEmail}>{item.email}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.noResultText}>Không tìm thấy người dùng</Text>
                        )}
                        style={{ maxHeight: 300 }}
                        showsVerticalScrollIndicator={true}
                    />
                </View>
            </View>
        </Modal>
    );
};

const getDefaultAvatar = () => {
    return require('../../../assets/images/default-avatar.jpg');
};

const EditScheduleScreen = () => {
    const { id } = useLocalSearchParams();
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
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: number, name: string, email: string, avatar: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number, name: string, avatar: string }[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();

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

    // Hàm tìm kiếm người dùng với debounce
    const debouncedSearch = useCallback(
        debounce(async (email: string) => {
            if (email.length > 0) {
                setLoading(true);
                try {
                    const users = await searchUserByEmail(email);
                    setSearchResults(users || []);
                } catch (error) {
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 1000),
        []
    );

    const handleSearch = (email: string) => {
        setSearchEmail(email);
        setIsDropdownVisible(true);
        debouncedSearch(email);
    };

    const handleAddUser = (user: { id: number, name: string, avatar: string }) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, {
                id: user.id,
                name: user.name,
                avatar: user.avatar || getDefaultAvatar()
            }]);
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Thêm thành công',
                text2: `Đã thêm ${user.name} vào lịch trình`,
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 30,
            });
            setSearchEmail("");
            setSearchResults([]);
            setIsDropdownVisible(false);
        } else {
            Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Thông báo',
                text2: 'Thành viên này đã được thêm vào lịch trình',
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 30,
            });
        }
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    // Hàm đóng modal tìm kiếm
    const handleCloseModal = () => {
        setIsDropdownVisible(false);
        setSearchEmail("");
        setSearchResults([]);
    };

    const fetchSchedule = async () => {
        try {
            const schedule = await getScheduleById(Number(id));
            console.log(schedule);
            if (schedule) {
                setTitle(schedule.title);
                setDate(new Date(schedule.startTime));
                setStartTime(new Date(schedule.startTime));
                setEndTime(new Date(schedule.endTime));
                setPriority(schedule.priority);
                setContent(schedule.content || '');
                if (schedule.participants) {
                    setSelectedUsers(schedule.participants.map((participant: any) => ({
                        id: participant.user.id,
                        name: participant.user.name,
                        avatar: participant.user.avatar || getDefaultAvatar()
                    })));
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin lịch trình:', error);
            Alert.alert('Lỗi', 'Không thể lấy thông tin lịch trình. Vui lòng thử lại!');
        }
    };

    const handleUpdateSchedule = async () => {
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
                participants: selectedUsers.map(user => user.id),
            };
            console.log("Đang gửi dữ liệu:", scheduleData);
            await updateSchedule(Number(id), scheduleData);
            Alert.alert("Thành công", "Lịch trình đã được cập nhật!");
            router.back(); // Quay lại màn hình trước
        } catch (error) {
            console.error("Lỗi cập nhật lịch trình:", error);
            Alert.alert("Lỗi", "Không thể cập nhật lịch trình. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({ title: "Chỉnh sửa lịch trình" });
        fetchSchedule();
    }, []);

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        >
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
                            style={[
                                styles.priorityButton,
                                priority === key && key === 'LOW' && styles.selectedPriorityLow,
                                priority === key && key === 'NORMAL' && styles.selectedPriorityNormal,
                                priority === key && key === 'HIGH' && styles.selectedPriorityHigh,
                            ]}
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

                <Text style={styles.label}>Thêm thành viên (Email)</Text>
                <TouchableOpacity 
                    style={styles.addMemberButton}
                    onPress={() => setIsDropdownVisible(true)}
                >
                    <Text style={styles.addMemberButtonText}>+ Thêm thành viên</Text>
                </TouchableOpacity>

                <UserSearchModal
                    visible={isDropdownVisible}
                    searchResults={searchResults}
                    onSelectUser={handleAddUser}
                    searchInput={searchEmail}
                    onChangeSearch={handleSearch}
                    onClose={handleCloseModal}
                />

                <Text style={styles.label}>Thành viên đã thêm:</Text>
                <View style={styles.membersList}>
                    {selectedUsers.map((item) => (
                        <View key={item.id} style={styles.memberCard}>
                            <View style={styles.memberInfo}>
                                <Image 
                                    source={typeof item.avatar === 'string' ? { uri: item.avatar } : item.avatar} 
                                    style={styles.avatar} 
                                />
                                <Text style={styles.userName}>{item.name}</Text>
                                <TouchableOpacity 
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveUser(item.id)}
                                >
                                    <Text style={styles.removeText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.createButton, loading && styles.disabledButton]}
                    onPress={handleUpdateSchedule}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" />
                            <Text style={styles.loadingText}>Đang cập nhật lịch trình...</Text>
                        </View>
                    ) : (
                        <Text style={styles.createButtonText}>Cập Nhật Lịch Trình</Text>
                    )}
                </TouchableOpacity>
            </View>
            <Toast />
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
        borderColor: '#EF4444',
    },
    selectedPriorityLow: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
    selectedPriorityNormal: {
        backgroundColor: '#EAB308',
        borderColor: '#EAB308',
    },
    selectedPriorityHigh: {
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
    // Styles cho phần tìm kiếm và thêm thành viên
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    closeButton: {
        marginLeft: 10,
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#6B7280',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
    noResultText: {
        textAlign: 'center',
        padding: 16,
        color: '#6B7280',
    },
    addMemberButton: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    addMemberButtonText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '500',
    },
    membersList: {
        marginTop: 12,
    },
    memberCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: 'auto',
        padding: 4,
    },
    removeText: {
        fontSize: 18,
        color: '#EF4444',
        fontWeight: 'bold',
    },
});

export default EditScheduleScreen;

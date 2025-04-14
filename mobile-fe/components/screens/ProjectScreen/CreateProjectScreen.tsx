import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Modal } from "react-native";
import { styles } from "@/assets/styles/projectStyles";
import { useRouter } from "expo-router";
import { createProject, searchUserByEmail } from "@/hooks/useProjectApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from 'react-native-toast-message';

// Tách phần tìm kiếm thành component Modal riêng
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
                    />
                </View>
            </View>
        </Modal>
    );
};

const getDefaultAvatar = () => {
    return require('../../../assets/images/default-avatar.jpg');
};

const CreateProjectScreen = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createdBy, setCreatedBy] = useState<number | null>(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: number, name: string, email: string, avatar: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number, name: string, avatar: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const userId = await AsyncStorage.getItem("userId");
            const userAvatar = await AsyncStorage.getItem("userAvatar");
            if (userId) {
                setCreatedBy(Number(userId));
                setSelectedUsers([{
                    id: Number(userId),
                    name: "Bạn",
                    avatar: userAvatar || require('../../../assets/images/default-avatar.jpg')
                }]);
            }
        };
        fetchUserId();
    }, []);

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
                text2: `Đã thêm ${user.name} vào dự án`,
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
                text2: 'Thành viên này đã được thêm vào dự án',
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 30,
            });
        }
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleSubmit = async () => {
        if (!name || !description || !createdBy || !fromDate || !toDate) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const payload = {
            name,
            description,
            createdBy,
            fromDate,
            toDate,
            userIds: selectedUsers.map(user => user.id),
        };

        console.log("Request body:", JSON.stringify(payload, null, 2)); // Kiểm tra dữ liệu gửi lên

        try {
            await createProject(payload);
            Alert.alert("Thành công", "Dự án đã được tạo", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error) {
            console.error("Lỗi khi tạo dự án:", error);
            Alert.alert("Lỗi", "Không thể tạo dự án");
        }
    };

    // Thêm function để đóng modal
    const handleCloseModal = () => {
        setIsDropdownVisible(false);
        setSearchEmail("");
        setSearchResults([]);
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Tạo Dự Án</Text>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Tên dự án</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nhập tên dự án" 
                        value={name} 
                        onChangeText={setName} 
                    />

                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput 
                        style={[styles.input, { height: 100 }]} 
                        placeholder="Nhập mô tả" 
                        value={description} 
                        onChangeText={setDescription} 
                        multiline 
                    />

                    <Text style={styles.label}>Ngày bắt đầu</Text>
                    <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                        <Text style={styles.dateInput}>
                            {fromDate 
                                ? fromDate.toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                                : "Chọn ngày"}
                        </Text>
                    </TouchableOpacity>
                    {showFromDatePicker && (
                        <DateTimePicker
                            value={fromDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowFromDatePicker(false);
                                if (selectedDate) setFromDate(selectedDate);
                            }}
                        />
                    )}

                    <Text style={styles.label}>Ngày kết thúc</Text>
                    <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                        <Text style={styles.dateInput}>
                            {toDate 
                                ? toDate.toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                                : "Chọn ngày"}
                        </Text>
                    </TouchableOpacity>
                    {showToDatePicker && (
                        <DateTimePicker
                            value={toDate || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowToDatePicker(false);
                                if (selectedDate) setToDate(selectedDate);
                            }}
                        />
                    )}

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
                                    {item.id !== createdBy && (
                                        <TouchableOpacity 
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveUser(item.id)}
                                        >
                                            <Text style={styles.removeText}>×</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.createButton} 
                    onPress={handleSubmit}
                >
                    <Text style={styles.createButtonText}>Tạo dự án</Text>
                </TouchableOpacity>
            </ScrollView>
            
            <Toast />
        </View>
    );
};

export default CreateProjectScreen;

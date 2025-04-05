import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from "react-native";
import { styles } from "@/assets/styles/projectStyles";
import { useRouter } from "expo-router";
import { createProject, searchUserByEmail } from "@/hooks/useProjectApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { debounce } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateProjectScreen = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createdBy, setCreatedBy] = useState<number | null>(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: number, name: string, email: string, avatarUrl: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number, name: string, avatarUrl: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const userId = await AsyncStorage.getItem("userId");
            if (userId) {
                setCreatedBy(Number(userId));
                setSelectedUsers([{ id: Number(userId), name: "Bạn", avatarUrl: "https://example.com/default-avatar.png" }]); // Thêm chính user đang đăng nhập
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

    const handleAddUser = (user: { id: number, name: string, avatarUrl: string }) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchEmail("");
        setSearchResults([]);
        setIsDropdownVisible(false);
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


    return (
        <TouchableWithoutFeedback onPress={() => setIsDropdownVisible(false)}>
            <View style={styles.container}>
                <Text style={styles.header}>Tạo Dự Án</Text>

                <Text style={styles.label}>Tên dự án</Text>
                <TextInput style={styles.input} placeholder="Nhập tên dự án" value={name} onChangeText={setName} />

                <Text style={styles.label}>Mô tả</Text>
                <TextInput style={styles.input} placeholder="Nhập mô tả" value={description} onChangeText={setDescription} multiline />

                {/* Ngày bắt đầu */}
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                    <Text style={styles.dateInput}>{fromDate ? fromDate.toDateString() : "Chọn ngày"}</Text>
                </TouchableOpacity>
                {showFromDatePicker && (
                    <DateTimePicker
                        value={fromDate || new Date()}
                        mode="date"
                        display= "spinner"
                        onChange={(event, selectedDate) => {
                            setShowFromDatePicker(false);
                            if (selectedDate) setFromDate(selectedDate);
                        }}
                    />
                )}

                {/* Ngày kết thúc */}
                <Text style={styles.label}>Ngày kết thúc</Text>
                <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
                    <Text style={styles.dateInput}>{toDate ? toDate.toDateString() : "Chọn ngày"}</Text>
                </TouchableOpacity>
                {showToDatePicker && (
                    <DateTimePicker
                        value={toDate || new Date()}
                        mode="date"
                        display= "spinner"
                        onChange={(event, selectedDate) => {
                            setShowToDatePicker(false);
                            if (selectedDate) setToDate(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Thêm thành viên (Email)</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập email để tìm kiếm"
                        value={searchEmail}
                        onChangeText={handleSearch}
                        onFocus={() => setIsDropdownVisible(true)}
                    />

                    {isDropdownVisible && (
                        <View style={styles.dropdown}>
                            {searchResults.length > 0 ? (
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => handleAddUser(item)}
                                        >
                                            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                                            <View>
                                                <Text style={styles.userName}>{item.name}</Text>
                                                <Text style={styles.userEmail}>{item.email}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            ) : (
                                <Text style={styles.noResultText}>Không tìm thấy người dùng</Text>
                            )}
                        </View>
                    )}
                </View>

                <Text style={styles.label}>Thành viên đã thêm:</Text>
                <FlatList
                    data={selectedUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.userItem}>
                            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                            <Text style={styles.userName}>{item.name}</Text>
                            {item.id !== createdBy && ( // Không xóa chính người tạo dự án
                                <TouchableOpacity onPress={() => handleRemoveUser(item.id)}>
                                    <Text style={styles.removeUser}>❌</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />

                <Button title="Tạo dự án" onPress={handleSubmit} />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default CreateProjectScreen;

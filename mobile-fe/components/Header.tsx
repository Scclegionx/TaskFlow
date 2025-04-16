import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, FlatList, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { searchProjects } from "@/hooks/useProjectApi";
import { searchSchedules } from "@/hooks/useScheduleApi";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

interface User {
    name: string;
    email: string;
    avatar: any;
}

interface SearchResult {
    id: number;
    name?: string;
    title?: string;
}

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User>({ name: '', email: '', avatar: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [chats, setChats] = useState<SearchResult[]>([]);
    const [filteredChats, setFilteredChats] = useState<SearchResult[]>([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchChats = async () => {
                try {
                    const token = await AsyncStorage.getItem("token");
                    const userId = await AsyncStorage.getItem("userId");

                    const response = await axios.get(`${API_BASE_URL}/chat/list`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const formattedChats = response.data.map((chat) => {
                        const otherUser = !chat.isGroup
                            ? chat.users.find((user) => user.id !== parseInt(userId))
                            : null;

                        return {
                            id: chat.id,
                            name: chat.isGroup ? chat.chatName : otherUser?.name || "Không có tên",
                            avatarUrl: chat.isGroup ? chat.avatarUrl : otherUser?.avatar || null,
                        };
                    });

                    setChats(formattedChats);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách chat:", error);
                }
            };

            fetchChats();
        }, [])
    );

    const handleSearch = async (text: string) => {
        setSearchQuery(text);

        if (!text.trim()) {
            setSearchResults([]);
            setFilteredChats([]);
            return;
        }

        setIsSearching(true);

        try {
            let results: SearchResult[] = [];

            if (pathname === '/project') {
                results = await searchProjects(text);
            } else if (pathname === '/calendar') {
                results = await searchSchedules(text);
            } else if (pathname === '/message') {
                const filtered = chats.filter((chat) =>
                    chat.name?.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredChats(filtered);
                return; // Không cần xử lý thêm nếu đang tìm kiếm chat
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultPress = (result: SearchResult) => {
        if (pathname === '/project') {
            router.push({
                pathname: "/Project/projectdetail",
                params: { project: JSON.stringify(result) },
            });
        } else if (pathname === '/calendar') {
            router.push(`/Schedule/detailSchedule?id=${result.id}`);
        } else if (pathname === '/message') {
            router.push({
                pathname: `/chat/${result.id}`,
                params: { chatName: result.name },
            });
        }

        setSearchQuery('');
        setSearchResults([]);
        setFilteredChats([]);
    };

    useFocusEffect(
        React.useCallback(() => {
            const loadUser = async () => {
                const name = await AsyncStorage.getItem('username') || 'Người dùng';
                const email = await AsyncStorage.getItem('email') || 'email';
                const avatar = await AsyncStorage.getItem('avatar');
                
                const defaultAvatar = require('../assets/images/default-avatar.jpg');
                const userAvatar = avatar && avatar !== 'null' ? { uri: avatar } : defaultAvatar;

                setUser({ 
                    name, 
                    email, 
                    avatar: userAvatar
                });
            };
            loadUser();
        }, [])
    );

    const getSearchPlaceholder = () => {
        if (pathname === '/project') return "Tìm kiếm dự án...";
        if (pathname === '/calendar') return "Tìm kiếm lịch trình...";
        if (pathname === '/message') return "Tìm kiếm nhóm chat...";
        return "Tìm kiếm...";
    };

    const renderSearchResult = (item: SearchResult) => {
        let icon = 'folder-outline';
        let subtitle = 'Dự án';
      
        if (pathname === '/calendar') {
            icon = 'calendar-outline';
            subtitle = 'Lịch trình';
        } else if (pathname === '/message') {
            icon = 'chatbubble-outline';
            subtitle = 'Chat';
        }
      
        return (
            <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleResultPress(item)}
            >
                <View style={styles.resultContent}>
                    <View style={styles.resultIconContainer}>
                        <Ionicons name={icon} size={20} color="#6B7280" />
                    </View>
                    <View style={styles.resultTextContainer}>
                        <Text style={styles.resultTitle}>{item.name || item.title}</Text>
                        <Text style={styles.resultSubtitle}>{subtitle}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Avatar.Image
                            size={40}
                            source={user.avatar}
                            style={styles.avatar}
                        />
                        <Text style={styles.title} numberOfLines={1}>
                            {user.name || "Người dùng"}
                        </Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <Ionicons name="mail-outline" size={24} color="white" style={styles.icon} />
                        <TouchableOpacity onPress={() => router.push("/notifications")}>
                            <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleSearch}>
                            <Ionicons 
                                name={isSearchVisible ? "close" : "search"} 
                                size={24} 
                                color="white" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                {isSearchVisible && (
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                            <TextInput
                                placeholder={getSearchPlaceholder()}
                                placeholderTextColor="#6B7280"
                                style={styles.input}
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>
                        
                        {/* Search Results */}
                        {(searchResults.length > 0 || filteredChats.length > 0) && (
                            <View style={styles.resultsContainer}>
                                <FlatList
                                    data={pathname === '/message' ? filteredChats : searchResults}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => renderSearchResult(item)}
                                    style={styles.resultsList}
                                    ListHeaderComponent={() => (
                                        <View style={styles.resultsHeader}>
                                            <Text style={styles.resultsHeaderText}>
                                                {pathname === '/project'
                                                    ? 'Dự án tìm thấy'
                                                    : pathname === '/calendar'
                                                    ? 'Lịch trình tìm thấy'
                                                    : 'Chat tìm thấy'}
                                            </Text>
                                        </View>
                                    )}
                                    ListFooterComponent={() => (
                                        <View style={styles.resultsFooter}>
                                            <Text style={styles.resultsFooterText}>Nhấn để xem chi tiết</Text>
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                    </View>
                )}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    gradient: {
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 40,
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginLeft: 10,
        maxWidth: 200,
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 15,
    },
    avatar: {
        backgroundColor: "white",
    },
    searchContainer: {
        marginTop: 10,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
    },
    resultsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
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
    },
    resultsList: {
        maxHeight: 300,
    },
    resultsHeader: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    resultsHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    resultContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    resultsFooter: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
    },
    resultsFooterText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
});

export default Header;

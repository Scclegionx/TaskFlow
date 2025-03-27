import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/api';
import { useRouter } from 'expo-router';

const MessagesScreen = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                const userId = await AsyncStorage.getItem('userId'); 

                if (!token || !userId) {
                    Alert.alert('Error', 'You are not logged in');
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Lọc danh sách, loại bỏ user có ID trùng với userId
                const filteredContacts = response.data.filter(user => user.id.toString() !== userId);
                setContacts(filteredContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                Alert.alert('Error', 'Failed to fetch contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const startChat = async (contactId) => {
        setChatLoading(contactId);
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'You are not logged in');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/chat/start`,
                {},
                {
                    params: { user2Id: contactId },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('Chat started:', response.data);

            if (response.data && response.data.id) {
                console.log('Navigating to chata:', response.data.id);
                router.push(`/chat/${response.data.id}`);
                // router.push(`/chat`);
                // await AsyncStorage.setItem('chatId', response.data.id.toString());

            } else {
                throw new Error('Invalid chat response');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            Alert.alert('Error', 'Could not start chat');
        } finally {
            setChatLoading(null);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.contactCard} onPress={() => startChat(item.id)}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            <Text style={styles.name}>{item.name}</Text> 

                            {/* Hiển thị ActivityIndicator khi đang tải chat */}
                            {chatLoading === item.id && (
                                <ActivityIndicator size="small" color="#6200EE" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 10 },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    name: { fontSize: 16, fontWeight: 'bold' },
});

export default MessagesScreen;

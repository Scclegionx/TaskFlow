import React, { useEffect } from 'react';
import { Text, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ClearCacheScreen = () => {
    const router = useRouter();

    useEffect(() => {
        const clearStorage = async () => {
            try {
                await AsyncStorage.clear();
                Alert.alert('Cache cleared successfully!');
                router.push('/login'); // Chuyển về trang login sau khi xoá cache
            } catch (error) {
                console.error('Failed to clear cache:', error);
                Alert.alert('Failed to clear cache');
            }
        };

        clearStorage();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Clearing cache...</Text>
        </View>
    );
};

export default ClearCacheScreen;

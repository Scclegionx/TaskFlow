import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';
import styles from '../../assets/css/UserManagementScreen.styles';

interface User {
    id: number;
    name: string;
    email: string;
}

const UserManagementScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get<User[]>('http://localhost:8080/api/users');
            setUsers(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch users');
        }
    };

    const addUser = async () => {
        if (!name || !email) {
            Alert.alert('Validation', 'Name and email are required');
            return;
        }

        const newUser = { id: Date.now(), name, email };

        try {
            await axios.post('http://localhost:8080/api/users', newUser);
            setName('');
            setEmail('');
            fetchUsers();
        } catch (error) {
            Alert.alert('Error', 'Failed to add user');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <Button title="Add User" onPress={addUser} />
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.userText}>{item.name} - {item.email}</Text>
                )}
            />
        </View>
    );
};

export default UserManagementScreen;
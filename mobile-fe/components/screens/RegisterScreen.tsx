import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { register } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Validation', 'All fields are required');
            return;
        }

        try {
            const response = await register(name, email, password, confirmPassword);
            Alert.alert('Success', response);
            router.push('/login');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data || 'Failed to register');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
            <TextInput placeholder="Confirm Password" value={confirmPassword} secureTextEntry onChangeText={setConfirmPassword} style={styles.input} />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 }
});

export default RegisterScreen;

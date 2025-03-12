import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { login } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Validation', 'Email and password are required');
            return;
        }

        try {
            const response = await login(email, password);
            const token = response.token;
            const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT

            console.log(token);
            console.log(payload);

            localStorage.setItem('username', payload.username);
            localStorage.setItem('exp', payload.exp.toString());
            localStorage.setItem('email', payload.sub);
            router.push('/');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data || 'Failed to login');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 }
});

export default LoginScreen;

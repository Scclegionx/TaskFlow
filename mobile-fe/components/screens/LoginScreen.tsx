import React, { useState } from 'react';
import {View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { login } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // if (!email || !password) {
        //     Alert.alert('Validation', 'Email and password are required');
        //     return;
        // }

        try {
            // const response = await login(email, password);
            // const token = response.token;
            // const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT

            // console.log(token);
            // console.log(payload);

            // await AsyncStorage.setItem('token', token);
            // await AsyncStorage.setItem('username', payload.username);
            // await AsyncStorage.setItem('exp', payload.exp.toString());
            // await AsyncStorage.setItem('email', payload.sub);
            // Alert.alert('Successful!', 'Logged in!');
            router.push('/project');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data || 'Failed to login');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
            <Button title="Login" onPress={handleLogin} />
            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Haven't had an account? Register here</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
    linkText: { marginTop: 10, color: 'blue', textAlign: 'center' }
});

export default LoginScreen;

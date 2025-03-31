import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
    const navigation = useNavigation()
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    useEffect(() => {
            navigation.setOptions({ 
                headerShown: false,
                title: "", 
                headerStyle: { backgroundColor: '#3A7BDD' }, 
                headerTintColor: '#fff' 
            });
        }, []);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Validation', 'All fields are required');
            return;
        }
        
        if (password !== confirmPassword) {
            Alert.alert('Validation', 'Passwords do not match');
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
        <LinearGradient colors={['#3A7BDD', '#3A6073']} style={styles.container}>
            <View style={styles.registerBox}>
                <Text style={styles.title}>Tạo tài khoản</Text>
                <TextInput placeholder="Tên" placeholderTextColor="#555" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Email" placeholderTextColor="#555" value={email} onChangeText={setEmail} style={styles.input} />
                <TextInput placeholder="Mật khẩu" placeholderTextColor="#555" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
                <TextInput placeholder="Xác nhận mật khẩu" placeholderTextColor="#555" value={confirmPassword} secureTextEntry onChangeText={setConfirmPassword} style={styles.input} />
                
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Đăng ký</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent:"center",
    },
    registerBox: { 
        width: '90%', 
        padding: 20, 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOpacity: 0.2, 
        shadowRadius: 10, 
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 12,
        borderRadius: 25,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    button: {
        backgroundColor: '#3A7BDD',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 15,
        color: '#3A7BDD',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
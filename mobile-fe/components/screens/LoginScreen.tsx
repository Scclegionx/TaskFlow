import React, { useState,useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
        navigation.setOptions({ 
            headerShown: false,
            title: "", 
            headerStyle: { backgroundColor: '#3A7BDD' }, 
            headerTintColor: '#fff' 
        });
    }, []);
    

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Validation', 'Email and password are required');
            return;
        }

        try {
            const response = await login(email, password);
            const token = response.token;
            const payload = JSON.parse(atob(token.split('.')[1])); 

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('username', payload.username);
            await AsyncStorage.setItem('exp', payload.exp.toString());
            await AsyncStorage.setItem('email', payload.sub);
            await AsyncStorage.setItem('userId', payload.id.toString());
            await AsyncStorage.setItem('avatar', payload.avatar ? payload.avatar.toString() : "null");
            await AsyncStorage.setItem('roles', JSON.stringify(payload.roles));
            Alert.alert('Successful!', 'Logged in!');
            router.push('/dashboard');
        } catch (error:any) {
            Alert.alert('Error', error.response?.data || 'Failed to login');
        }
    };

    return (
        <LinearGradient colors={['#3A7BDD', '#3A6073']} style={styles.container}>
            <View style={styles.loginBox}>
                <Text style={styles.title}>Đăng nhập</Text>
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
                <TextInput placeholder="Mật khẩu" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
                </TouchableOpacity>
                <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>
                <View style={styles.socialIcons}>
                    <Text>🔵</Text>
                    <Text>🔴</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.linkText}>Đăng ký</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent:"center",
        alignItems: 'center' 
    },
    loginBox: { 
        width: '80%',
        padding: 20, 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOpacity: 0.2, 
        shadowRadius: 10 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    input: { 
        width: '100%', 
        padding: 10, 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 10, 
        marginBottom: 10 
    },
    loginButton: { 
        backgroundColor: '#3A7BDD', 
        padding: 10, 
        borderRadius: 10, 
        width: '100%', 
        alignItems: 'center' 
    },
    loginText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold'
     },
    orText: { 
        marginVertical: 10, 
        color: '#555' 
    },
    socialIcons: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '40%' 
    },
    linkText: { 
        color: '#3A7BDD', 
        marginTop: 10 
    }
});

export default LoginScreen;

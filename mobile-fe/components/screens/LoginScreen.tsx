import React, { useState,useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ImageBackground , Modal  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import { API_BASE_URL } from "@/constants/api";

const LoginScreen = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
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

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        try {
            await forgotPassword(resetEmail);
            Alert.alert('Thành công', 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');
            setForgotPasswordVisible(false);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data || 'Gửi yêu cầu thất bại');
        }
    };


     const forgotPassword = async (email: string) => {
        try {
            Alert.alert('Thông báo', 'Yêu cầu của bạn đang được xử lý. Vui lòng kiểm tra email của bạn trong giây lát.');
          const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
      
        return response
        } catch (error: any) {
          throw new Error(error.message || 'Lỗi kết nối đến server');
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
                {/* Thêm nút quên mật khẩu */}
                <TouchableOpacity onPress={() => setForgotPasswordVisible(true)}>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
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

            {/* Modal quên mật khẩu */}
            <Modal
                visible={forgotPasswordVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Quên mật khẩu</Text>
                        <TextInput
                            placeholder="Nhập email của bạn"
                            value={resetEmail}
                            onChangeText={setResetEmail}
                            style={styles.input}
                            keyboardType="email-address"
                        />
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => setForgotPasswordVisible(false)}
                            >
                                <Text style={styles.buttonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleForgotPassword}
                            >
                                <Text style={styles.buttonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent:"center",
        alignItems: 'center' 
    },
    forgotPasswordText: {
        color: '#3A7BDD',
        marginTop: 10,
        marginBottom: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    button: {
        padding: 10,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    confirmButton: {
        backgroundColor: '#3A7BDD',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
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

import React, { useState,useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ImageBackground , Modal  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import utf8 from "utf8";
import axios from 'axios';
import { API_BASE_URL } from "@/constants/api";
import CustomAlert from '@/components/CustomAlert';


const LoginScreen = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [shouldNavigate, setShouldNavigate] = useState(false);
    useEffect(() => {
        navigation.setOptions({ 
            headerShown: false,
            title: "", 
            headerStyle: { backgroundColor: '#3A7BDD' }, 
            headerTintColor: '#fff' 
        });
    }, []);
    

    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        try {
            const response = await login(email, password);
            const token = response.token;
            const payload = JSON.parse(atob(token.split('.')[1])); 

            await AsyncStorage.setItem('token', token);
            const decodedUsername = utf8.decode(payload.username);
await AsyncStorage.setItem("username", decodedUsername);
console.log("Decoded username:", decodedUsername);
            await AsyncStorage.setItem('exp', payload.exp.toString());
            await AsyncStorage.setItem('email', payload.sub);
            await AsyncStorage.setItem('userId', payload.id.toString());
            await AsyncStorage.setItem('avatar', payload.avatar ? payload.avatar.toString() : "null");
            await AsyncStorage.setItem('roles', JSON.stringify(payload.roles));
            
            setShouldNavigate(true);
            showAlert('Thành công', 'Đăng nhập thành công!');
        } catch (error:any) {
            showAlert('Lỗi', error.response?.data || 'Đăng nhập thất bại');
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
            <View style={[styles.loginBox, styles.elevation]}>
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

                {/* <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>
                <View style={styles.socialIcons}>
                    <Text>🔵</Text>
                    <Text>🔴</Text>
                </View> */}
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

            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
                onClosed={() => {
                    if (shouldNavigate) {
                        router.push('/dashboard');
                        setShouldNavigate(false);
                    }
                }}
            />
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
        padding: 15,
        borderWidth: 1, 
        borderColor: '#e0e0e0', 
        borderRadius: 15,
        marginBottom: 15,
        backgroundColor: '#f8f9fa',
        fontSize: 16,
        color: '#333',
    },
    loginButton: { 
        backgroundColor: '#3A7BDD', 
        padding: 15,
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#3A7BDD',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    },
    elevation: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});

export default LoginScreen;

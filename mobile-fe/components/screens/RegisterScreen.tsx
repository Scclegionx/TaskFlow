import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '@/hooks/useAuthApi';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import CustomAlert from '@/components/CustomAlert';

const RegisterScreen = () => {
    const navigation = useNavigation()
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert('Thông báo', 'Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            const response = await register(name, email, password, confirmPassword);
            setShouldNavigate(true);
            showAlert('Thành công', 'Đăng ký tài khoản thành công!');
        } catch (error: any) {
            showAlert('Lỗi', error.response?.data || 'Đăng ký thất bại');
        }
    };

    return (
        <LinearGradient colors={['#3A7BDD', '#3A6073']} style={styles.container}>
            <View style={[styles.registerBox, styles.elevation]}>
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
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
                onClosed={() => {
                    if (shouldNavigate) {
                        router.push('/login');
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
        borderColor: '#e0e0e0',
        padding: 15,
        marginBottom: 15,
        borderRadius: 15,
        backgroundColor: '#f8f9fa',
        color: '#333',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3A7BDD',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%',
        marginTop: 15,
        shadowColor: '#3A7BDD',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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

export default RegisterScreen;
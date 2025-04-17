import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { updateProject, getProjectById } from '@/hooks/useProjectApi';
import { styles } from "@/assets/styles/projectStyles";

const UpdateProjectScreen = () => {
    const router = useRouter();
    const { projectId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState({
        name: '',
        description: '',
        status: 1,
        fromDate: new Date(),
        toDate: new Date()
    });

    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ title: "Cập nhật dự án" });
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const data = await getProjectById(Number(projectId));
            setProject({
                name: data.name,
                description: data.description,
                status: data.status,
                fromDate: new Date(data.fromDate),
                toDate: new Date(data.toDate)
            });
            setLoading(false);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin dự án');
            router.back();
        }
    };

    const handleUpdate = async () => {
        try {
            await updateProject(Number(projectId), project);
            Alert.alert('Thành công', 'Cập nhật dự án thành công', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data || 'Không thể cập nhật dự án');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Cập nhật dự án</Text>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Tên dự án</Text>
                    <TextInput
                        style={styles.input}
                        value={project.name}
                        onChangeText={(text) => setProject({ ...project, name: text })}
                    />

                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        multiline
                        numberOfLines={4}
                        value={project.description}
                        onChangeText={(text) => setProject({ ...project, description: text })}
                    />

                    <Text style={styles.label}>Trạng thái</Text>
                    <View style={[styles.input, { paddingHorizontal: 0, height: 'auto' }]}>
                        <Picker
                            selectedValue={project.status}
                            onValueChange={(value) => setProject({ ...project, status: value })}
                            style={{ marginTop: -8, marginBottom: -8 }}
                        >
                            <Picker.Item label="Hoàn thành" value={2} />
                            <Picker.Item label="Hủy" value={3} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Ngày bắt đầu</Text>
                    <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowFromDate(true)}
                    >
                        <Text>{project.fromDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</Text>
                    </TouchableOpacity>
                    {showFromDate && (
                        <DateTimePicker
                            value={project.fromDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                                setShowFromDate(false);
                                if (date) setProject({ ...project, fromDate: date });
                            }}
                        />
                    )}

                    <Text style={styles.label}>Ngày kết thúc</Text>
                    <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowToDate(true)}
                    >
                        <Text>{project.toDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}</Text>
                    </TouchableOpacity>
                    {showToDate && (
                        <DateTimePicker
                            value={project.toDate}
                            mode="date"
                            display="spinner"
                            onChange={(event, date) => {
                                setShowToDate(false);
                                if (date) setProject({ ...project, toDate: date });
                            }}
                        />
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.createButton} 
                    onPress={handleUpdate}
                >
                    <Text style={styles.createButtonText}>Cập nhật</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default UpdateProjectScreen;

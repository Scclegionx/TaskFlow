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
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { updateProject, getProjectById } from '@/hooks/useProjectApi';

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

    useEffect(() => {
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
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Cập nhật dự án</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Tên dự án</Text>
                <TextInput
                    style={styles.input}
                    value={project.name}
                    onChangeText={(text) => setProject({ ...project, name: text })}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    value={project.description}
                    onChangeText={(text) => setProject({ ...project, description: text })}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Trạng thái</Text>
                <Picker
                    selectedValue={project.status}
                    onValueChange={(value) => setProject({ ...project, status: value })}
                    style={styles.picker}
                >
                    <Picker.Item label="Chưa bắt đầu" value={0} />
                    <Picker.Item label="Đang thực hiện" value={1} />
                    <Picker.Item label="Hoàn thành" value={2} />
                    <Picker.Item label="Quá hạn" value={3} />
                </Picker>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowFromDate(true)}
                >
                    <Text>{project.fromDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showFromDate && (
                    <DateTimePicker
                        value={project.fromDate}
                        mode="date"
                        onChange={(event, date) => {
                            setShowFromDate(false);
                            if (date) setProject({ ...project, fromDate: date });
                        }}
                    />
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày kết thúc</Text>
                <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowToDate(true)}
                >
                    <Text>{project.toDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showToDate && (
                    <DateTimePicker
                        value={project.toDate}
                        mode="date"
                        onChange={(event, date) => {
                            setShowToDate(false);
                            if (date) setProject({ ...project, toDate: date });
                        }}
                    />
                )}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Cập nhật</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default UpdateProjectScreen;

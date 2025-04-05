import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, StyleSheet, Alert } from "react-native";
import { MoreHorizontal } from "lucide-react-native";
import { styles } from "../assets/styles/projectStyles";
import { getStatusText } from "@/hooks/useProjectApi";
import { useRouter } from 'expo-router';
import { deleteProject } from '@/hooks/useProjectApi';

interface ProjectItemProps {
    project: {
        id: number;
        name: string;
        description: string;
        createdBy: string;
        status: number;
        fromDate?: Date | null;
        toDate?: Date | null;
        members?: any;
        tasks?: any;
    };
    onDelete: () => Promise<void>;
}

const getStatusColor = (status: number): string => {
    switch (status) {
        case 0: // Chưa bắt đầu
            return "#A0A0A0";
        case 1: // Đang thực hiện
            return "#00AEEF";
        case 2: // Hoàn thành
            return "#4CAF50";
        case 3: // Quá hạn
            return "#FF4D67";
        default:
            return "#A0A0A0";
    }
};

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const router = useRouter();

    const statusText = getStatusText(project.status);
    const statusColor = getStatusColor(project.status);

    const showPopupMenu = () => {
        setShowMenu(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const hidePopupMenu = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowMenu(false));
    };

    const handleEdit = () => {
        hidePopupMenu();
        router.push({
            pathname: "/Project/updateProject",
            params: { projectId: project.id }
        });
    };

    const handleDelete = () => {
        hidePopupMenu();
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa dự án này không?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: onDelete
                }
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{project.name}</Text>
                <Text style={styles.description}>{project.description}</Text>
                <Text style={styles.date}>📅 {project.fromDate ? project.fromDate.toLocaleDateString() : "Chưa xác định"}</Text>
                <Text style={[styles.status, { color: statusColor }]}>⚡ {statusText}</Text>
            </View>
            <TouchableOpacity onPress={showPopupMenu}>
                <MoreHorizontal size={24} color="#A0A0A0" />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={showMenu}
                onRequestClose={hidePopupMenu}
                animationType="none"
            >
                <Pressable style={popupStyles.overlay} onPress={hidePopupMenu}>
                    <Animated.View 
                        style={[
                            popupStyles.popup,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [10, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <TouchableOpacity 
                            style={popupStyles.menuItem}
                            onPress={handleEdit}
                        >
                            <Text style={popupStyles.menuText}>✏️ Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[popupStyles.menuItem, popupStyles.menuItemDanger]}
                            onPress={handleDelete}
                        >
                            <Text style={[popupStyles.menuText, popupStyles.menuTextDanger]}>🗑️ Xóa</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
};

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        minWidth: 150,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemDanger: {
        borderBottomWidth: 0,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuTextDanger: {
        color: '#FF4D67',
    },
});

export default ProjectItem;
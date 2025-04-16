import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, StyleSheet, Alert, Image } from "react-native";
import { MoreHorizontal } from "lucide-react-native";
import { styles } from "../assets/styles/projectStyles";
import { getStatusText } from "@/hooks/useProjectApi";
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

interface ProjectItemProps {
    project: {
        id: number;
        name: string;
        description: string;
        createdBy: string;
        status: number;
        fromDate?: Date | null;
        toDate?: Date | null;
        memberNumber?: number;
        tasks?: any;
        createdAt: Date;
    };
    onDelete: (projectId: number) => void;
    defaultAvatar: any;
}

const getStatusColor = (status: number): readonly [string, string] => {
    switch (status) {
        case 0: // Chưa bắt đầu
            return ['#A0A0A0', '#C0C0C0'] as const;
        case 1: // Đang thực hiện
            return ['#00AEEF', '#4ECDC4'] as const;
        case 2: // Hoàn thành
            return ['#4CAF50', '#96C93D'] as const;
        case 3: // Quá hạn
            return ['#FF4D67', '#FF6B6B'] as const;
        default:
            return ['#A0A0A0', '#C0C0C0'] as const;
    }
};

const getStatusIcon = (status: number): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (status) {
        case 0: return "rocket-launch";
        case 1: return "progress-clock";
        case 2: return "check-circle";
        case 3: return "alert-circle";
        default: return "help-circle";
    }
};

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onDelete, defaultAvatar }) => {
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
                    onPress: async () => {
                        try {
                            await onDelete(project.id);
                        } catch (error) {
                            console.error('Lỗi khi xóa dự án:', error);
                            Alert.alert("Lỗi", "Không thể xóa dự án");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.projectCard}>
            <View style={styles.cardGradient}>
                <LinearGradient
                    colors={['#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB']}
                    style={styles.cardBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0, 0.3, 0.7, 1]}
                />
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.2)']}
                    style={styles.cardBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.projectTitle, { color: '#1F2937' }]}>{project.name}</Text>
                        </View>
                        <TouchableOpacity onPress={showPopupMenu} style={styles.moreButton}>
                            <MoreHorizontal size={24} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={styles.dateContainer}>
                            <MaterialCommunityIcons name="calendar-outline" size={20} color="#6B7280" />
                            <Text style={[styles.dateText, { color: '#6B7280' }]}>
                                {project.fromDate ? new Date(project.fromDate).toLocaleDateString('vi-VN') : 'N/A'} 
                                {' - '}
                                {project.toDate ? new Date(project.toDate).toLocaleDateString('vi-VN') : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.membersContainer}>
                            <MaterialCommunityIcons name="account-group" size={18} color="#6B7280" />
                            <Text style={[styles.membersText, { color: '#6B7280' }]}>
                                {project.memberNumber || 0} thành viên
                            </Text>
                        </View>
                    </View>

                    <LinearGradient
                        colors={getStatusColor(project.status)}
                        style={styles.statusBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialCommunityIcons 
                            name={getStatusIcon(project.status)} 
                            size={18} 
                            color="white" 
                        />
                        <Text style={styles.statusText}>
                            {getStatusText(project.status)}
                        </Text>
                    </LinearGradient>
                </View>
            </View>

            <Modal
                transparent={true}
                visible={showMenu}
                onRequestClose={hidePopupMenu}
                animationType="none"
            >
                <Pressable style={styles.popupOverlay} onPress={hidePopupMenu}>
                    <Animated.View 
                        style={[
                            styles.popup,
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
                            style={styles.menuItem}
                            onPress={handleEdit}
                        >
                            <Text style={styles.menuText}>✏️ Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.menuItem, styles.menuItemDanger]}
                            onPress={handleDelete}
                        >
                            <Text style={[styles.menuText, styles.menuTextDanger]}>🗑️ Xóa</Text>
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
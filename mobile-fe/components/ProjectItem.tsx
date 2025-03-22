import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MoreHorizontal } from "lucide-react-native";
import { styles } from "../assets/styles/projectStyles";

interface IProject {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    status?: string | null;
    fromDate?: Date | null;
    toDate?: Date | null;
    members?: any;
    tasks?: any;
}

interface ProjectItemProps {
    project: IProject;
}

const getStatus = (toDate: Date | null) => {
    const now = new Date();

    if (!toDate) return { text: "Đang xử lý", color: "#00AEEF" }; // Nếu không có `toDate`
    
    if (toDate < now) return { text: "Quá hạn", color: "#FF4D67" }; // Đỏ
    if (toDate.toDateString() === now.toDateString()) return { text: "Đến hạn", color: "#FFA500" }; // Cam
    return { text: "Đang xử lý", color: "#00AEEF" }; // Xanh dương
};

const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
    // const status = getStatus(project.toDate);
    const status = { text: "Đang xử lý", color: "#00AEEF" };

    return (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{project.name}</Text>
                <Text style={styles.description}>{project.description}</Text>
                <Text style={styles.date}>📅 {project.fromDate ? project.fromDate.toLocaleDateString() : "Chưa xác định"}</Text>
                <Text style={[styles.status, { color: status.color }]}>⚡ {status.text}</Text>
            </View>
            <TouchableOpacity>
                <MoreHorizontal size={24} color="#A0A0A0" />
            </TouchableOpacity>
        </View>
    );
};

export default ProjectItem;
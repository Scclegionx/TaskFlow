import React from "react";
import { View, Text, Image, StyleSheet,TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface IUser {
    id: number;
    name: string;
    email: string;
    gender: number;
    phoneNumber: string;
    dateOfBirth: string;
    avatar: string;
    roles: IRole[];
    active: boolean;
}

interface IUserItemProps {
    item: IUser;
}
interface IRole {
    id: number;
    name: string;
    permissions: string[];
}

const UserItem: React.FC<IUserItemProps> = ({ item }) => {
    const statusColor = item.active ? "green" : "red"; // Tính toán màu ở đây
    const navigation = useNavigation();
    const router = useRouter();

    return (
        <TouchableOpacity style={styles.container} onPress={() => router.push({ pathname: "/UserDetail", params: { project: JSON.stringify(item) } })}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.roles}>{item.roles.map(role => role.name).join(", ")}</Text>
                <Text style={[styles.status, { color: statusColor }]}>{item.active ? "Active" : "Inactive"}</Text>
            </View>
        </TouchableOpacity >
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    info: {
        marginLeft: 10,
        justifyContent: "center",
    },
    name: {
        fontWeight: "bold",
        fontSize: 16,
    },
    email: {
        color: "#666",
    },
    roles: {
        color: "#007bff",
    },
    status: {
        fontWeight: "bold",
    },
});

export default UserItem;

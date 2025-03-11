import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, StyleSheet } from "react-native";
import axios from "axios";

interface User {
    id: number;
    name: string;
    email: string;
}

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get<User[]>("http://localhost:8080/api/users")
            .then(response => setUsers(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>User List</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>Name: {item.name}</Text>
                        <Text>Email: {item.email}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
    },
});

export default App;

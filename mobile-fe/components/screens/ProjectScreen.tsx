import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const projects = [
    { id: '1', title: 'IT Project', status: 'Overdue', progress: 60, color: '#FF4D67' },
    { id: '2', title: 'Business Project', status: 'In Progress', progress: 60, color: '#00AEEF' },
    { id: '3', title: 'Internal Project', status: 'Completed', progress: 60, color: '#4CAF50' },
];

const ProjectsScreen = () => {
    return (
        <View style={styles.container}>
            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={[styles.status, { color: item.color }]}>{item.status}</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    card: { backgroundColor: '#FFF', padding: 15, marginVertical: 10, borderRadius: 10 },
    title: { fontSize: 18, fontWeight: 'bold' },
    status: { fontSize: 14, marginVertical: 5 },
    progressBarContainer: { height: 6, backgroundColor: '#DDD', borderRadius: 3, marginTop: 5 },
    progressBar: { height: 6, backgroundColor: '#007BFF', borderRadius: 3 },
});

export default ProjectsScreen;
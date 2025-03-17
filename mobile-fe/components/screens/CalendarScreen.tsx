import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const CalendarScreen = () => {
    const tasks = [
        { id: '1', title: 'Work', time: '16:00 - 18:30' },
        { id: '2', title: 'Reading', time: '16:00 - 18:30' },
        { id: '3', title: 'Programming', time: '16:00 - 18:30' },
        { id: '4', title: 'Design', time: '16:00 - 18:30' },
        { id: '5', title: 'Testing', time: '16:00 - 18:30' },
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        <Text style={styles.taskTime}>{item.time}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    taskCard: { backgroundColor: '#FFD966', padding: 15, marginVertical: 10, borderRadius: 10 },
    taskTitle: { fontSize: 16, fontWeight: 'bold' },
    taskTime: { fontSize: 14, color: '#555' },
});

export default CalendarScreen;
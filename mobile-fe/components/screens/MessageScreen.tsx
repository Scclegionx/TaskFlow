import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const MessagesScreen = () => {
    const contacts = [
        { id: '1', name: 'Duong', phone: '076-946-6574' },
        { id: '2', name: 'Thuy', phone: '014-791-2853' },
        { id: '3', name: 'Pham Tu', phone: '756-103-3473' },
        { id: '4', name: 'Pham Tu', phone: '148-107-5932' },
        { id: '5', name: 'Le Khoi', phone: '899-439-9511' },
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.contactCard}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    contactCard: { backgroundColor: '#FFF', padding: 15, marginVertical: 10, borderRadius: 10 },
    contactName: { fontSize: 16, fontWeight: 'bold' },
    contactPhone: { fontSize: 14, color: '#555' },
});

export default MessagesScreen;
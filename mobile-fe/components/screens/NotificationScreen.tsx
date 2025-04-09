import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useNotificationSocket((newNoti) => {
    setNotifications((prev) => [newNoti, ...prev]);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.createdAt}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  message: { fontSize: 16 },
  time: { fontSize: 12, color: "#666", marginTop: 4 },
});

export default NotificationScreen;

// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, SafeAreaView, StyleSheet } from "react-native";
// import axios from "axios";

// interface User {
//     id: number;
//     name: string;
//     email: string;
// }

// const App: React.FC = () => {
//     const [users, setUsers] = useState<User[]>([]);

//     useEffect(() => {
//         axios.get<User[]>("http://localhost:8080/api/users")
//             .then(response => setUsers(response.data))
//             .catch(error => console.error(error));
//     }, []);

//     return (
//         <SafeAreaView style={styles.container}>
//             <Text style={styles.title}>User List</Text>
//             <FlatList
//                 data={users}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                     <View style={styles.item}>
//                         <Text>Name: {item.name}</Text>
//                         <Text>Email: {item.email}</Text>
//                     </View>
//                 )}
//             />
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 10,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: "bold",
//         marginBottom: 10,
//     },
//     item: {
//         padding: 10,
//         borderBottomWidth: 1,
//     },
// });

// export default App;



import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Các màn hình
const HomeScreen = () => <View style={styles.screen}><Text>Trang chủ</Text></View>;
const ProjectsScreen = () => <View style={styles.screen}><Text>Dự án</Text></View>;
const CalendarScreen = () => <View style={styles.screen}><Text>Lịch</Text></View>;
const MessagesScreen = () => <View style={styles.screen}><Text>Tin nhắn</Text></View>;
const ProfileScreen = () => <View style={styles.screen}><Text>Thông tin</Text></View>;

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Trang chủ" component={HomeScreen} />
        <Tab.Screen name="Dự án" component={ProjectsScreen} />
        <Tab.Screen name="Lịch" component={CalendarScreen} />
        <Tab.Screen name="Tin nhắn" component={MessagesScreen} />
        <Tab.Screen name="Thông tin" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});


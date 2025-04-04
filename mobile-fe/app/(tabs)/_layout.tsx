import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Header from "@/components/Header";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: true,
                header: () => <Header/>,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>

            <Tabs.Screen
                name="index"
                options={{
                    href:null,
                }}
            />
                
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="project"
                options={{
                    title: 'Dự án',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Lịch',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
                }}
            />
            <Tabs.Screen
                name="message"
                options={{
                    title: 'Tin nhắn',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Thông tin',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
                }}
            />
        </Tabs>
    );
}

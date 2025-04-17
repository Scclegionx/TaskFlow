import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Header from "@/components/Header";

type TabName = 'dashboard' | 'project' | 'calendar' | 'message' | 'profile';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const animationRefs = useRef<{[key: string]: Animated.CompositeAnimation | null}>({}).current;
    const tabAnimations = useRef({
        dashboard: new Animated.Value(1),
        project: new Animated.Value(1),
        calendar: new Animated.Value(1),
        message: new Animated.Value(1),
        profile: new Animated.Value(1),
    }).current;

    useEffect(() => {
        return () => {
            // Cleanup animations when component unmounts
            Object.entries(animationRefs).forEach(([key, anim]) => {
                if (anim && typeof anim.stop === 'function') {
                    try {
                        anim.stop();
                        animationRefs[key] = null;
                    } catch (error) {
                        // Ignore errors during cleanup
                    }
                }
            });
        };
    }, []);

    const animateTab = (tabName: TabName) => {
        try {
            // Stop any existing animations safely
            Object.entries(animationRefs).forEach(([key, anim]) => {
                if (anim && typeof anim.stop === 'function') {
                    try {
                        anim.stop();
                        animationRefs[key] = null;
                    } catch (error) {
                        // Ignore errors when stopping animations
                    }
                }
            });

            // Reset all animations
            Object.keys(tabAnimations).forEach(key => {
                if (key !== tabName) {
                    const resetAnim = Animated.loop(
                        Animated.sequence([
                            Animated.timing(tabAnimations[key as TabName], {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: true,
                            })
                        ]),
                        { iterations: 1 }
                    );
                    animationRefs[key] = resetAnim;
                    resetAnim.start(({ finished }) => {
                        if (finished) {
                            animationRefs[key] = null;
                        }
                    });
                }
            });

            // Animate the selected tab
            const sequence = Animated.loop(
                Animated.sequence([
                    Animated.timing(tabAnimations[tabName], {
                        toValue: 1.2,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(tabAnimations[tabName], {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    })
                ]),
                { iterations: 1 }
            );

            animationRefs[tabName] = sequence;
            sequence.start(({ finished }) => {
                if (finished) {
                    animationRefs[tabName] = null;
                }
            });
        } catch (error) {
            // Ignore errors in animateTab
        }
    };

    const getTabIcon = (name: string, color: string, focused: boolean) => {
        // Xác định tabName từ tên icon
        let tabName: TabName = 'dashboard';
        if (name.includes('house')) tabName = 'dashboard';
        else if (name.includes('folder')) tabName = 'project';
        else if (name.includes('calendar')) tabName = 'calendar';
        else if (name.includes('bubble')) tabName = 'message';
        else if (name.includes('person')) tabName = 'profile';

        const scale = tabAnimations[tabName];
        
        return (
            <Animated.View style={{ 
                transform: [
                    { scale }
                ],
                shadowColor: focused ? '#FFFFFF' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: focused ? 0.8 : 0,
                shadowRadius: 8,
                elevation: focused ? 8 : 0,
            }}>
                <IconSymbol 
                    size={28} 
                    name={name as any} 
                    color={focused ? '#FFFFFF' : '#94A3B8'} 
                />
            </Animated.View>
        );
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#FFFFFF',
                headerShown: true,
                header: () => <Header/>,
                tabBarButton: (props) => (
                    <HapticTab 
                        {...props} 
                        onPress={(event) => {
                            // Lấy tên tab từ props
                            const tabName = props.accessibilityState?.selected ? 
                                (props.accessibilityLabel as TabName) : 'dashboard';
                            
                            // Gọi animation
                            animateTab(tabName);
                            
                            // Gọi onPress gốc nếu có
                            if (props.onPress) {
                                props.onPress(event);
                            }
                        }}
                    />
                ),
                tabBarBackground: () => (
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: Platform.OS === 'ios' ? 70 : 50,
                        }}
                    />
                ),
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 70,
                    },
                    default: {
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 50,
                    },
                }),
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
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
                    tabBarIcon: ({ color, focused }) => getTabIcon('house.fill', color, focused),
                }}
            />
            <Tabs.Screen
                name="project"
                options={{
                    title: 'Dự án',
                    tabBarIcon: ({ color, focused }) => getTabIcon('folder.fill', color, focused),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Lịch',
                    tabBarIcon: ({ color, focused }) => getTabIcon('calendar', color, focused),
                }}
            />
            <Tabs.Screen
                name="message"
                options={{
                    title: 'Tin nhắn',
                    tabBarIcon: ({ color, focused }) => getTabIcon('bubble.left.and.bubble.right.fill', color, focused),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Thông tin',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => getTabIcon('person.crop.circle', color, focused),
                }}
            />
        </Tabs>
    );
}

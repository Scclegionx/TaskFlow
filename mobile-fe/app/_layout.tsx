import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, useSegments } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/welcome'];
    const currentRoute = `/${segments.join('/')}`;

    if (publicRoutes.includes(currentRoute)) {
      return;
    }

    // const username = localStorage.getItem('username');
    // const exp = localStorage.getItem('exp');

    const checkAuth = async () => {
      const username = await AsyncStorage.getItem('username');
      const exp = await AsyncStorage.getItem('exp');

      if (!username || !exp) {
        router.replace('/login');
        return;
      }

      const isExpired = parseInt(exp) * 1000 < Date.now();
      console.log('isExpired', isExpired, parseInt(exp) * 1000, Date.now());
      if (isExpired) {
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('exp');
        router.replace('/login');
      }
    };

    checkAuth();
  }, [segments]);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
  );
}
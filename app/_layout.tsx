import '../global.css';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { LanguageProvider } from '@/context/language-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider value={DarkTheme}>
        <Suspense fallback={
          <View className="flex-1 justify-center items-center bg-main">
            <ActivityIndicator size="large" color="#E8904B" />
          </View>
        }>
          <SQLiteProvider
            databaseName="ndvs.db"
            assetSource={{ assetId: require('../assets/db/ndvs.db') }}
            useSuspense
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </SQLiteProvider>
        </Suspense>
        <StatusBar style="light" />
      </ThemeProvider>
    </LanguageProvider>
  );
}

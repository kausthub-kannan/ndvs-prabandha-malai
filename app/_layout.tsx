import { LanguageProvider } from '@/context/language-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native';
import '../global.css';
import GlobalNavbar from '@/components/global-navbar';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1, backgroundColor: '#181A1F' }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="pasurams" options={{ headerShown: false }} />
            <Stack.Screen name="pasuram" options={{ headerShown: false }} />
            <Stack.Screen name="general-info" options={{ headerShown: false }} />
            <Stack.Screen name="acharyas" options={{ headerShown: false }} />
            <Stack.Screen name="alwars" options={{ headerShown: false }} />
            <Stack.Screen name="divya-deshams" options={{ headerShown: false }} />
            <Stack.Screen name="favorites" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="glossory" options={{ headerShown: false }} />
          </Stack>
          <GlobalNavbar />
        </View>
        <StatusBar style="light" />
      </ThemeProvider>
    </LanguageProvider>
  );
}

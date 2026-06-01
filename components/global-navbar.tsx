import Feather from '@expo/vector-icons/Feather';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type Tab = {
  name: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
};

const TABS: Tab[] = [
  { name: 'profile',     icon: 'settings', route: '/(tabs)/profile' },
  { name: 'search',      icon: 'search',   route: '/(tabs)/search' },
  { name: 'index',       icon: 'home',     route: '/(tabs)/' },
  { name: 'prabhandham', icon: 'book',     route: '/(tabs)/prabhandham' },
  { name: 'bookmarks',   icon: 'heart',    route: '/(tabs)/bookmarks' },
];

export default function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which tab is "active" based on current pathname
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/index') return 'index';
    // Strip leading slash and (tabs)/ prefix if present
    const clean = pathname.replace(/^\/\(tabs\)\//, '').replace(/^\//, '');
    return clean || 'index';
  };

  const activeTab = getActiveTab();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 10,
        right: 10,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#2a2e35ff',
        borderRadius: 16,
        // Shadow for Android
        elevation: 8,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      {TABS.map((tab) => {
        const isFocused = activeTab === tab.name;
        const color = isFocused ? '#E8904B' : '#FFFFFF';
        const iconSize = 28 * 0.85;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route as any)}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
          >
            <Feather name={tab.icon} size={iconSize} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

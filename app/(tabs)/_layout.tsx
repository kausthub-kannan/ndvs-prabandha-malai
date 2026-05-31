import { Tabs } from 'expo-router';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import Navbar from '@/components/navbar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <Navbar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prabhandham"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size * 0.85} color={color} />
          ),
        }}
      />

      {/* Hidden routes — no tab bar entry */}
      <Tabs.Screen name="pasurams" options={{ href: null }} />
      <Tabs.Screen name="pasuram" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="glossory" options={{ href: null }} />
      <Tabs.Screen name="acharyas" options={{ href: null }} />
      <Tabs.Screen name="alwars" options={{ href: null }} />
      <Tabs.Screen name="divya-deshams" options={{ href: null }} />
      <Tabs.Screen name="general-info" options={{ href: null }} />
    </Tabs>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <View className="px-5 pt-2.5 pb-2 border-b border-[#2C3540]">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4">
          <Ionicons name="chevron-back" size={20} color="#E8904B" />
          <Text className="text-accent-gold text-[15px] ml-1 font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-[28px] font-bold font-serif mb-2">About</Text>
      </View>
      <ScrollView contentContainerClassName="p-5 pb-[100px]">
        <Text className="text-[#ECEDEE] text-[16px] leading-[26px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

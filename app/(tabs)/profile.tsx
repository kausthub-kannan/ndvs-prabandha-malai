import { useLanguage } from '@/context/language-context';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Switch, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { language, setLanguage, showFullLyrics, setShowFullLyrics } = useLanguage();
  const isTamil = language === 'tamil';

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="p-5 pb-[120px] items-center">
        {/* Avatar */}
        <View className="items-center my-[30px]">
          <MaterialIcons name="face" size={80} color="#E8904B" />
          <Text className="text-text-primary text-[30px] font-bold font-serif mt-3.5">Profile</Text>
          <Text className="text-text-muted text-[14px] italic mt-1">Your spiritual journey dashboard</Text>
        </View>

        {/* User info */}
        <View className="w-full gap-3 mb-5">
          <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl gap-3.5">
            <MaterialIcons name="person" size={24} color="#A3AAB1" />
            <View className="gap-0.5">
              <Text className="text-text-muted text-[11px] uppercase tracking-[0.5px]">Username</Text>
              <Text className="text-text-primary text-[15px] font-bold mt-0.5">Devotee</Text>
            </View>
          </View>
          <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl gap-3.5">
            <MaterialIcons name="email" size={24} color="#A3AAB1" />
            <View className="gap-0.5">
              <Text className="text-text-muted text-[11px] uppercase tracking-[0.5px]">Email</Text>
              <Text className="text-text-primary text-[15px] font-bold mt-0.5">devotee@ndvs.org</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text className="text-text-muted text-[11px] font-bold tracking-[1.2px] uppercase self-start mb-2.5 mt-2">Preferences</Text>
        <View className="w-full gap-3 mb-5">
          {/* Script language toggle */}
          <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl justify-between">
            <View className="flex-row items-center gap-3.5">
              <MaterialIcons name="language" size={24} color="#A3AAB1" />
              <View className="gap-0.5">
                <Text className="text-text-muted text-[11px] uppercase tracking-[0.5px]">Pasuram Script</Text>
                <Text className="text-text-primary text-[15px] font-bold mt-0.5">{isTamil ? 'Tamil' : 'English'}</Text>
              </View>
            </View>
            <Switch
              value={isTamil}
              onValueChange={(val) => setLanguage(val ? 'tamil' : 'english')}
              trackColor={{ false: '#3E464E', true: '#E8904B' }}
              thumbColor={isTamil ? '#fff' : '#A3AAB1'}
            />
          </View>

          {/* Full lyrics toggle */}
          <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl justify-between">
            <View className="flex-row items-center gap-3.5">
              <MaterialIcons name="format-align-left" size={24} color="#A3AAB1" />
              <View className="gap-0.5">
                <Text className="text-text-muted text-[11px] uppercase tracking-[0.5px]">Pasuram Preview</Text>
                <Text className="text-text-primary text-[15px] font-bold mt-0.5">{showFullLyrics ? 'Full lyrics' : 'First few lines'}</Text>
              </View>
            </View>
            <Switch
              value={showFullLyrics}
              onValueChange={setShowFullLyrics}
              trackColor={{ false: '#3E464E', true: '#E8904B' }}
              thumbColor={showFullLyrics ? '#fff' : '#A3AAB1'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


import { getPasuramOfDay } from '@/database/prabhandham';
import { PasuramDetail } from '@/database/utils/db';
import { useLanguage } from '@/context/language-context';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const { language } = useLanguage();
  const router = useRouter();

  const [pasuram, setPasuram] = useState<PasuramDetail | null>(null);

  useEffect(() => {
    getPasuramOfDay().then(setPasuram).catch(console.error);
  }, []);

  const handlePress = (target: string) => {
    switch (target) {
      case 'Prabhadham':
        router.push('/(tabs)/prabhandham');
        break;
      case 'Alwars':
        router.push('/alwars');
        break;
      case 'Acharyas':
        router.push('/acharyas');
        break;
      case '108 Divya Deshams':
        router.push('/divya-deshams');
        break;
      case 'Glossary':
        router.push('/glossory');
        break;
      default:
        break;
    }
  };

  const lyricsText = pasuram
    ? (language === 'tamil' ? pasuram.tamil_scripts : pasuram.english_scripts)
    : null;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="p-5 pb-[100px]">
        <Text className="text-[40px] font-bold text-text-primary text-center my-[30px] font-serif">Library</Text>

        {/* ── Grid cards ── */}
        <View className="flex-row flex-wrap justify-between mb-[30px]">
          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Prabhadham')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Prabhadham</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Alwars')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Alwars</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Acharyas')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Acharyas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('108 Divya Deshams')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>108{"\n"}Divya Deshams</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── List rows ── */}
        <View className="gap-[15px] mb-8">
          <TouchableOpacity className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[18px] border border-border-color" onPress={() => handlePress('Glossary')}>
            <MaterialIcons name="bookmark" size={24} color={colors.tabIconDefault} className="mr-[15px]" />
            <View className="flex-1">
              <Text className="text-text-primary text-[17px] font-semibold font-serif">Glossary</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>

        {/* ── Pasuram of the Day ── */}
        <Text className="text-text-muted text-[11px] font-bold tracking-[1.2px] uppercase mb-3">
          Pasuram of the Day
        </Text>
        {pasuram ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => router.push({ pathname: '/pasuram', params: { id: String(pasuram.id) } })}
          >
            <View
              style={{
                backgroundColor: '#1E2228',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#2C3540',
                overflow: 'hidden',
              }}
            >
              {/* Accent top strip */}
              <LinearGradient
                colors={['#E8904B', '#C96A2A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 3 }}
              />

              <View style={{ padding: 18 }}>
                {/* Date */}
                <Text style={{ color: '#6B7280', fontSize: 11, letterSpacing: 0.5, marginBottom: 10 }}>
                  {today}
                </Text>

                {/* Meta row: prabhandham · azhwar · si_no */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  <Text style={{ color: '#E8904B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {pasuram.prabhandham}
                  </Text>
                  <Text style={{ color: '#3E464E', fontSize: 11 }}>·</Text>
                  <Text style={{ color: '#A3AAB1', fontSize: 11 }}>
                    {pasuram.azhwar}
                  </Text>
                  <Text style={{ color: '#3E464E', fontSize: 11 }}>·</Text>
                  <Text style={{ color: '#A3AAB1', fontSize: 11, fontStyle: 'italic' }}>
                    #{pasuram.si_no}
                  </Text>
                </View>

                {/* Lyrics preview */}
                {lyricsText ? (
                  <Text
                    style={{ color: '#E8DDD0', fontSize: 15, lineHeight: 26, fontFamily: 'serif', textAlign: 'center' }}
                    numberOfLines={4}
                  >
                    {lyricsText}
                  </Text>
                ) : null}

                {/* Read more prompt */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14 }}>
                  <Text style={{ color: '#E8904B', fontSize: 12, fontWeight: '600', marginRight: 3 }}>Read full</Text>
                  <Ionicons name="chevron-forward" size={13} color="#E8904B" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: '#1E2228', borderRadius: 18, padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Loading today's pasuram…</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

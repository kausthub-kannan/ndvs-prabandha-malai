import { useLanguage } from '@/context/language-context';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Switch,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Generic animated pill toggle ─────────────────────────────────────────────
function PillToggle({
  active,
  onToggle,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
}: {
  active: boolean;       // false = left, true = right
  onToggle: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactElement<{ color?: string }>;
  rightIcon?: React.ReactElement<{ color?: string }>;
}) {
  const translateX = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [active]);

  const TRACK_W = 80;
  const THUMB_W = 36;
  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, TRACK_W - THUMB_W - 2],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
      <View
        style={{
          width: TRACK_W,
          height: 40,
          borderRadius: 20,
          backgroundColor: active ? '#E8904B' : '#3E464E',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Side labels / icons */}
        <View style={{
          position: 'absolute', left: 0, right: 0,
          flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 9,
        }}>
          <View style={{ opacity: active ? 0.35 : 1 }}>
            {leftIcon ?? <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{leftLabel}</Text>}
          </View>
          <View style={{ opacity: active ? 1 : 0.35 }}>
            {rightIcon ?? <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{rightLabel}</Text>}
          </View>
        </View>

        {/* Sliding thumb */}
        <Animated.View
          style={{
            position: 'absolute',
            width: THUMB_W,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#fff',
            transform: [{ translateX: thumbTranslate }],
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {/* Show the active side's icon/label on the thumb */}
          {active
            ? (rightIcon
                ? React.cloneElement(rightIcon as React.ReactElement<{ color?: string }>, { color: '#181A1F' })
                : <Text style={{ color: '#181A1F', fontSize: 12, fontWeight: 'bold' }}>{rightLabel}</Text>)
            : (leftIcon
                ? React.cloneElement(leftIcon as React.ReactElement<{ color?: string }>, { color: '#181A1F' })
                : <Text style={{ color: '#181A1F', fontSize: 12, fontWeight: 'bold' }}>{leftLabel}</Text>)
          }
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

// ── Toggle card: toggle + caption label ──────────────────────────────────────
function ToggleCard({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      {children}
      <Text style={{ color: '#A3AAB1', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {caption}
      </Text>
    </View>
  );
}

// ── Pref row ─────────────────────────────────────────────────────────────────
function PrefRow({
  icon,
  label,
  value,
  control,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  control: React.ReactNode;
  onPress?: () => void;
}) {
  const Inner = (
    <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl justify-between">
      <View className="flex-row items-center gap-3.5">
        {icon}
        <View className="gap-0.5">
          <Text className="text-text-muted text-[11px] uppercase tracking-[0.5px]">{label}</Text>
          <Text className="text-text-primary text-[15px] font-bold mt-0.5">{value}</Text>
        </View>
      </View>
      {control}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{Inner}</TouchableOpacity>;
  }
  return Inner;
}

export default function SettingsScreen() {
  const { language, setLanguage, showFullLyrics, setShowFullLyrics } = useLanguage();
  const isTamil = language === 'tamil';
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="px-5 pb-[120px]">

        {/* ── Header ── */}
        <View className="items-center mt-8 mb-8">
          <View className="bg-surface rounded-full p-5 mb-4">
            <Feather name="settings" size={44} color="#E8904B" />
          </View>
          <Text className="text-text-primary text-[30px] font-bold font-serif">Settings</Text>
        </View>

        {/* ── Quick toggles row (Theme + Script) ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'flex-start',
            backgroundColor: '#1E2228',
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 16,
            marginBottom: 28,
          }}
        >
          {/* Theme toggle */}
          <ToggleCard caption={isDark ? 'Dark' : 'Light'}>
            <PillToggle
              active={isDark}
              onToggle={() => setIsDark((v) => !v)}
              leftIcon={<Feather name="sun" size={14} color="#fff" />}
              rightIcon={<Feather name="moon" size={14} color="#fff" />}
            />
          </ToggleCard>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: '#2C3540', alignSelf: 'stretch', marginHorizontal: 8 }} />

          {/* Script toggle */}
          <ToggleCard caption={isTamil ? 'Tamil' : 'English'}>
            <PillToggle
              active={isTamil}
              onToggle={() => setLanguage(isTamil ? 'english' : 'tamil')}
              leftLabel="E"
              rightLabel="அ"
            />
          </ToggleCard>
        </View>

        {/* ── Preferences ── */}
        <Text className="text-text-muted text-[11px] font-bold tracking-[1.2px] uppercase mb-3">
          Preferences
        </Text>
        <View className="gap-3">
          <PrefRow
            icon={<MaterialIcons name="format-align-left" size={22} color="#A3AAB1" />}
            label="Pasuram Preview"
            value={showFullLyrics ? 'Full lyrics' : 'First few lines'}
            control={
              <Switch
                value={showFullLyrics}
                onValueChange={setShowFullLyrics}
                trackColor={{ false: '#3E464E', true: '#E8904B' }}
                thumbColor={showFullLyrics ? '#fff' : '#A3AAB1'}
              />
            }
          />
          <PrefRow
            icon={<MaterialIcons name="info-outline" size={22} color="#A3AAB1" />}
            label="App"
            value="About"
            control={<Feather name="chevron-right" size={18} color="#3E464E" />}
            onPress={() => router.push('/about')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

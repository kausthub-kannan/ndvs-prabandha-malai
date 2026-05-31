import { getAdjacentPasuramIds, getPasuramById, toggleBookmark } from '@/database/prabhandham';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PasuramDetail = {
  id: number;
  si_no: string;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  meaning: string;
  purport: string;
  azhwar: string;
  bookmark: number;
  archavathara?: string | null;
  avataram?: string | null;
  rasa?: string | null;
};

type Adjacent = { prevId: number | null; nextId: number | null };

// Glowing heart — scale spring + fade glow layer
function GlowHeart({ bookmarked, onToggle }: { bookmarked: boolean; onToggle: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(bookmarked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: bookmarked ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [bookmarked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* Glow bloom */}
        <Animated.View
          className="absolute -top-[6px] -left-[6px] -right-[6px] -bottom-[6px] rounded-[24px] bg-[#E85D75]"
          style={{
            opacity: Animated.multiply(glowOpacity, 0.3),
          }}
        />
        <Ionicons
          name={bookmarked ? 'heart' : 'heart-outline'}
          size={28}
          color={bookmarked ? '#E85D75' : '#6B7280'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function SectionBlock({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <View className="mb-[26px]">
      <Text className="text-accent text-[11px] font-bold tracking-[1.4px] uppercase mb-2.5">{title}</Text>
      <Text className="text-text-muted text-[15px] leading-[26px] tracking-[0.2px]">{content}</Text>
    </View>
  );
}

const splitTags = (val: string | null | undefined) => {
  if (!val) return [];
  return val.split(',').map((s) => s.trim()).filter(Boolean);
};

export default function PasuramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const [pasuram, setPasuram] = useState<PasuramDetail | null>(null);
  const [adjacent, setAdjacent] = useState<Adjacent>({ prevId: null, nextId: null });
  const [loading, setLoading] = useState(true);

  const loadPasuram = useCallback(async (pasuramId: number) => {
    setLoading(true);
    try {
      const [row, adj] = await Promise.all([
        getPasuramById(pasuramId),
        getAdjacentPasuramIds(pasuramId),
      ]);
      setPasuram(row as PasuramDetail);
      setAdjacent(adj as Adjacent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) loadPasuram(Number(id));
  }, [id, loadPasuram]);

  // Simple navigate — no animation
  const navigateTo = useCallback(
    (targetId: number | null) => {
      if (!targetId) return;
      router.replace({ pathname: '/(tabs)/pasuram', params: { id: String(targetId) } });
    },
    [router]
  );

  const handleBookmarkToggle = useCallback(async () => {
    if (!pasuram) return;
    const newVal = await toggleBookmark(pasuram.id, pasuram.bookmark);
    setPasuram((prev) => (prev ? { ...prev, bookmark: newVal } : prev));
  }, [pasuram]);

  if (loading || !pasuram) {
    return (
      <SafeAreaView className="flex-1 bg-main">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Decide which script to show based on language setting
  const lyricsText =
    language === 'tamil' ? pasuram.tamil_scripts : pasuram.english_scripts;

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Top Bar */}
      <View className="px-[18px] py-2.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color="#E8904B" />
          <Text className="text-accent text-[15px] font-semibold ml-0.5">Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-[130px]"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header block ── */}
        <View className="mb-[22px]">
          <Text className="text-accent text-[13px] font-bold tracking-[1.2px] uppercase mb-1.5">{pasuram.prabhandham}</Text>
          <Text className="text-gray-500 text-xs tracking-[0.5px] mb-3.5">{pasuram.azhwar}</Text>

          {/* Alwar + heart — alwar stretches, heart pins right */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 text-lg tracking-[0.5px] font-serif flex-1">{pasuram.si_no}</Text>
            <GlowHeart
              bookmarked={pasuram.bookmark === 1}
              onToggle={handleBookmarkToggle}
            />
          </View>
        </View>

        {/* ── Lyrics block (centered, moderate size) ── */}
        {lyricsText ? (
          <View className="items-center mb-8 px-3">
            <Text className="text-[#E8DDD0] text-base leading-7 font-serif text-center tracking-[0.3px]">{lyricsText}</Text>
          </View>
        ) : null}

        {/* Tags (Rasa, Avataram, Archavathara) */}
          {(pasuram.rasa || pasuram.avataram || pasuram.archavathara) ? (
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {splitTags(pasuram.rasa).map((tag, idx) => (
                <View key={`rasa-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-rose-100">
                  <Text className="text-[11px] font-bold tracking-[0.2px] text-rose-800">{tag}</Text>
                </View>
              ))}
              {splitTags(pasuram.avataram).map((tag, idx) => (
                <View key={`avataram-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-green-100">
                  <Text className="text-[11px] font-bold tracking-[0.2px] text-green-800">{tag}</Text>
                </View>
              ))}
              {splitTags(pasuram.archavathara).map((tag, idx) => (
                <View key={`arch-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-blue-100">
                  <Text className="text-[11px] font-bold tracking-[0.2px] text-blue-800">{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* ── Thin divider ── */}
        <View className="h-px bg-border-color mb-7" />

        {/* ── Meaning & Purport ── */}
        <View className="mb-2">
          <SectionBlock title="Meaning" content={pasuram.meaning} />
          <SectionBlock title="Purport" content={pasuram.purport} />
        </View>

        {/* ── Navigation buttons ── */}
        <View className="flex-row justify-between pt-5 border-t border-border-color mt-2">
          <TouchableOpacity
            onPress={() => navigateTo(adjacent.prevId)}
            disabled={!adjacent.prevId}
            className={`flex-row items-center gap-1.5 py-2 px-3.5 rounded-lg bg-surface border border-border-color ${!adjacent.prevId ? 'opacity-30' : ''}`}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={adjacent.prevId ? '#E8904B' : '#3E464E'}
            />
            <Text className={`text-[14px] font-semibold ${!adjacent.prevId ? 'text-[#3E464E]' : 'text-accent'}`}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo(adjacent.nextId)}
            disabled={!adjacent.nextId}
            className={`flex-row items-center gap-1.5 py-2 px-3.5 rounded-lg bg-surface border border-border-color ${!adjacent.nextId ? 'opacity-30' : ''}`}
          >
            <Text className={`text-[14px] font-semibold ${!adjacent.nextId ? 'text-[#3E464E]' : 'text-accent'}`}>
              Next
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={adjacent.nextId ? '#E8904B' : '#3E464E'}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(24,26,31,0.8)', '#181A1F']}
        className="absolute bottom-0 left-0 right-0 h-[90px]"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}


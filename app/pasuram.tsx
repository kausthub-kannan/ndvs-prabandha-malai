import { getAdjacentPasuramIds, getPasuramById, toggleBookmark } from '@/database/prabhandham';
import { PasuramDetail, AdjacentPasuramIds } from '@/database/utils/db';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Adjacent = AdjacentPasuramIds;

const SCREEN_W = Dimensions.get('window').width;

// ─── Glowing heart ───────────────────────────────────────────────────────────
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
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.View
          className="absolute -top-[6px] -left-[6px] -right-[6px] -bottom-[6px] rounded-[24px] bg-[#E85D75]"
          style={{ opacity: Animated.multiply(glowOpacity, 0.3) }}
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

// ─── Section block ────────────────────────────────────────────────────────────
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

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PasuramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const [pasuram, setPasuram] = useState<PasuramDetail | null>(null);
  const [adjacent, setAdjacent] = useState<Adjacent>({ prevId: null, nextId: null });
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  // Generation counter: each navigation increments this; stale callbacks bail out early
  const navGenRef = useRef(0);
  // Tracks which ID was already loaded by navigateTo to skip the useEffect re-fetch
  const loadedIdRef = useRef<number | null>(null);
  // Keep adjacent in a ref so the PanResponder closure always sees the latest value
  const adjacentRef = useRef<Adjacent>({ prevId: null, nextId: null });
  adjacentRef.current = adjacent;

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
    if (!id) return;
    const numId = Number(id);
    // Skip re-fetch if navigateTo already loaded this pasuram
    if (loadedIdRef.current === numId) return;
    loadPasuram(numId);
  }, [id, loadPasuram]);

  /**
   * direction:  1 → slide left  (Next: exit left,  enter from right)
   *            -1 → slide right (Prev: exit right, enter from left)
   *
   * Interruptible: each call cancels any in-flight animation so rapid taps
   * feel instant with no lockout period.
   */
  const navigateTo = useCallback(
    (targetId: number | null, direction: 1 | -1) => {
      if (!targetId) return;

      // Claim this navigation — any older async continuation will see a stale gen and bail
      navGenRef.current += 1;
      const myGen = navGenRef.current;

      // Stop whatever animation is running and snap instantly to the exit position
      slideAnim.stopAnimation();
      slideAnim.setValue(direction * -SCREEN_W);

      // Position incoming content off-screen on the opposite side
      // We do a tiny delay so RN flushes the setValue before we start the spring
      slideAnim.setValue(direction * SCREEN_W);
      scrollRef.current?.scrollTo({ y: 0, animated: false });

      // Mark so useEffect won't re-fetch
      loadedIdRef.current = targetId;

      // Fetch new data, then spring in
      loadPasuram(targetId).then(() => {
        if (navGenRef.current !== myGen) return; // superseded by a newer tap
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 4,
        }).start(({ finished }) => {
          if (finished && navGenRef.current === myGen) {
            router.setParams({ id: String(targetId) });
          }
        });
      });
    },
    [slideAnim, loadPasuram, router]
  );

  const handleBookmarkToggle = useCallback(async () => {
    if (!pasuram) return;
    const newVal = await toggleBookmark(pasuram.id, pasuram.bookmark);
    setPasuram((prev) => (prev ? { ...prev, bookmark: newVal } : prev));
  }, [pasuram]);

  // ─── Swipe gesture ─────────────────────────────────────────────────────────
  const SWIPE_THRESHOLD = 30; // px
  const panResponder = useRef(
    PanResponder.create({
      // Only intercept if horizontal movement clearly dominates
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 12,
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 12,
      onPanResponderRelease: (_, { dx }) => {
        const { prevId, nextId } = adjacentRef.current;
        if (dx < -SWIPE_THRESHOLD && nextId) {
          // Swiped left → Next
          navigateTo(nextId, 1);
        } else if (dx > SWIPE_THRESHOLD && prevId) {
          // Swiped right → Prev
          navigateTo(prevId, -1);
        }
      },
    })
  ).current;

  if (!pasuram && loading) {
    return (
      <SafeAreaView className="flex-1 bg-main">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pasuram) return null;

  const lyricsText =
    language === 'tamil' ? pasuram.tamil_scripts : pasuram.english_scripts;

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* ── Top Bar — Prev / serial / Next (stays fixed, no animation) ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(232,144,75,0.12)',
        }}
      >
        {/* Prev */}
        <TouchableOpacity
          onPress={() => navigateTo(adjacent.prevId, -1)}
          disabled={!adjacent.prevId}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 18,
            backgroundColor: adjacent.prevId ? 'rgba(232,144,75,0.12)' : 'rgba(255,255,255,0.04)',
            opacity: adjacent.prevId ? 1 : 0.35,
            minWidth: 76,
          }}
        >
          <Ionicons name="chevron-back" size={16} color="#E8904B" />
          <Text style={{ color: '#E8904B', fontSize: 13, fontWeight: '600', marginLeft: 2 }}>Prev</Text>
        </TouchableOpacity>

        {/* Serial number */}
        <Text
          style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '600', letterSpacing: 0.4 }}
          numberOfLines={1}
        >
          {pasuram.si_no}
        </Text>

        {/* Next */}
        <TouchableOpacity
          onPress={() => navigateTo(adjacent.nextId, 1)}
          disabled={!adjacent.nextId}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 18,
            backgroundColor: adjacent.nextId ? 'rgba(232,144,75,0.12)' : 'rgba(255,255,255,0.04)',
            opacity: adjacent.nextId ? 1 : 0.35,
            minWidth: 76,
            justifyContent: 'flex-end',
          }}
        >
          <Text style={{ color: '#E8904B', fontSize: 13, fontWeight: '600', marginRight: 2 }}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color="#E8904B" />
        </TouchableOpacity>
      </View>

      {/* ── Animated content pane (also the swipe target) ── */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
          overflow: 'hidden',
        }}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header block */}
          <View style={{ marginTop: 20, marginBottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text className="text-accent text-[13px] font-bold tracking-[1.2px] uppercase mb-1.5">
                  {pasuram.prabhandham}
                </Text>
                <Text className="text-gray-500 text-xs tracking-[0.5px]">{pasuram.azhwar}</Text>
              </View>
              <GlowHeart bookmarked={pasuram.bookmark === 1} onToggle={handleBookmarkToggle} />
            </View>
          </View>

          {/* Lyrics */}
          {lyricsText ? (
            <View style={{ alignItems: 'center', marginBottom: 32, paddingHorizontal: 12 }}>
              <Text className="text-[#E8DDD0] text-base leading-7 font-serif text-center tracking-[0.3px]">
                {lyricsText}
              </Text>
            </View>
          ) : null}

          {/* Tags */}
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

          {/* Divider */}
          <View className="h-px bg-border-color mt-7 mb-7" />

          {/* Meaning & Purport */}
          <View className="mb-2">
            <SectionBlock title="Meaning" content={pasuram.meaning} />
            <SectionBlock title="Purport" content={pasuram.purport} />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(24,26,31,0.8)', '#181A1F']}
        className="absolute bottom-0 left-0 right-0 h-[90px]"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

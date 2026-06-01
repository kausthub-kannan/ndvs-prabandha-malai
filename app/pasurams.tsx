import { getPasuramsByPrabhandham, toggleBookmark } from '@/database/prabhandham';
import { useLanguage } from '@/context/language-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Animated,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Pasuram, PasuramRow } from '@/components/pasuram-row';

const PAGE_SIZE = 100;

export default function PasuramListScreen() {
  const { prabhandham } = useLocalSearchParams<{ prabhandham: string }>();
  const router = useRouter();
  const { language, showFullLyrics } = useLanguage();
  const [pasurams, setPasurams] = useState<Pasuram[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!prabhandham) return;
    setPage(0);
    setLoading(true);
    getPasuramsByPrabhandham(prabhandham)
      .then((rows) => setPasurams(rows as Pasuram[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [prabhandham]);

  const paginatedPasurams = useMemo(() => {
    return pasurams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [pasurams, page]);

  const totalPages = Math.ceil(pasurams.length / PAGE_SIZE);

  const handleBookmarkToggle = useCallback(async (id: number, current: number) => {
    const newVal = await toggleBookmark(id, current);
    setPasurams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmark: newVal } : p))
    );
  }, []);

  const handlePasuramPress = useCallback((id: number) => {
    router.push({ pathname: '/pasuram', params: { id: String(id) } });
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Header */}
      <View className="px-5 pt-2.5 pb-1.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="chevron-back" size={20} color="#E8904B" />
          <Text className="text-accent text-[15px] ml-1 font-semibold">
            Back
          </Text>
        </TouchableOpacity>
        <Text
          className="text-text-primary text-[28px] font-bold font-serif mb-1"
          numberOfLines={2}
        >
          {prabhandham}
        </Text>
        <Text className="text-text-muted text-[13px] mb-1">
          {pasurams.length} Pasurams
        </Text>
      </View>

      {/* Divider */}
      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        <FlatList
          data={paginatedPasurams}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-4 pt-2 pb-[120px]"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PasuramRow
              item={item}
              language={language}
              showFullLyrics={showFullLyrics}
              onBookmarkToggle={handleBookmarkToggle}
              onPress={handlePasuramPress}
            />
          )}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center mt-20">
                <Ionicons name="book-outline" size={48} color="#3E464E" />
                <Text className="text-text-muted mt-4 text-[15px]">
                  No pasurams found.
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row justify-center items-center py-6 gap-6">
                <TouchableOpacity
                  disabled={page === 0}
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 opacity-100 disabled:opacity-30"
                >
                  <Ionicons name="chevron-back" size={24} color="#E8904B" />
                </TouchableOpacity>
                <Text className="text-text-muted font-semibold">
                  {page + 1} / {totalPages}
                </Text>
                <TouchableOpacity
                  disabled={page === totalPages - 1}
                  onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="p-2 opacity-100 disabled:opacity-30"
                >
                  <Ionicons name="chevron-forward" size={24} color="#E8904B" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(24,26,31,0.9)', '#181A1F']}
          className="absolute bottom-0 left-0 right-0 h-20"
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}

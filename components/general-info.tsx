import { getAcharyaById } from '@/database/acharyas';
import { getAlwarById } from '@/database/alwar';
import { getDivyaDeshamById } from '@/database/divya-desham';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TagItem = {
  label: string;
  value: string;
};

// Static image maps — add require() entries here when images are placed in assets/images/<category>/<name>.png
// Example: 'Ramanuja': require('@/assets/images/acharyas/Ramanuja.png'),
const ACHARYA_IMAGES: Record<string, any> = {};
const ALWAR_IMAGES: Record<string, any> = {};
const DIVYA_DESHAM_IMAGES: Record<string, any> = {};

const IMAGE_MAPS: Record<string, Record<string, any>> = {
  acharyas: ACHARYA_IMAGES,
  alwars: ALWAR_IMAGES,
  'divya-deshams': DIVYA_DESHAM_IMAGES,
};

function getImageSource(category: string, name: string): any | null {
  const map = IMAGE_MAPS[category];
  if (!map) return null;
  return map[name] || null;
}

function extractTags(item: Record<string, any>): TagItem[] {
  const tags: TagItem[] = [];
  const skipKeys = ['id', 'name', 'bio', 'info'];

  for (const [key, value] of Object.entries(item)) {
    if (skipKeys.includes(key)) continue;
    if (value && typeof value === 'string' && value.trim()) {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      tags.push({ label, value: value.trim() });
    }
  }
  return tags;
}

function getDescriptionField(item: Record<string, any>, category: string): string {
  if (category === 'divya-deshams') {
    return item.info || '';
  }
  return item.bio || '';
}

const fetchFunctions: Record<string, (id: number) => Promise<any>> = {
  acharyas: getAcharyaById,
  alwars: getAlwarById,
  'divya-deshams': getDivyaDeshamById,
};

const TAG_COLORS = [
  { bg: '#FFE4E6', text: '#9F1239' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#CCFBF1', text: '#115E59' },
];

export default function GeneralInfo() {
  const { id, category } = useLocalSearchParams<{ id: string; category: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadItem = useCallback(async () => {
    setLoading(true);
    try {
      const fetchFn = fetchFunctions[category];
      if (fetchFn) {
        const row = await fetchFn(Number(id));
        setItem(row);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, category]);

  useEffect(() => {
    if (id && category) loadItem();
  }, [id, category, loadItem]);

  if (loading || !item) {
    return (
      <SafeAreaView className="flex-1 bg-main">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const description = getDescriptionField(item, category);
  const tags = extractTags(item);
  const imageSource = getImageSource(category, item.name);

  const categoryTitle = category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

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
        {/* Image — only rendered if a static require exists in the map */}
        {imageSource ? (
          <View className="items-center mb-5">
            <Image
              source={imageSource}
              className="w-[160px] h-[200px] rounded-2xl bg-surface"
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* ── Header block ── */}
        <View className="mb-[18px]">
          <Text className="text-accent text-[13px] font-bold tracking-[1.2px] uppercase mb-1.5">{categoryTitle}</Text>
          <Text className="text-text-primary text-[26px] font-bold font-serif tracking-[0.3px]">{item.name}</Text>
        </View>

        {/* Tags */}
        {tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 mb-5">
            {tags.map((tag, idx) => {
              const colorScheme = TAG_COLORS[idx % TAG_COLORS.length];
              return (
                <View
                  key={`tag-${idx}`}
                  className="px-2.5 py-1.5 rounded-md items-center justify-center" style={{ backgroundColor: colorScheme.bg }}
                >
                  <Text className="text-[11px] font-bold tracking-[0.2px]" style={{ color: colorScheme.text }}>
                    {tag.label}: {tag.value}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ── Thin divider ── */}
        <View className="h-px bg-border-color mb-6" />

        {/* ── Description ── */}
        {description ? (
          <View className="mb-[26px]">
            <Text className="text-accent text-[11px] font-bold tracking-[1.4px] uppercase mb-2.5">
              {category === 'divya-deshams' ? 'About' : 'Biography'}
            </Text>
            <Text className="text-text-muted text-[15px] leading-[26px] tracking-[0.2px]">{description}</Text>
          </View>
        ) : null}
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


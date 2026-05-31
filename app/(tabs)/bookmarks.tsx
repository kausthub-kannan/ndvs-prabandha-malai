import { getBookmarkedPasurams, toggleBookmark } from '@/database/prabhandham';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

type Pasuram = {
  id: number;
  si_no: string;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  azhwar: string;
  bookmark: number;
};

function HeartButton({ onRemove }: { onRemove: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(scale, { toValue: 0, useNativeDriver: true, speed: 20 }),
    ]).start(() => {
      onRemove();
      scale.setValue(1);
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="heart" size={20} color="#E85D75" />
      </Animated.View>
    </TouchableOpacity>
  );
}

function BookmarkRow({
  item,
  language,
  showFullLyrics,
  onRemove,
  onPress,
}: {
  item: Pasuram;
  language: 'english' | 'tamil';
  showFullLyrics: boolean;
  onRemove: (id: number) => void;
  onPress: (id: number) => void;
}) {
  const rawText = language === 'tamil' ? item.tamil_scripts : item.english_scripts;
  const displayText = showFullLyrics
    ? (rawText ?? '')
    : (rawText ? rawText.slice(0, 72) + (rawText.length > 72 ? '…' : '') : '');

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.72}
      className="flex-row items-center bg-surface rounded-xl mb-2.5 py-3.5 px-4 border border-border-color"
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1 gap-2">
          <Text
            className="text-accent text-[11px] font-bold tracking-[0.5px] uppercase"
          >
            {item.prabhandham}
          </Text>
          <Text className="text-text-muted text-[11px]">·</Text>
          <Text className="text-text-muted text-[11px]">{item.si_no}</Text>
        </View>
        <Text
          className="text-text-primary text-[15px] leading-[22px] font-serif"
          numberOfLines={showFullLyrics ? undefined : 2}
        >
          {displayText}
        </Text>
        <Text className="text-text-muted text-[12px] mt-1">{item.azhwar}</Text>
      </View>
      <View className="ml-3">
        <HeartButton onRemove={() => onRemove(item.id)} />
      </View>
    </TouchableOpacity>
  );
}

export default function BookmarksScreen() {
  const router = useRouter();
  const { language, showFullLyrics } = useLanguage();
  const [bookmarks, setBookmarks] = useState<Pasuram[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(() => {
    setLoading(true);
    getBookmarkedPasurams()
      .then((rows) => setBookmarks(rows as Pasuram[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refresh every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks])
  );

  const handleRemove = useCallback(async (id: number) => {
    await toggleBookmark(id, 1);
    setBookmarks((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handlePress = useCallback((id: number) => {
    router.push({ pathname: '/(tabs)/pasuram', params: { id: String(id) } });
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Header */}
      <View className="px-5 pt-2.5 pb-3.5">
        <Text
          className="text-text-primary text-[36px] font-bold font-serif text-center mb-1"
        >
          Bookmarks
        </Text>
        {bookmarks.length > 0 && (
          <Text className="text-text-muted text-[13px] text-center">
            {bookmarks.length} saved pasuram{bookmarks.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-4 pt-2 pb-[120px]"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BookmarkRow
              item={item}
              language={language}
              showFullLyrics={showFullLyrics}
              onRemove={handleRemove}
              onPress={handlePress}
            />
          )}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center mt-20 gap-4">
                <Ionicons name="heart-outline" size={56} color="#2C3540" />
                <Text className="text-text-primary text-xl font-bold font-serif">
                  No Bookmarks Yet
                </Text>
                <Text
                  className="text-text-muted text-[14px] text-center px-10 leading-[22px]"
                >
                  Tap the heart icon on any pasuram to bookmark it and find it here.
                </Text>
              </View>
            )
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

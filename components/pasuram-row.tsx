import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Pasuram = {
  id: number;
  si_no: string;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  azhwar: string;
  bookmark: number;
};

export function HeartButton({
  bookmarked,
  onToggle,
}: {
  bookmarked: boolean;
  onToggle: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={bookmarked ? 'heart' : 'heart-outline'}
          size={20}
          color={bookmarked ? '#E85D75' : '#6B7280'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function PasuramRow({
  item,
  language,
  showFullLyrics,
  onBookmarkToggle,
  onPress,
}: {
  item: Pasuram;
  language: 'english' | 'tamil';
  showFullLyrics: boolean;
  onBookmarkToggle: (id: number, current: number) => void;
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
      {/* Text content fills the row */}
      <View className="flex-1">
        <Text
          className="text-text-muted text-[11px] font-semibold tracking-[0.5px] mb-1 uppercase"
        >
          {item.si_no}
        </Text>
        <Text
          className="text-text-primary text-[15px] leading-[22px] font-serif"
          numberOfLines={showFullLyrics ? undefined : 2}
        >
          {displayText}
        </Text>
      </View>

      {/* Heart pinned to the right */}
      <View className="ml-3">
        <HeartButton
          bookmarked={item.bookmark === 1}
          onToggle={() => onBookmarkToggle(item.id, item.bookmark)}
        />
      </View>
    </TouchableOpacity>
  );
}

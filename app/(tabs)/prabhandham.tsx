import { getPrabhandhamList } from '@/database/prabhandham';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ITEM_HEIGHT = 104;

type PrabhandhamItem = {
  prabhandham: string;
  azhwar: string;
  pasuram_count: number;
};

function AnimatedCard({
  item,
  index,
  scrollY,
  onPress,
}: {
  item: PrabhandhamItem;
  index: number;
  scrollY: Animated.Value;
  onPress: (prabhandham: string) => void;
}) {
  const inputRange = [
    (index - 1.5) * ITEM_HEIGHT,
    index * ITEM_HEIGHT,
    (index + 1.5) * ITEM_HEIGHT,
  ];

  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.65, 1, 0.65],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View className="mb-3 rounded-[14px] overflow-hidden bg-surface border border-border-color" style={{ opacity }}>
      <TouchableOpacity
        className="flex-row items-center p-3 h-[92px]"
        activeOpacity={0.75}
        onPress={() => onPress(item.prabhandham)}
      >
        <Image
          source={require('@/assets/images/dummy.jpg')}
          className="w-[78px] h-[78px] rounded-[10px] bg-surface"
          resizeMode="cover"
        />
        <View className="flex-1 ml-[14px] justify-center">
          <Text className="text-[17px] font-bold text-text-primary font-serif mb-[2px]" numberOfLines={2}>
            {item.prabhandham}
          </Text>
          <Text className="text-[13px] text-text-muted italic mb-1">{item.azhwar}</Text>
          <Text className="text-[12px] text-text-muted font-semibold tracking-[0.3px]">
            {item.pasuram_count} Pasurams
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PrabhandhamScreen() {
  const [data, setData] = useState<PrabhandhamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const handleCardPress = (prabhandham: string) => {
    router.push({ pathname: '/pasurams', params: { prabhandham } });
  };

  useEffect(() => {
    getPrabhandhamList()
      .then((rows) => {
        setData(rows as PrabhandhamItem[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-main">
      <Text className="text-[36px] font-bold text-text-primary text-center my-5 font-serif tracking-[0.5px]">
        Prabhandham
      </Text>

      <View className="flex-1 relative">
        <Animated.FlatList
          data={data}
          keyExtractor={(item, i) => `${item.prabhandham}-${i}`}
          contentContainerClassName="px-4 pt-[18px] pb-[110px]"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedCard item={item} index={index} scrollY={scrollY} onPress={handleCardPress} />
          )}
          ListEmptyComponent={
            loading ? null : (
              <Text className="text-text-muted text-center mt-[60px] text-base">
                No prabhandhams found.
              </Text>
            )
          }
        />

        {/* Gradient fade at the top — blends into title area */}
        <LinearGradient
          colors={['#181A1F', 'rgba(24,26,31,0.55)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-10 z-[1]"
          pointerEvents="none"
        />

        {/* Gradient fade at the bottom — blends into navbar */}
        <LinearGradient
          colors={['transparent', 'rgba(24,26,31,0.85)', '#181A1F']}
          className="absolute bottom-0 left-0 right-0 h-20 z-[1]"
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}

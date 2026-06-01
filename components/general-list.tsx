import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GeneralItem = {
    id: number;
    name: string;
};

type GeneralListProps = {
    title: string;
    category: 'acharyas' | 'alwars' | 'divya-deshams';
    fetchList: () => Promise<GeneralItem[]>;
};

function ItemRow({
    item,
    onPress,
}: {
    item: GeneralItem;
    onPress: (id: number) => void;
}) {
    const { colorScheme } = useColorScheme();
    const colors = Colors[colorScheme ?? "dark"];
    return (
        <TouchableOpacity
            onPress={() => onPress(item.id)}
            activeOpacity={0.72}
            className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[18px] border border-border-color"
        >
            <View className="flex-1">
                <Text
                    className="text-text-primary text-[17px] font-semibold font-serif"
                    numberOfLines={2}
                >
                    {item.name}
                </Text>
            </View>

            <View className="ml-3">
                <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
            </View>
        </TouchableOpacity>
    );
}

export default function GeneralList({ title, category, fetchList }: GeneralListProps) {
    const { colorScheme } = useColorScheme();
    const colors = Colors[colorScheme ?? "dark"];

    const router = useRouter();
    const [items, setItems] = useState<GeneralItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchList()
            .then((rows) => setItems(rows as GeneralItem[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fetchList]);

    const handleItemPress = useCallback(
        (id: number) => {
            router.push({
                pathname: '/general-info' as any,
                params: { id: String(id), category },
            });
        },
        [router, category]
    );

    return (
        <SafeAreaView className="flex-1 bg-main">
            {/* Header */}
            <View className="px-5 pt-2.5 pb-1.5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-4"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.accent} />
                    <Text className="text-accent text-[15px] ml-1 font-semibold">
                        Back
                    </Text>
                </TouchableOpacity>
                <Text
                    className="text-text-primary text-[28px] font-bold font-serif mb-1"
                    numberOfLines={2}
                >
                    {title}
                </Text>
                <Text className="text-text-muted text-[13px] mb-1">
                    {items.length} {items.length === 1 ? 'entry' : 'entries'}
                </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-border-color mx-5 mb-2" />

            <View className="flex-1">
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerClassName="px-4 pt-2 pb-[120px]"
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ItemRow item={item} onPress={handleItemPress} />
                    )}
                    ListEmptyComponent={
                        loading ? null : (
                            <View className="items-center mt-20">
                                <Ionicons name="list-outline" size={48} color={colors.surfaceAlt} />
                                <Text className="text-text-muted mt-4 text-[15px]">
                                    No entries found.
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

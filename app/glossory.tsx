import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getGlossaryList } from '@/database/glossary';

type GlossaryItem = {
  word: string;
  definition: string;
};

export default function GlossaryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGlossary = useCallback((searchTerm: string) => {
    setLoading(true);
    getGlossaryList(searchTerm)
      .then((rows) => setResults(rows as GlossaryItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchGlossary(query);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, fetchGlossary]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      <View className="px-5 pt-2.5 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4">
          <Ionicons name="chevron-back" size={20} color="#E8904B" />
          <Text className="text-accent text-[15px] ml-1 font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-[28px] font-bold font-serif mb-1">Glossary</Text>
        <Text className="text-text-muted text-[13px] mb-2">Dictionary of terms</Text>
      </View>

      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-surface border border-border-color rounded-2xl px-4 h-14">
          <MaterialIcons name="search" size={24} color="#A3AAB1" className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary text-base"
            placeholder="Search words..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} className="p-2">
              <Ionicons name="close-circle" size={20} color="#A3AAB1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#E8904B" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.word}-${index}`}
            contentContainerClassName="px-5 pt-2 pb-[100px]"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-xl mb-3 py-4 px-5 border border-border-color">
                <Text className="text-accent text-[16px] font-bold tracking-[0.5px] uppercase mb-1.5">{item.word}</Text>
                <Text className="text-text-primary text-[15px] leading-[24px]">{item.definition}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Ionicons name="book-outline" size={48} color="#3E464E" />
                <Text className="text-text-muted mt-4 text-[15px]">No words found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Keyboard, Modal, SafeAreaView as RNSafeAreaView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/language-context';
import { getFilterTags, searchPasurams } from '@/database/search';
import { toggleBookmark } from '@/database/prabhandham';
import { Pasuram, PasuramRow } from '@/components/pasuram-row';

type FilterState = {
  azhwar: string[];
  archavathara: string[];
  avataram: string[];
  rasa: string[];
};

export default function SearchScreen() {
  const router = useRouter();
  const { language, showFullLyrics } = useLanguage();
  
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'lyrics' | 'meaning'>('lyrics');
  const [availableTags, setAvailableTags] = useState<FilterState>({ azhwar: [], archavathara: [], avataram: [], rasa: [] });
  const [selectedTags, setSelectedTags] = useState<FilterState>({ azhwar: [], archavathara: [], avataram: [], rasa: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<keyof FilterState>('azhwar');
  
  const [results, setResults] = useState<Pasuram[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch filter tags on mount
  useEffect(() => {
    getFilterTags().then(setAvailableTags).catch(console.error);
  }, []);

  // Search execution
  const executeSearch = useCallback((currentQuery: string, type: 'lyrics'|'meaning', tags: FilterState) => {
    setLoading(true);
    searchPasurams(currentQuery, type, tags)
      .then(rows => setResults(rows as Pasuram[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Trigger search on dependencies change
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      // Only search if there's a query or selected tags
      const hasTags = Object.values(selectedTags).some(arr => arr.length > 0);
      if (query.trim() || hasTags) {
        executeSearch(query, searchType, selectedTags);
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, searchType, selectedTags, executeSearch]);

  const toggleTag = (category: keyof FilterState, tag: string) => {
    setSelectedTags(prev => {
      const current = prev[category];
      if (current.includes(tag)) {
        return { ...prev, [category]: current.filter(t => t !== tag) };
      } else {
        return { ...prev, [category]: [...current, tag] };
      }
    });
  };

  const clearFilters = () => {
    setSelectedTags({ azhwar: [], archavathara: [], avataram: [], rasa: [] });
  };

  const handleBookmarkToggle = useCallback(async (id: number, current: number) => {
    const newVal = await toggleBookmark(id, current);
    setResults(prev => prev.map(p => p.id === id ? { ...p, bookmark: newVal } : p));
  }, []);

  const handlePasuramPress = useCallback((id: number) => {
    router.push({ pathname: '/(tabs)/pasuram', params: { id: String(id) } });
  }, [router]);

  const activeFilterCount = Object.values(selectedTags).reduce((acc, curr) => acc + curr.length, 0);

  const filterCategories: { key: keyof FilterState; label: string }[] = [
    { key: 'azhwar', label: 'Azhwar' },
    { key: 'archavathara', label: 'Archavataram' },
    { key: 'avataram', label: 'Avataram' },
    { key: 'rasa', label: 'Rasa' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-main">
      <View className="mt-5 px-5 pt-4 pb-2 z-10 bg-main">
        <View className="flex-row items-center bg-surface border border-border-color rounded-2xl px-4 h-14 mb-4">
          <MaterialIcons name="search" size={24} color="#A3AAB1" className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary text-base"
            placeholder="Search verses, meaning, or Alwars..."
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

        {/* Toggle & Filter Controls */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row bg-surface p-1 rounded-xl">
            <TouchableOpacity 
              onPress={() => setSearchType('lyrics')}
              className={`px-4 py-1.5 rounded-lg ${searchType === 'lyrics' ? 'bg-border-color' : ''}`}
            >
              <Text className={`${searchType === 'lyrics' ? 'text-text-primary' : 'text-text-muted'} font-semibold text-sm`}>Lyrics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setSearchType('meaning')}
              className={`px-4 py-1.5 rounded-lg ${searchType === 'meaning' ? 'bg-border-color' : ''}`}
            >
              <Text className={`${searchType === 'meaning' ? 'text-text-primary' : 'text-text-muted'} font-semibold text-sm`}>Meaning</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => setShowFilters(true)}
            className={`flex-row items-center px-4 py-2 rounded-xl border ${activeFilterCount > 0 ? 'bg-[#E8904B] border-accent' : 'bg-surface border-border-color'}`}
          >
            <Ionicons name="filter" size={16} color={activeFilterCount > 0 ? '#181A1F' : '#A3AAB1'} />
            <Text className={`ml-2 font-semibold text-sm ${activeFilterCount > 0 ? 'text-main' : 'text-text-primary'}`}>
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-border-color mx-5 mb-2" />

      {/* Results List */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#E8904B" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="px-5 pt-2 pb-[100px]"
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
              (!query.trim() && activeFilterCount === 0) ? (
                <View className="items-center mt-20">
                  <Ionicons name="search-outline" size={48} color="#3E464E" />
                  <Text className="text-text-muted mt-4 text-[15px]">
                    Search by typing or applying filters.
                  </Text>
                </View>
              ) : (
                <View className="items-center mt-20">
                  <Ionicons name="book-outline" size={48} color="#3E464E" />
                  <Text className="text-text-muted mt-4 text-[15px]">
                    No pasurams found.
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-main h-[80%] rounded-t-3xl overflow-hidden border-t border-border-color">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-border-color">
              <Text className="text-text-primary text-xl font-bold font-serif">Filters</Text>
              <View className="flex-row items-center">
                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={clearFilters} className="mr-5">
                    <Text className="text-[#E85D75] font-semibold text-base">Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowFilters(false)} className="bg-surface p-2 rounded-full">
                  <Ionicons name="close" size={20} color="#A3AAB1" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 flex-row">
              {/* Category Selector (Sidebar) */}
              <View className="w-1/3 bg-surface border-r border-border-color">
                {filterCategories.map(cat => {
                  const isSelected = activeFilterCategory === cat.key;
                  const count = selectedTags[cat.key].length;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => setActiveFilterCategory(cat.key)}
                      className={`p-4 border-l-4 ${isSelected ? 'border-accent bg-border-color' : 'border-transparent'}`}
                    >
                      <Text className={`${isSelected ? 'text-text-primary' : 'text-text-muted'} font-bold`}>{cat.label}</Text>
                      {count > 0 && (
                        <Text className="text-accent text-xs mt-1 font-semibold">{count} selected</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tags List */}
              <View className="w-2/3 bg-main">
                <FlatList
                  data={availableTags[activeFilterCategory]}
                  keyExtractor={(item) => item}
                  contentContainerClassName="p-4 pb-[100px]"
                  renderItem={({ item }) => {
                    const isSelected = selectedTags[activeFilterCategory].includes(item);
                    return (
                      <TouchableOpacity
                        onPress={() => toggleTag(activeFilterCategory, item)}
                        className={`flex-row items-center justify-between p-3 mb-2 rounded-xl border ${isSelected ? 'bg-[#E8904B]/10 border-accent' : 'bg-surface border-border-color'}`}
                      >
                        <Text className={`flex-1 ${isSelected ? 'text-accent font-bold' : 'text-text-primary'} text-base mr-2`} numberOfLines={2}>
                          {item}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#E8904B" />}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text className="text-text-muted text-center mt-10">No tags available.</Text>
                  }
                />
              </View>
            </View>

            {/* Apply Button */}
            <View className="p-5 bg-main border-t border-border-color">
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="bg-[#E8904B] py-3.5 rounded-xl items-center"
              >
                <Text className="text-main font-bold text-lg">
                  Show Results {activeFilterCount > 0 ? `(${results.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

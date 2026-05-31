import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const router = useRouter();

  const handlePress = (target: string) => {
    switch (target) {
      case 'Prabhadham':
        router.push('/(tabs)/prabhandham');
        break;
      case 'Alwars':
        router.push('/(tabs)/alwars');
        break;
      case 'Acharyas':
        router.push('/(tabs)/acharyas');
        break;
      case '108 Divya Deshams':
        router.push('/(tabs)/divya-deshams');
        break;
      case 'Glossary':
        router.push('/(tabs)/glossory');
        break;
      case 'About':
        router.push('/(tabs)/about');
        break;
      default:
        console.log(`Navigate to ${target}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="p-5 pb-[100px]">
        <Text className="text-[40px] font-bold text-text-primary text-center my-[30px] font-serif">Library</Text>
        
        <View className="flex-row flex-wrap justify-between mb-[30px]">
          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Prabhadham')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Prabhadham</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Alwars')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Alwars</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Acharyas')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Acharyas</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-[47%] aspect-square bg-[#7A7A7A] rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('108 Divya Deshams')}>
            <Image source={require('@/assets/images/dummy.jpg')} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-text-primary text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>108{"\n"}Divya Deshams</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="gap-[15px]">
          <TouchableOpacity className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[18px] border border-border-color" onPress={() => handlePress('Glossary')}>
            <MaterialIcons name="bookmark" size={24} color={colors.tabIconDefault} className="mr-[15px]" />
            <View className="flex-1">
              <Text className="text-text-primary text-[17px] font-semibold font-serif">Glossary</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[18px] border border-border-color" onPress={() => handlePress('About')}>
            <MaterialIcons name="info-outline" size={24} color={colors.tabIconDefault} className="mr-[15px]" />
            <View className="flex-1">
              <Text className="text-text-primary text-[17px] font-semibold font-serif">About</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

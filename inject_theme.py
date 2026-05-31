import re
import os

files_to_update = {
    'app/(tabs)/glossory.tsx': ['GlossaryScreen'],
    'app/(tabs)/search.tsx': ['SearchScreen'],
    'app/(tabs)/pasuram.tsx': ['PasuramScreen'],
    'app/(tabs)/about.tsx': ['AboutScreen'],
    'app/(tabs)/favorites.tsx': ['FavoritesScreen'],
    'app/(tabs)/index.tsx': ['HomeScreen'],
    'app/(tabs)/pasurams.tsx': ['PasuramsScreen'],
    'app/(tabs)/bookmarks.tsx': ['BookmarksScreen'],
    'app/_layout.tsx': ['RootLayout'],
    'components/general-info.tsx': ['GeneralInfo'],
    'components/general-list.tsx': ['ItemRow', 'GeneralList'],
}

color_map = {
    'color="#E8904B"': 'color={colors.accent}',
    'color="#A3AAB1"': 'color={colors.icon}',
    'color="#3E464E"': 'color={colors.surfaceAlt}',
    'color="#6B7280"': 'color={colors.tabIconDefault}',
    'color="#2C3540"': 'color={colors.borderColor}',
    "color={'#E8904B'}": 'color={colors.accent}',
}

for path, components in files_to_update.items():
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Add imports if not present
    imports = "import { useColorScheme } from 'nativewind';\nimport { Colors } from '@/constants/theme';\n"
    if 'useColorScheme' not in content:
        content = re.sub(r'^(import .*?;\n)', r'\1' + imports, content, count=1)
    
    # 2. Inject hooks into components
    for comp in components:
        # Match function definition, e.g., export default function SearchScreen() {
        # or function ItemRow({...}) {
        pattern = r'(function\s+' + comp + r'\s*\([^)]*\)\s*\{)'
        replacement = r'\1\n  const { colorScheme } = useColorScheme();\n  const colors = Colors[colorScheme ?? "dark"];\n'
        content = re.sub(pattern, replacement, content)
        
        # Also handle arrow functions if any: const Comp = () => {
        pattern2 = r'(const\s+' + comp + r'\s*=\s*\([^)]*\)\s*=>\s*\{)'
        content = re.sub(pattern2, replacement, content)

    # 3. Replace colors
    for old, new in color_map.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(path, 'w') as f:
            f.write(content)


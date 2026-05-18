import { View, Text } from 'react-native';
import { Compass, FolderTree, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from 'heroui-native';
import { SafeView } from '../../shared/ui/SafeView';
import { useAppColors } from '../../shared/lib/useAppColors';

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [accent, success] = useThemeColor(['accent', 'success'] as const);
  const [purple] = useAppColors(['purple'] as const);

  return (
    <SafeView edges={['top', 'left', 'right']}>
      <View testID="explore-screen" className="flex-1 px-6 py-12 bg-white dark:bg-gray-900">
        <View className="items-center mb-8">
          <Compass size={48} color={accent} strokeWidth={1.5} />
          <Text className="text-2xl font-bold mt-4 text-gray-900 dark:text-gray-100">
            {t('explore_title')}
          </Text>
          <Text className="text-sm mt-2 text-center text-gray-500 dark:text-gray-400">
            {t('explore_desc')}
          </Text>
        </View>

        <View className="rounded-2xl p-5 gap-4 bg-gray-50 dark:bg-gray-800">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Route Structure
          </Text>

          <RouteItem icon={<FolderTree size={16} color={accent} />} label="src/app/_layout.tsx" desc="Root layout" />
          <RouteItem icon={<FolderTree size={16} color={success} />} label="src/app/(tabs)/_layout.tsx" desc="Tab navigator" />
          <RouteItem icon={<FolderTree size={16} color={success} />} label="src/app/(tabs)/index.tsx" desc="Home tab" />
          <RouteItem icon={<FolderTree size={16} color={success} />} label="src/app/(tabs)/explore.tsx" desc="Explore tab (this)" />
          <RouteItem icon={<FolderTree size={16} color={success} />} label="src/app/(tabs)/settings.tsx" desc="Settings tab" />
          <RouteItem icon={<Globe size={16} color={purple} />} label="src/app/(auth)/login.tsx" desc="Auth group (later)" />
        </View>
      </View>
    </SafeView>
  );
}

function RouteItem({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center">
      {icon}
      <View className="ml-3 flex-1">
        <Text className="text-xs font-medium text-gray-800 dark:text-gray-200">{label}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{desc}</Text>
      </View>
    </View>
  );
}

import { Redirect, Tabs } from 'expo-router';
import { BookMarked, Headphones, BookOpen, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from 'heroui-native';
import { useAuth } from '../../providers/AuthProvider';
import { AuthTransitionScreen } from '../../shared/ui/AuthTransitionScreen';
import { FEATURES } from '../../shared/config/features';

export default function TabLayout() {
  const { t } = useTranslation();
  const { session, isLoading, isAuthProcessing } = useAuth();
  const [activeColor, inactiveColor, borderColor] = useThemeColor([
    'accent',
    'muted',
    'border',
  ] as const);

  if (FEATURES.AUTH && (isLoading || isAuthProcessing)) {
    return <AuthTransitionScreen />;
  }

  if (FEATURES.AUTH && !session && !__DEV__) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: borderColor,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_dict'),
          tabBarIcon: ({ color, size }) => (
            <BookMarked size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tab_practice'),
          tabBarIcon: ({ color, size }) => (
            <Headphones size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tab_progress'),
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}

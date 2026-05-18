import { Redirect, Tabs } from 'expo-router';
import { Home, Compass, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from 'heroui-native';
import { useAuth } from '../../providers/AuthProvider';
import { AuthTransitionScreen } from '../../shared/ui/AuthTransitionScreen';

export default function TabLayout() {
  const { t } = useTranslation();
  const { session, isLoading, isAuthProcessing } = useAuth();
  const [activeColor, inactiveColor, borderColor] = useThemeColor([
    'accent',
    'muted',
    'border',
  ] as const);

  if (isLoading || isAuthProcessing) {
    return <AuthTransitionScreen />;
  }

  // Prevent unauthenticated users from entering tabs directly.
  if (!session && !__DEV__) {
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
          title: t('tab_home'),
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tab_explore'),
          tabBarIcon: ({ color, size }) => (
            <Compass size={size} color={color} strokeWidth={1.5} />
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

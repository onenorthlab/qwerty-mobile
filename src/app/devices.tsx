import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Smartphone, Trash2 } from 'lucide-react-native';
import { useThemeColor } from 'heroui-native';
import { SafeView } from '../shared/ui/SafeView';
import { useAppColors } from '../shared/lib/useAppColors';
import {
  useDevices,
  useToggleDevicePush,
  useDeleteDevice,
  type NotificationDevice,
} from '../features/notifications/lib/useDevices';

export default function DevicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: devices = [], isLoading, refetch, isRefetching } = useDevices();
  const { mutate: togglePush, isPending: isToggling } = useToggleDevicePush();
  const { mutate: deleteDevice, isPending: isDeleting } = useDeleteDevice();

  const [muted, danger] = useThemeColor(['muted', 'danger'] as const);
  const [purple] = useAppColors(['purple'] as const);

  const handleToggle = (device: NotificationDevice) => {
    togglePush({ deviceId: device.id, enabled: !device.is_push_enabled });
  };

  const handleDelete = (device: NotificationDevice) => {
    Alert.alert(
      t('devices_delete_confirm_title'),
      t('devices_delete_confirm_msg'),
      [
        { text: t('devices_delete_cancel'), style: 'cancel' },
        {
          text: t('devices_delete'),
          style: 'destructive',
          onPress: () => deleteDevice(device.id),
        },
      ],
    );
  };

  const formatLastSeen = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return '刚刚 / just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const platformLabel = (platform: string) => {
    if (platform === 'ios') return t('devices_platform_ios');
    if (platform === 'android') return t('devices_platform_android');
    return t('devices_platform_web');
  };

  return (
    <SafeView edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Pressable
          testID="devices-back"
          onPress={() => router.back()}
          className="p-2 -ml-2 mr-2"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={muted} />
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {t('devices_title')}
        </Text>
      </View>

      <ScrollView
        testID="devices-screen"
        className="flex-1"
        contentContainerClassName="px-6 py-6"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator />
          </View>
        ) : devices.length === 0 ? (
          <View className="items-center py-16 gap-3">
            <Smartphone size={40} color={muted} strokeWidth={1.5} />
            <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
              {t('devices_empty')}
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
              {t('devices_empty_desc')}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isToggling={isToggling || isDeleting}
                formatLastSeen={formatLastSeen}
                platformLabel={platformLabel}
                colors={{ purple, danger, muted }}
                t={t}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
}

// ─── Device Card ─────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  onToggle,
  onDelete,
  isToggling,
  formatLastSeen,
  platformLabel,
  colors,
  t,
}: {
  device: NotificationDevice;
  onToggle: (d: NotificationDevice) => void;
  onDelete: (d: NotificationDevice) => void;
  isToggling: boolean;
  formatLastSeen: (iso: string) => string;
  platformLabel: (p: string) => string;
  colors: { purple: string; danger: string; muted: string };
  t: (key: string) => string;
}) {
  return (
    <View className="rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
      {/* Device info row */}
      <View className="flex-row items-start p-4 gap-3">
        <View className="mt-0.5">
          <Smartphone size={20} color={colors.purple} strokeWidth={1.5} />
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {device.device_name ?? t('devices_unknown_name')}
            </Text>
            {device.is_current_device && (
              <View className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900">
                <Text className="text-xs font-medium text-green-700 dark:text-green-300">
                  {t('devices_current')}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {platformLabel(device.platform)}
            {device.app_version ? ` · v${device.app_version}` : ''}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {t('devices_last_seen')}: {formatLastSeen(device.last_seen_at)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

      {/* Controls row */}
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Push toggle */}
        <Pressable
          testID={`device-push-toggle-${device.id}`}
          className="flex-row items-center gap-3"
          onPress={() => !isToggling && onToggle(device)}
          disabled={isToggling}
        >
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {t('devices_push_enabled')}
          </Text>
          <View
            className={`w-12 h-7 rounded-full justify-center ${
              device.is_push_enabled
                ? 'bg-primary-500 items-end'
                : 'bg-gray-300 dark:bg-gray-600 items-start'
            } ${isToggling ? 'opacity-50' : ''}`}
          >
            <View className="w-5 h-5 bg-white rounded-full mx-1" />
          </View>
        </Pressable>

        {/* Delete button */}
        <Pressable
          testID={`device-delete-${device.id}`}
          onPress={() => !isToggling && onDelete(device)}
          disabled={isToggling}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950"
          hitSlop={6}
        >
          <Trash2 size={14} color={colors.danger} strokeWidth={1.5} />
          <Text className="text-xs font-medium text-red-500 dark:text-red-400">
            {t('devices_delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Device management hooks — Supabase CRUD for notification_devices table.
 *
 * Table schema (create in Supabase SQL editor):
 *   See docs/push.md — Section "Supabase 设备表配置"
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../../../shared/api/supabase';
import { useAuth } from '../../../providers/AuthProvider';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NotificationDevice {
  id: string;
  user_id: string;
  platform: 'ios' | 'android' | 'web';
  device_name: string | null;
  app_version: string | null;
  onesignal_player_id: string | null;
  is_current_device: boolean;
  is_push_enabled: boolean;
  status: 'active' | 'deleted';
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

// ─── Query keys ─────────────────────────────────────────────────────────────

export const deviceKeys = {
  all: (userId: string) => ['notification_devices', userId] as const,
};

// ─── List devices ────────────────────────────────────────────────────────────

export function useDevices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: deviceKeys.all(user?.id ?? ''),
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_devices')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('is_current_device', { ascending: false })
        .order('last_seen_at', { ascending: false });

      if (error) throw error;
      return data as NotificationDevice[];
    },
    staleTime: 30_000,
  });
}

// ─── Toggle push enabled ─────────────────────────────────────────────────────

export function useToggleDevicePush() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      enabled,
    }: {
      deviceId: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from('notification_devices')
        .update({ is_push_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', deviceId)
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;
    },
    onMutate: async ({ deviceId, enabled }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: deviceKeys.all(user?.id ?? '') });
      const previous = queryClient.getQueryData<NotificationDevice[]>(
        deviceKeys.all(user?.id ?? ''),
      );
      queryClient.setQueryData<NotificationDevice[]>(
        deviceKeys.all(user?.id ?? ''),
        (old) =>
          old?.map((d) =>
            d.id === deviceId ? { ...d, is_push_enabled: enabled } : d,
          ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(deviceKeys.all(user?.id ?? ''), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.all(user?.id ?? '') });
    },
  });
}

// ─── Delete (soft) device ─────────────────────────────────────────────────────

export function useDeleteDevice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('notification_devices')
        .update({
          status: 'deleted',
          is_push_enabled: false,
          is_current_device: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deviceId)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.all(user?.id ?? '') });
    },
  });
}

// ─── Upsert current device ────────────────────────────────────────────────────

export function useUpsertCurrentDevice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      oneSignalPlayerId,
    }: {
      deviceId: string;
      oneSignalPlayerId: string | null;
    }) => {
      const now = new Date().toISOString();
      const appVersion =
        Constants.expoConfig?.version ??
        Constants.manifest2?.extra?.expoClient?.version ??
        null;

      const platform = (Platform.OS === 'ios' || Platform.OS === 'android')
        ? Platform.OS
        : 'web';

      const deviceName =
        Constants.deviceName ??
        (Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android' : 'Web');

      // First: unmark all existing current devices for this user
      await supabase
        .from('notification_devices')
        .update({ is_current_device: false, updated_at: now })
        .eq('user_id', user!.id)
        .eq('is_current_device', true);

      // Then: upsert this device as current
      const { error } = await supabase
        .from('notification_devices')
        .upsert(
          {
            id: deviceId,
            user_id: user!.id,
            platform,
            device_name: deviceName,
            app_version: appVersion,
            onesignal_player_id: oneSignalPlayerId,
            is_current_device: true,
            is_push_enabled: true,
            status: 'active',
            last_seen_at: now,
            created_at: now,
            updated_at: now,
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false,
          },
        );

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.all(user?.id ?? '') });
    },
  });
}

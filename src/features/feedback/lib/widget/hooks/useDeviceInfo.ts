import { useMemo } from 'react';
import { Platform } from 'react-native';
import type { DeviceInfo } from '../types';

/**
 * Minimal device info for the feedback payload. We deliberately avoid
 * pulling react-native-device-info — Platform is enough for `platform`
 * and `osVersion`, and `deviceModel` falls back to "unknown".
 */
export function useDeviceInfo(): DeviceInfo {
  return useMemo<DeviceInfo>(() => {
    const osVersion = String(Platform.Version ?? 'unknown');
    return {
      platform: Platform.OS,
      osVersion,
      deviceModel: 'unknown',
    };
  }, []);
}

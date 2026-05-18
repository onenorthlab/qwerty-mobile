import * as ImagePicker from 'expo-image-picker';
import type { PickedScreenshot } from './widget';

/**
 * Album-backed screenshot picker. Returns base64 (no data: prefix) so the
 * widget's payload-size guard can reject oversized images before we hit the
 * relay. We compress to JPEG-equivalent quality 0.6 and cap the longer edge
 * at 1600 px to keep the relay request well under the 800KB cap.
 */
export async function pickScreenshotFromLibrary(): Promise<PickedScreenshot | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    base64: true,
    quality: 0.6,
    selectionLimit: 1,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.base64) return null;

  return {
    base64: asset.base64,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

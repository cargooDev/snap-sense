import * as MediaLibrary from 'expo-media-library/legacy';
import * as ImagePicker from 'expo-image-picker';
import { SCREENSHOT_ALBUM } from '../config';
import { addIfMissing } from '../db/database';

// Reads the device's "Screenshots" album and copies new entries into our database.
// Returns false if the user refused permission so the UI can offer the fallback.
export async function syncDeviceScreenshots(): Promise<boolean> {
  const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
  if (!permission.granted) return false;

  const album = await MediaLibrary.getAlbumAsync(SCREENSHOT_ALBUM);
  if (!album) return true; // permission fine, device just has no screenshots album yet

  const page = await MediaLibrary.getAssetsAsync({
    album,
    mediaType: 'photo',
    first: 300,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });
  await addIfMissing(page.assets.map((a) => ({ id: a.uri, assetId: a.id, createdAt: a.creationTime })));
  return true;
}

// Fallback when the media library cannot be read (for example inside Expo Go on
// some Android versions): the user picks screenshots by hand.
export async function importFromPicker(): Promise<number> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
  });
  if (result.canceled) return 0;
  await addIfMissing(result.assets.map((a) => ({ id: a.uri, assetId: null, createdAt: Date.now() })));
  return result.assets.length;
}

// Deletes the real file too. The OS shows its own confirmation dialog.
export async function deleteFromDevice(assetId: string | null) {
  if (!assetId) return;
  await MediaLibrary.deleteAssetsAsync([assetId]);
}

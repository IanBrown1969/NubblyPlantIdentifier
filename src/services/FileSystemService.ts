import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync } from 'expo-file-system';
import { Platform } from 'react-native';

const GARDEN_ASSETS_DIR = `${documentDirectory}garden/`;

export const FileSystemService = {
  /**
   * Ensures the permanent garden assets directory exists inside the app document directory.
   */
  async ensureDirectoryExists(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const dirInfo = await getInfoAsync(GARDEN_ASSETS_DIR);
      if (!dirInfo.exists) {
        await makeDirectoryAsync(GARDEN_ASSETS_DIR, { intermediates: true });
        console.log('[FileSystem] Created permanent garden assets directory:', GARDEN_ASSETS_DIR);
      }
    } catch {
      console.error('[FileSystem] Error ensuring directory exists:');
    }
  },

  /**
   * Copies a temporary picture captured from the camera or photo library to permanent storage.
   * Returns the new permanent file URI.
   */
  async savePhotoPermanently(tempUri: string, id: string): Promise<string> {
    // If running on web, we do not need local sandboxed path copying
    if (Platform.OS === 'web' || tempUri.startsWith('http' || tempUri.startsWith('data:'))) {
      return tempUri;
    }

    try {
      await this.ensureDirectoryExists();
      const fileExtension = tempUri.split('.').pop()?.split('?')[0] || 'jpg';
      const permanentUri = `${GARDEN_ASSETS_DIR}${id}.${fileExtension}`;
      
      await copyAsync({
        from: tempUri,
        to: permanentUri,
      });

      console.log('[FileSystem] Successfully saved photo permanently:', permanentUri);
      return permanentUri;
    } catch {
      console.error('[FileSystem] Failed to save photo permanently, falling back to temp URI:');
      return tempUri;
    }
  },

  /**
   * Deletes a permanently saved photo from the app sandbox when a plant card is deleted.
   */
  async deletePhoto(photoUri: string): Promise<boolean> {
    if (Platform.OS === 'web' || !photoUri.startsWith(documentDirectory || '')) {
      return true; // Nothing to delete locally
    }

    try {
      const info = await getInfoAsync(photoUri);
      if (info.exists) {
        await deleteAsync(photoUri, { idempotent: true });
        console.log('[FileSystem] Deleted photo asset:', photoUri);
      }
      return true;
    } catch {
      console.error('[FileSystem] Failed to delete photo asset:');
      return false;
    }
  }
};

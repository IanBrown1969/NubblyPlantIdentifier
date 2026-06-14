import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync, readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
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
    // If running on web, or if URI is a web URL or base64 data URI, bypass sandboxed file copying
    if (Platform.OS === 'web' || tempUri.startsWith('http') || tempUri.startsWith('data:')) {
      return tempUri;
    }

    try {
      await this.ensureDirectoryExists();
      
      // Safely extract the file extension or fallback to 'jpg' for extension-less content:// URIs
      let fileExtension = 'jpg';
      const cleanUri = tempUri.split('?')[0];
      const lastDot = cleanUri.lastIndexOf('.');
      if (lastDot !== -1) {
        const ext = cleanUri.substring(lastDot + 1).toLowerCase();
        if (/^[a-z0-9]{1,4}$/.test(ext)) {
          fileExtension = ext;
        }
      }

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
   * Reads a local URI (file:// or content://) and returns its base64 string representation.
   */
  async readUriAsBase64(uri: string): Promise<string> {
    if (Platform.OS === 'web' || uri.startsWith('http') || uri.startsWith('data:')) {
      return '';
    }
    try {
      console.log('[FileSystem] Reading URI as base64:', uri);
      const base64 = await readAsStringAsync(uri, {
        encoding: EncodingType.Base64,
      });
      return base64;
    } catch (err) {
      console.error('[FileSystem] Failed to read URI as base64:', err);
      return '';
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

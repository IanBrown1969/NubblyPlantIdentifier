import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { ClaudeService } from '../services/ClaudeService';
import { LocationService } from '../services/LocationService';
import { FileSystemService } from '../services/FileSystemService';
import { GardenModel, GardenItem } from '../models/GardenModel';

export type ScanStatus = 'idle' | 'capturing' | 'gps' | 'uploading' | 'analyzing' | 'saving' | 'success' | 'error';

export function useScanController() {
  const { isPremiumAccess, claudeApiKey } = useAuth();
  
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [scanMode, setScanMode] = useState<'identity' | 'diagnosis'>('identity');
  const [telemetryMessage, setTelemetryMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [scannedResult, setScannedResult] = useState<GardenItem | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  /**
   * Safe telemetry visual logger.
   */
  const updateTelemetry = (msg: string, currentProgress: number) => {
    setTelemetryMessage(msg);
    setProgress(currentProgress);
    console.log(`[ScanController] HUD: ${msg} (${Math.round(currentProgress * 100)}%)`);
  };

  /**
   * Resets active scanner parameters.
   */
  const onResetScanner = useCallback(() => {
    setStatus('idle');
    setTelemetryMessage('');
    setProgress(0);
    setScannedResult(null);
    setScanError(null);
    setSelectedImageUri(null);
  }, []);

  /**
   * Master execution flow for plant diagnostic scans.
   */
  const executeScanFlow = async (imageUri: string, base64Data: string | undefined) => {
    setScanError(null);
    setSelectedImageUri(imageUri);
    try {
      let resolvedBase64 = base64Data;
      if (!resolvedBase64) {
        updateTelemetry('Reading local phone storage image data...', 0.15);
        resolvedBase64 = await FileSystemService.readUriAsBase64(imageUri);
      }

      // Fetch GPS coordinates and launch visual Claude AI plant analysis in parallel to bypass sequential waits!
      updateTelemetry('Acquiring GPS discovery coordinates...', 0.25);
      setStatus('gps');

      // Dynamically resolve image MIME type from file extension to satisfy Anthropic image headers
      let ext = 'jpeg';
      const cleanUri = imageUri.split('?')[0];
      const lastDot = cleanUri.lastIndexOf('.');
      if (lastDot !== -1) {
        const parsedExt = cleanUri.substring(lastDot + 1).toLowerCase();
        if (/^[a-z0-9]{1,4}$/.test(parsedExt)) {
          ext = parsedExt;
        }
      }
      const resolvedMime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

      updateTelemetry('Transmitting visual payload to Claude AI...', 0.40);
      setStatus('uploading');

      const [location, claudeProfile] = await Promise.all([
        LocationService.getCurrentLocation(),
        (async () => {
          updateTelemetry('Claude AI is analyzing foliage taxonomy...', 0.55);
          setStatus('analyzing');
          return ClaudeService.identifyPlant(
            resolvedBase64 || '',
            resolvedMime,
            claudeApiKey,
            scanMode
          );
        })(),
      ]);
      const placeName = location?.placeName || 'Unknown Location';

      // 3. Saving & relational mapping inside local database
      updateTelemetry('Writing records to SQLite relational database...', 0.85);
      setStatus('saving');

      const uniqueId = `plant_${Date.now()}`;
      
      // Copy image asset from volatile temporary folders to permanent Document sandbox
      const permanentPhotoUri = await FileSystemService.savePhotoPermanently(imageUri, uniqueId);

      const newGardenItem: GardenItem = {
        id: uniqueId,
        customName: `My ${claudeProfile.commonName}`,
        dateAdded: new Date().toISOString(),
        lastWatered: new Date().toISOString(),
        ...claudeProfile,
        photoUri: permanentPhotoUri,
        discoveryLocation: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          placeName,
        } : undefined
      };

      // Write directly to SQLite database sync
      const dbSuccess = GardenModel.saveItem(newGardenItem);
      if (!dbSuccess) {
        throw new Error('Failed to commit plant care record to SQLite database.');
      }

      // Success state
      setScannedResult(newGardenItem);
      updateTelemetry('Foliage analysis complete! Match saved in library.', 1.0);
      setStatus('success');
    } catch (e: any) {
      console.error('[ScanController] Critical scan sequence failure:', e);
      setScanError(e.message || 'Foliage analysis failed.');
      setStatus('error');
    }
  };

  /**
   * Handler to capture a fresh high-resolution photo using the device camera.
   */
  const onCapturePhoto = async (): Promise<void> => {
    console.log('[ScanController] Handled request: Launch Device Camera');
    
    // Gating check: if free tier user, block scanner and prompt paywall sheet
    if (!isPremiumAccess) {
      setShowPaywall(true);
      return;
    }

    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        setScanError('Camera access scope permissions are required.');
        setStatus('error');
        return;
      }

      setStatus('capturing');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.3,
        base64: true,
        exif: false,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setStatus('idle');
        return;
      }

      const asset = result.assets[0];
      await executeScanFlow(asset.uri, asset.base64 || undefined);
    } catch (err: any) {
      setScanError(err.message || 'Failed to capture photo.');
      setStatus('error');
    }
  };

  /**
   * Handler to select an image from the photo library.
   */
  const onChoosePhoto = async (): Promise<void> => {
    console.log('[ScanController] Handled request: Launch Photo Picker');
    
    // Gating check
    if (!isPremiumAccess) {
      setShowPaywall(true);
      return;
    }

    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        setScanError('Photo library access permissions are required.');
        setStatus('error');
        return;
      }

      setStatus('capturing');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.3,
        base64: true,
        exif: false,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setStatus('idle');
        return;
      }

      const asset = result.assets[0];
      await executeScanFlow(asset.uri, asset.base64 || undefined);
    } catch (err: any) {
      setScanError(err.message || 'Failed to pick photo.');
      setStatus('error');
    }
  };

  /**
   * Bypass pipeline for quick developer testing inside Xcode/Android Simulators.
   * Simulates scanning one of three beautiful preloaded plants.
   */
  const onTriggerSimulatedScan = async (plantType: 'fiddle' | 'jade' | 'fern') => {
    console.log(`[ScanController] Handled developer bypass scan: ${plantType}`);
    
    if (!isPremiumAccess) {
      setShowPaywall(true);
      return;
    }

    setStatus('capturing');
    updateTelemetry('Simulating lens alignment & focal lock...', 0.05);
    
    // Custom mock photo URI assets corresponding to selections
    const mockUris = {
      fiddle: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop',
      jade: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=600&auto=format&fit=crop',
      fern: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=600&auto=format&fit=crop',
    };

    const targetUri = mockUris[plantType];
    await executeScanFlow(targetUri, undefined); // Bypasses base64 to force simulated botanical profiles
  };

  return {
    // Model state outputs
    status,
    scanMode,
    progress,
    telemetryMessage,
    scannedResult,
    selectedImageUri,
    showPaywall,
    scanError,

    // Controller action handlers
    setScanMode,
    onCapturePhoto,
    onChoosePhoto,
    onTriggerSimulatedScan,
    onResetScanner,
    onDismissPaywall: () => setShowPaywall(false),
  };
}

export type ScanControllerType = ReturnType<typeof useScanController>;

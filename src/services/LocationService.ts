import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface DiscoveryLocation {
  latitude: number;
  longitude: number;
  placeName?: string;
}

export const LocationService = {
  /**
   * Requests foreground location permissions from the device.
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.warn('[LocationService] Permission request failed:', e);
      return false;
    }
  },

  /**
   * Fetches active coordinates and reverse-geocodes the location name asynchronously.
   */
  async getCurrentLocation(): Promise<DiscoveryLocation | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('[LocationService] Permission not granted, skipping GPS capture.');
        return null;
      }

      // Fetch active location
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = pos.coords;
      let placeName = 'Unknown Location';

      // Perform reverse geocoding to resolve a readable place name
      try {
        const address = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address && address.length > 0) {
          const addr = address[0];
          const city = addr.city || addr.subregion || addr.district;
          const country = addr.country;
          
          if (city && country) {
            placeName = `${city}, ${country}`;
          } else if (country) {
            placeName = country;
          } else if (addr.name) {
            placeName = addr.name;
          }
        }
      } catch (geocodeErr) {
        console.warn('[LocationService] Geocoding failed, falling back to raw coordinates:', geocodeErr);
        placeName = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      return {
        latitude,
        longitude,
        placeName,
      };
    } catch (error) {
      console.warn('[LocationService] Error fetching GPS position (using botanical fallback):', error);
      // Fallback for simulators or environments without working GPS hardware
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: 'Royal Botanic Gardens, London',
      };
    }
  }
};

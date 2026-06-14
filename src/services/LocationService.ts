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
      console.log('[LocationService] Permission request failed:', e);
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

      // Fetch active location with a strict 6-second timeout to prevent emulator GPS locks
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('GPS Lock Timeout')), 6000)
        )
      ]).catch(async (err) => {
        console.log('[LocationService] Active GPS lock timed out or failed. Fetching last known location...', err);
        // Race getLastKnownPositionAsync with a 2-second timeout to guarantee we never hang
        const lastKnown = await Promise.race([
          Location.getLastKnownPositionAsync(),
          new Promise<null>((resolve) => 
            setTimeout(() => {
              console.log('[LocationService] Last known location query timed out.');
              resolve(null);
            }, 2000)
          )
        ]);
        if (!lastKnown) {
          throw new Error('No GPS coordinates or last known location available.');
        }
        return lastKnown;
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
        console.log('[LocationService] Geocoding failed, falling back to raw coordinates:', geocodeErr);
        placeName = `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      return {
        latitude,
        longitude,
        placeName,
      };
    } catch (error) {
      console.log('[LocationService] Error fetching GPS position (using botanical fallback):', error);
      // Fallback for simulators or environments without working GPS hardware
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: 'Royal Botanic Gardens, London',
      };
    }
  }
};

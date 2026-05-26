import { useState, useEffect, useCallback } from 'react';
import { GardenModel, GardenItem, WishlistItem } from '../models/GardenModel';
import { LocationService } from '../services/LocationService';
import { FileSystemService } from '../services/FileSystemService';

export function useWishlistController() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Loads wishlist checklist entries reactively.
   */
  const loadWishlist = useCallback(() => {
    setLoading(true);
    try {
      const items = GardenModel.getWishlist();
      setWishlist(items);
    } catch (e) {
      console.error('[WishlistController] Error loading wishlist items:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWishlist();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWishlist]);

  /**
   * Action handler: Toggles the bought checkbox status.
   */
  const onToggleBought = async (id: string, isBought: boolean): Promise<boolean> => {
    console.log(`[WishlistController] Toggling bought status for: ${id} to ${isBought}`);
    const success = GardenModel.toggleWishlistBought(id, isBought);
    if (success) {
      loadWishlist();
    }
    return success;
  };

  /**
   * Action handler: Deletes an item from the shopping list.
   */
  const onRemoveItem = async (id: string): Promise<boolean> => {
    console.log(`[WishlistController] Removing item: ${id}`);
    const success = GardenModel.deleteFromWishlist(id);
    if (success) {
      loadWishlist();
    }
    return success;
  };

  /**
   * Action handler: Imports a purchased wishlist item into the active garden collection!
   */
  const onImportToGarden = async (item: WishlistItem, nickname?: string): Promise<boolean> => {
    console.log(`[WishlistController] Importing purchased wishlist item to Garden: ${item.commonName}`);
    try {
      setLoading(true);
      
      // Get geocoded capture location
      const loc = await LocationService.getCurrentLocation();
      const placeName = loc?.placeName || 'Purchased Location';

      const uniqueId = `plant_${Date.now()}`;
      const name = nickname?.trim() || `My ${item.commonName}`;
      const nowStr = new Date().toISOString();

      // Copy image sandbox files permanently
      let permanentUri = item.photoUri;
      if (item.photoUri.startsWith('http') || item.photoUri.includes('tmp')) {
        permanentUri = await FileSystemService.savePhotoPermanently(item.photoUri, uniqueId);
      }

      const newGardenItem: GardenItem = {
        id: uniqueId,
        customName: name,
        dateAdded: nowStr,
        lastWatered: nowStr,
        commonName: item.commonName,
        botanicalName: item.botanicalName,
        family: 'Asparagaceae', // Seeding placeholder
        description: `Purchased seed catalog profile for ${item.commonName}.`,
        waterIntervalDays: item.waterIntervalDays,
        sunlight: 'Medium Indirect Sun',
        temperature: '15°C - 25°C',
        isPetSafe: true,
        careGuide: {
          watering: 'Water when soil is dry.',
          sunlight: 'Indirect light.',
          temperature: 'Protect from heavy winter cold.',
          soil: 'Well draining loam mix.',
          fertilizer: 'Fertilize lightly once in spring.',
          troubleshooting: [{ symptom: 'Yellowing', cause: 'Wet roots', solution: 'Dry out.' }]
        },
        photoUri: permanentUri,
        discoveryLocation: loc ? {
          latitude: loc.latitude,
          longitude: loc.longitude,
          placeName
        } : undefined
      };

      const saveSuccess = GardenModel.saveItem(newGardenItem);
      if (saveSuccess) {
        // Purge from wishlist after active library import
        GardenModel.deleteFromWishlist(item.id);
        loadWishlist();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[WishlistController] Failed to import item to Garden collection:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    wishlist,
    loading,
    onToggleBought,
    onRemoveItem,
    onImportToGarden,
    onRefresh: loadWishlist,
  };
}

export type WishlistControllerType = ReturnType<typeof useWishlistController>;

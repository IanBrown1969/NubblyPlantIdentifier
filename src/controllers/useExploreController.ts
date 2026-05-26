import { useState, useEffect, useCallback } from 'react';
import { PlantModel, Plant } from '../models/PlantModel';
import { GardenModel } from '../models/GardenModel';

export function useExploreController() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Array of filter chips to display on the Explore screen
  const filterCategories = ['All', 'Succulent', 'Low Light', 'Pet Safe'];

  // Reactively compute search results directly during render phase
  const filteredPlants = PlantModel.search(searchQuery, selectedFilter);

  /**
   * Refreshes the local wishlist IDs registry.
   */
  const loadWishlistIds = useCallback(() => {
    try {
      const items = GardenModel.getWishlist();
      setWishlistIds(items.map(i => i.id));
    } catch (e) {
      console.error('[ExploreController] Failed to load wishlist status:', e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWishlistIds();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWishlistIds]);

  /**
   * Action handler: Toggles a plant profile in the Nurseries Wishlist checklist.
   */
  const onToggleWishlist = async (plant: Plant) => {
    console.log(`[ExploreController] Toggling wishlist status for: ${plant.commonName}`);
    try {
      const isAlreadyIn = wishlistIds.includes(plant.id);
      if (isAlreadyIn) {
        GardenModel.deleteFromWishlist(plant.id);
      } else {
        GardenModel.addToWishlist({
          id: plant.id,
          commonName: plant.commonName,
          botanicalName: plant.botanicalName,
          photoUri: plant.photoUri,
          waterIntervalDays: plant.waterIntervalDays,
        });
      }
      loadWishlistIds(); // Re-sync local states
    } catch (err) {
      console.error('[ExploreController] Failed to toggle plant wishlist:', err);
    }
  };

  return {
    // Model state outputs
    searchQuery,
    selectedFilter,
    filteredPlants,
    filterCategories,
    wishlistIds,

    // Controller action handlers
    onSearchChange: (text: string) => {
      setSearchQuery(text);
    },
    
    onFilterSelect: (category: string) => {
      console.log(`[ExploreController] Handled filter select: ${category}`);
      setSelectedFilter(category);
    },

    onResetFilters: () => {
      setSearchQuery('');
      setSelectedFilter('All');
    },

    onToggleWishlist,
    onRefreshWishlist: loadWishlistIds,
  };
}

export type ExploreControllerType = ReturnType<typeof useExploreController>;

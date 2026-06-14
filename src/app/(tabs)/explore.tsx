import React from 'react';
import { useExploreController } from '../../controllers/useExploreController';
import { ExploreView } from '../../views/screens/ExploreView';

/**
 * Explore Search Tab Routing Entry.
 * Glues the useExploreController business hook to the ExploreView screen.
 */
export default function ExploreRoute() {
  const controller = useExploreController();

  return (
    <ExploreView
      searchQuery={controller.searchQuery}
      selectedFilter={controller.selectedFilter}
      filteredPlants={controller.filteredPlants}
      filterCategories={controller.filterCategories}
      wishlistIds={controller.wishlistIds}
      onSearchChange={controller.onSearchChange}
      onFilterSelect={controller.onFilterSelect}
      onResetFilters={controller.onResetFilters}
      onToggleWishlist={controller.onToggleWishlist}
    />
  );
}

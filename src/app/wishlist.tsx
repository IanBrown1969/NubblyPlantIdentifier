import React from 'react';
import { useRouter } from 'expo-router';
import { useWishlistController } from '../controllers/useWishlistController';
import { WishlistView } from '../views/screens/WishlistView';

/**
 * Nursery Shopping Wishlist Checklist Route Entry.
 * Glues useWishlistController actions to WishlistView.
 */
export default function WishlistRoute() {
  const router = useRouter();
  const controller = useWishlistController();

  return (
    <WishlistView
      loading={controller.loading}
      wishlist={controller.wishlist}
      onToggleBought={controller.onToggleBought}
      onRemoveItem={controller.onRemoveItem}
      onImportToGarden={controller.onImportToGarden}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      }}
    />
  );
}

import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlantDetailController } from '../../controllers/usePlantDetailController';
import { PlantDetailView } from '../../views/screens/PlantDetailView';

/**
 * Dynamic Plant Care Sheet Routing Entry.
 * Retrieves route path search params and glues the detailed controller hooks to the screen.
 */
export default function PlantDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fallback to avoid empty states
  const targetId = id || 'monstera-deliciosa';
  const controller = usePlantDetailController(targetId);

  return (
    <PlantDetailView
      loading={controller.loading}
      isSavedInGarden={controller.isSavedInGarden}
      plantDetails={controller.plantDetails}
      wateringLogs={controller.wateringLogs}
      progressLogs={controller.progressLogs}
      hydrationPercentage={controller.hydrationPercentage}
      daysRemaining={controller.daysRemaining}
      isOverdue={controller.isOverdue}
      onWaterPlant={controller.onWaterPlant}
      onAddToGarden={controller.onAddToGarden}
      onDeleteFromGarden={async () => {
        const success = await controller.onDeleteFromGarden();
        if (success) {
          router.back(); // Redirect back to Garden list on deletions success
        }
        return success;
      }}
      onAddProgressLog={controller.onAddProgressLog}
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

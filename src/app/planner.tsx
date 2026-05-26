import React from 'react';
import { useRouter } from 'expo-router';
import { usePlannerController } from '../controllers/usePlannerController';
import { PlannerView } from '../views/screens/PlannerView';

/**
 * Garden Bed Grid Planner Route Entry.
 * Glues usePlannerController actions to PlannerView.
 */
export default function PlannerRoute() {
  const router = useRouter();
  const controller = usePlannerController();

  return (
    <PlannerView
      loading={controller.loading}
      grid={controller.grid}
      selectedCell={controller.selectedCell}
      gardenList={controller.gardenList}
      catalogList={controller.catalogList}
      setSelectedCell={controller.setSelectedCell}
      onPlacePlant={controller.onPlacePlant}
      onClearGrid={controller.onClearGrid}
      getCellCompatibility={controller.getCellCompatibility}
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

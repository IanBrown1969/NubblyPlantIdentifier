import React from 'react';
import { useHomeController } from '../../controllers/useHomeController';
import { HomeView } from '../../views/screens/HomeView';

/**
 * Primary Home Tab Routing Entry.
 * Glues the useHomeController business hook to the HomeView screen.
 */
export default function HomeRoute() {
  const controller = useHomeController();

  return (
    <HomeView
      gardenList={controller.gardenList}
      stats={controller.stats}
      weather={controller.weather}
      refreshing={controller.refreshing}
      onRefresh={controller.onRefresh}
      onWaterPlant={controller.onWaterPlant}
      onDeletePlant={controller.onDeletePlant}
      widgetOrder={controller.widgetOrder}
      visibleWidgets={controller.visibleWidgets}
      isEditingWidgets={controller.isEditingWidgets}
      onToggleWidgetVisibility={controller.onToggleWidgetVisibility}
      onMoveWidgetUp={controller.onMoveWidgetUp}
      onMoveWidgetDown={controller.onMoveWidgetDown}
      onToggleEditWidgetsMode={controller.onToggleEditWidgetsMode}
    />
  );
}

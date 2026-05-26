import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GardenModel, GardenItem } from '../models/GardenModel';
import { FileSystemService } from '../services/FileSystemService';
import { LocationService } from '../services/LocationService';
import { WeatherService, WeatherTelemetry } from '../services/WeatherService';

export interface GardenDashboardStats {
  totalCount: number;
  thirstyCount: number;
  overdueCount: number;
  nextCareItemName: string | null;
  nextCareItemDays: number | null;
  nextCareItemId: string | null;
}

function computeCareStats(items: GardenItem[]): GardenDashboardStats {
  let thirstyCount = 0;
  let overdueCount = 0;
  let nextCareItemName: string | null = null;
  let nextCareItemId: string | null = null;
  let minDaysRemaining = Infinity;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  items.forEach(item => {
    // Calculate next water date
    const lastWateredDate = new Date(item.lastWatered);
    lastWateredDate.setHours(0, 0, 0, 0);

    const nextWaterDate = new Date(lastWateredDate);
    nextWaterDate.setDate(lastWateredDate.getDate() + item.waterIntervalDays);

    const diffTime = nextWaterDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      thirstyCount++;
      if (diffDays < 0) {
        overdueCount++;
      }
    }

    // Identify closest upcoming task
    if (diffDays < minDaysRemaining) {
      minDaysRemaining = diffDays;
      nextCareItemName = item.customName || item.commonName;
      nextCareItemId = item.id;
    }
  });

  return {
    totalCount: items.length,
    thirstyCount,
    overdueCount,
    nextCareItemName: items.length > 0 ? nextCareItemName : null,
    nextCareItemDays: items.length > 0 ? (minDaysRemaining === Infinity ? 0 : minDaysRemaining) : null,
    nextCareItemId: items.length > 0 ? nextCareItemId : null,
  };
}

export function useHomeController() {
  const [gardenList, setGardenList] = useState<GardenItem[]>(() => {
    try {
      return GardenModel.getAllItems();
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState<GardenDashboardStats>(() => {
    try {
      return computeCareStats(GardenModel.getAllItems());
    } catch {
      return {
        totalCount: 0,
        thirstyCount: 0,
        overdueCount: 0,
        nextCareItemName: null,
        nextCareItemDays: null,
        nextCareItemId: null,
      };
    }
  });

  const [weather, setWeather] = useState<WeatherTelemetry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Phase 7 Customisable Widgets Dashboard States
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['weather', 'status', 'tools', 'library']);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    weather: true,
    status: true,
    tools: true,
    library: true,
  });
  const [isEditingWidgets, setIsEditingWidgets] = useState(false);

  /**
   * Restores dashboard widget parameters.
   */
  const loadWidgetPrefs = useCallback(async () => {
    try {
      const order = await SecureStore.getItemAsync('nubbly_home_widget_order');
      const visibility = await SecureStore.getItemAsync('nubbly_home_widget_visibility');
      if (order) setWidgetOrder(JSON.parse(order));
      if (visibility) setVisibleWidgets(JSON.parse(visibility));
    } catch (e) {
      console.warn('[HomeController] Failed to restore widget arrangements:', e);
    }
  }, []);

  /**
   * Loads localized geocoded weather conditions asynchronously in the background.
   */
  const loadWeather = useCallback(async () => {
    try {
      const loc = await LocationService.getCurrentLocation();
      const place = loc?.placeName || 'Royal Botanic Gardens, London';
      const lat = loc?.latitude || 51.5074;
      const lon = loc?.longitude || -0.1278;
      const data = await WeatherService.getLocalWeather(lat, lon, place);
      setWeather(data);
    } catch (e) {
      console.warn('[HomeController] Failed to load weather telemetry:', e);
    }
  }, []);

  /**
   * Refreshes and recalculates dashboard care analytics.
   */
  const loadGardenData = useCallback(() => {
    setRefreshing(true);
    try {
      const items = GardenModel.getAllItems();
      setGardenList(items);
      setStats(computeCareStats(items));
      loadWeather(); // Trigger background weather sync
      loadWidgetPrefs();
    } catch (e) {
      console.error('[HomeController] Failed to compute garden analytics:', e);
    } finally {
      setRefreshing(false);
    }
  }, [loadWeather, loadWidgetPrefs]);

  // Initial load loaded async to bypass set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadGardenData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadGardenData]);

  /**
   * Records a watering event synchronously, recalculating stats immediately.
   */
  const onWaterPlant = async (id: string): Promise<boolean> => {
    console.log(`[HomeController] Handled request: Water plant instance id: ${id}`);
    const timestamp = new Date().toISOString();
    const success = GardenModel.recordWaterEvent(id, timestamp);
    if (success) {
      loadGardenData(); // Refresh UI synchronously
    }
    return success;
  };

  /**
   * Deletes a plant item completely (removing photo references from sandbox disk).
   */
  const onDeletePlant = async (id: string): Promise<boolean> => {
    console.log(`[HomeController] Handled request: Remove plant instance id: ${id}`);
    const item = GardenModel.getItemById(id);
    if (!item) return false;

    // Remove SQLite record
    const dbSuccess = GardenModel.deleteItem(id);
    if (dbSuccess) {
      // Remove disk photo asset async
      await FileSystemService.deletePhoto(item.photoUri);
      loadGardenData(); // Refresh UI
      return true;
    }
    return false;
  };

  /**
   * Action: Swaps layout widget visibilities.
   */
  const onToggleWidgetVisibility = async (widgetId: string) => {
    const updated = { ...visibleWidgets, [widgetId]: !visibleWidgets[widgetId] };
    setVisibleWidgets(updated);
    await SecureStore.setItemAsync('nubbly_home_widget_visibility', JSON.stringify(updated));
  };

  /**
   * Action: Swaps layout widget arrangements upwards.
   */
  const onMoveWidgetUp = async (widgetId: string) => {
    const idx = widgetOrder.indexOf(widgetId);
    if (idx <= 0) return;
    const newOrder = [...widgetOrder];
    newOrder[idx] = newOrder[idx - 1];
    newOrder[idx - 1] = widgetId;
    setWidgetOrder(newOrder);
    await SecureStore.setItemAsync('nubbly_home_widget_order', JSON.stringify(newOrder));
  };

  /**
   * Action: Swaps layout widget arrangements downwards.
   */
  const onMoveWidgetDown = async (widgetId: string) => {
    const idx = widgetOrder.indexOf(widgetId);
    if (idx < 0 || idx >= widgetOrder.length - 1) return;
    const newOrder = [...widgetOrder];
    newOrder[idx] = newOrder[idx + 1];
    newOrder[idx + 1] = widgetId;
    setWidgetOrder(newOrder);
    await SecureStore.setItemAsync('nubbly_home_widget_order', JSON.stringify(newOrder));
  };

  return {
    // Model state outputs
    gardenList,
    stats,
    weather,
    refreshing,
    
    // Phase 7 Custom Dashboard
    widgetOrder,
    visibleWidgets,
    isEditingWidgets,

    // Controller handlers
    onRefresh: loadGardenData,
    onWaterPlant,
    onDeletePlant,
    onToggleWidgetVisibility,
    onMoveWidgetUp,
    onMoveWidgetDown,
    onToggleEditWidgetsMode: () => setIsEditingWidgets(prev => !prev),
  };
}

export type HomeControllerType = ReturnType<typeof useHomeController>;

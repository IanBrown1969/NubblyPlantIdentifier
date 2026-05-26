import { useState, useEffect, useCallback } from 'react';
import { GardenModel, GardenItem, PlantProgressLog } from '../models/GardenModel';
import { PlantModel, Plant } from '../models/PlantModel';
import { LocationService } from '../services/LocationService';
import { FileSystemService } from '../services/FileSystemService';

export function usePlantDetailController(plantId: string) {
  const [activeItem, setActiveItem] = useState<GardenItem | null>(null);
  const [staticPlant, setStaticPlant] = useState<Plant | null>(null);
  const [wateringLogs, setWateringLogs] = useState<string[]>([]);
  const [progressLogs, setProgressLogs] = useState<PlantProgressLog[]>([]);
  const [isSavedInGarden, setIsSavedInGarden] = useState(false);
  const [loading, setLoading] = useState(true);

  // Care Metric Calculations
  const [hydrationPercentage, setHydrationPercentage] = useState(100);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  /**
   * Loads plant schemas from SQLite or static Catalog databases reactively.
   */
  const loadPlantDetails = useCallback(() => {
    setLoading(true);
    try {
      // 1. Search in user's personal SQLite Garden
      const dbItem = GardenModel.getItemById(plantId);
      if (dbItem) {
        setActiveItem(dbItem);
        setStaticPlant(null);
        setIsSavedInGarden(true);
        
        // Fetch historical relational logs
        const logs = GardenModel.getWateringLogs(plantId);
        setWateringLogs(logs);

        // Fetch growth diary progress logs
        const pLogs = GardenModel.getProgressLogs(plantId);
        setProgressLogs(pLogs);

        // Compute Hydration percentages
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const lastWateredDate = new Date(dbItem.lastWatered);
        lastWateredDate.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - lastWateredDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Days since last watered

        const remaining = dbItem.waterIntervalDays - diffDays;
        setDaysRemaining(remaining);
        setIsOverdue(remaining < 0);

        const pct = Math.max(0, Math.min(100, Math.round((remaining / dbItem.waterIntervalDays) * 100)));
        setHydrationPercentage(pct);
      } else {
        // 2. Search in preloaded Encyclopedia instead
        const staticItem = PlantModel.getById(plantId);
        if (staticItem) {
          setStaticPlant(staticItem);
          setActiveItem(null);
          setIsSavedInGarden(false);
          setHydrationPercentage(100);
          setDaysRemaining(staticItem.waterIntervalDays);
          setIsOverdue(false);
          setProgressLogs([]);
        }
      }
    } catch (e) {
      console.error('[PlantDetailController] Error loading plant context details:', e);
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  // Initial load loaded async to bypass set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlantDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPlantDetails]);

  /**
   * Action handler: Records a watering event for a garden instance in SQLite.
   */
  const onWaterPlant = async (): Promise<boolean> => {
    if (!isSavedInGarden || !activeItem) return false;
    console.log(`[PlantDetailController] Handled request: Water plant: ${activeItem.customName}`);

    const timestamp = new Date().toISOString();
    const success = GardenModel.recordWaterEvent(plantId, timestamp);
    if (success) {
      loadPlantDetails(); // Recalculate stats dynamically
    }
    return success;
  };

  /**
   * Action handler: Adds a static catalog plant into the user's personal garden database.
   */
  const onAddToGarden = async (nickname?: string): Promise<boolean> => {
    if (isSavedInGarden || !staticPlant) return false;
    console.log(`[PlantDetailController] Handled request: Import static plant to personal Garden SQLite`);

    try {
      setLoading(true);
      // Fetch GPS coordinates at time of garden catalog addition
      const gpsLocation = await LocationService.getCurrentLocation();
      const placeName = gpsLocation?.placeName || 'Indoor Garden';

      const uniqueId = `plant_${Date.now()}`;
      const name = nickname?.trim() || `My ${staticPlant.commonName}`;
      const nowStr = new Date().toISOString();

      // Copy template image URI permanently into user document directory sandbox
      const permanentUri = await FileSystemService.savePhotoPermanently(staticPlant.photoUri, uniqueId);

      const newGardenItem: GardenItem = {
        id: uniqueId,
        customName: name,
        dateAdded: nowStr,
        lastWatered: nowStr,
        ...staticPlant,
        photoUri: permanentUri,
        discoveryLocation: gpsLocation ? {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          placeName,
        } : undefined
      };

      const success = GardenModel.saveItem(newGardenItem);
      if (success) {
        // Redirect controller binding target to the new database ID!
        // We trigger state reload to bind onto the newly generated SQLite card.
        console.log(`[PlantDetailController] Saved new item to SQLite, mapping active ID: ${uniqueId}`);
        loadPlantDetails(); 
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PlantDetailController] Failed to add item to garden database:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action handler: Removes this plant card from SQLite, clearing files.
   */
  const onDeleteFromGarden = async (): Promise<boolean> => {
    if (!isSavedInGarden || !activeItem) return false;
    console.log(`[PlantDetailController] Handled request: Remove plant instance: ${activeItem.customName}`);

    // Remove associated progress photos first
    const pLogs = GardenModel.getProgressLogs(plantId);
    for (const log of pLogs) {
      await FileSystemService.deletePhoto(log.photoUri);
    }

    const dbSuccess = GardenModel.deleteItem(plantId);
    if (dbSuccess) {
      await FileSystemService.deletePhoto(activeItem.photoUri);
      loadPlantDetails(); // Re-evaluates to static catalog state
      return true;
    }
    return false;
  };

  /**
   * Action handler: Adds a new growth timeline entry with a photo and short notes.
   */
  const onAddProgressLog = async (photoUri: string, notes: string): Promise<boolean> => {
    if (!isSavedInGarden) return false;
    console.log(`[PlantDetailController] Adding progress log for plant: ${plantId}`);

    try {
      const logId = `progress_${Date.now()}`;
      const permanentUri = await FileSystemService.savePhotoPermanently(photoUri, logId);
      
      const newLog: PlantProgressLog = {
        id: logId,
        gardenItemId: plantId,
        timestamp: new Date().toISOString(),
        photoUri: permanentUri,
        notes: notes.trim(),
      };

      const success = GardenModel.saveProgressLog(newLog);
      if (success) {
        loadPlantDetails();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[PlantDetailController] Error adding progress log:', err);
      return false;
    }
  };

  // Expose unified presentational schema values
  const plantDetails = activeItem || staticPlant;

  return {
    // Model state outputs
    loading,
    isSavedInGarden,
    plantDetails,
    wateringLogs,
    progressLogs,
    hydrationPercentage,
    daysRemaining,
    isOverdue,

    // Controller action handlers
    onWaterPlant,
    onAddToGarden,
    onDeleteFromGarden,
    onAddProgressLog,
    onRefresh: loadPlantDetails,
  };
}

export type PlantDetailControllerType = ReturnType<typeof usePlantDetailController>;

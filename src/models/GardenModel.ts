import { db } from './Database';
import { PlantCareGuide } from './PlantModel';

export interface GardenItem {
  id: string;
  customName: string;
  dateAdded: string;
  lastWatered: string;
  commonName: string;
  botanicalName: string;
  family: string;
  description: string;
  waterIntervalDays: number;
  sunlight: string;
  temperature: string;
  isPetSafe: boolean;
  careGuide: PlantCareGuide;
  photoUri: string;
  discoveryLocation?: {
    latitude: number;
    longitude: number;
    placeName?: string;
  };
  
  // Phase 5 Seasonal scheduling
  pruningMonth?: number;
  fertilizingMonth?: number;

  // Phase 6 Diagnosis reports
  healthStatus?: 'Healthy' | 'Diseased';
  diagnosedIssue?: string;
  confidencePct?: number;
  symptomDescription?: string;
  organicTreatment?: string;
}

export interface WateringLog {
  id: string;
  gardenItemId: string;
  timestamp: string;
}

export interface PlantProgressLog {
  id: string;
  gardenItemId: string;
  timestamp: string;
  photoUri: string;
  notes: string;
}

export interface WishlistItem {
  id: string;
  commonName: string;
  botanicalName: string;
  photoUri: string;
  waterIntervalDays: number;
  isBought: boolean;
}

// Database schema row mapping interfaces
interface GardenItemRow {
  id: string;
  custom_name: string;
  date_added: string;
  last_watered: string;
  common_name: string;
  botanical_name: string;
  family: string;
  description: string;
  water_interval_days: number;
  sunlight: string;
  temperature: string;
  is_pet_safe: number; // SQLite uses 0 or 1
  care_guide_json: string;
  photo_uri: string;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  
  // Phase 5 & 6 Row mapping updates
  pruning_month: number | null;
  fertilizing_month: number | null;
  health_status: string | null;
  diagnosed_issue: string | null;
  confidence_pct: number | null;
  symptom_description: string | null;
  organic_treatment: string | null;
}

export const GardenModel = {
  /**
   * Translates a SQLite row into a clean structured GardenItem object.
   */
  mapRowToItem(row: GardenItemRow): GardenItem {
    let careGuide: PlantCareGuide = {
      watering: '',
      sunlight: '',
      temperature: '',
      soil: '',
      fertilizer: '',
      troubleshooting: [],
    };

    try {
      if (row.care_guide_json) {
        careGuide = JSON.parse(row.care_guide_json);
      }
    } catch (e) {
      console.log('[GardenModel] Failed to parse care_guide_json:', e);
    }

    const item: GardenItem = {
      id: row.id,
      customName: row.custom_name,
      dateAdded: row.date_added,
      lastWatered: row.last_watered,
      commonName: row.common_name,
      botanicalName: row.botanical_name,
      family: row.family,
      description: row.description,
      waterIntervalDays: row.water_interval_days,
      sunlight: row.sunlight,
      temperature: row.temperature,
      isPetSafe: row.is_pet_safe === 1,
      photoUri: row.photo_uri,
      careGuide,
      
      // Phase 5 & 6 mapping
      pruningMonth: row.pruning_month !== null ? row.pruning_month : undefined,
      fertilizingMonth: row.fertilizing_month !== null ? row.fertilizing_month : undefined,
      healthStatus: (row.health_status as 'Healthy' | 'Diseased') || 'Healthy',
      diagnosedIssue: row.diagnosed_issue || undefined,
      confidencePct: row.confidence_pct !== null ? row.confidence_pct : undefined,
      symptomDescription: row.symptom_description || undefined,
      organicTreatment: row.organic_treatment || undefined,
    };

    if (row.latitude !== null && row.longitude !== null) {
      item.discoveryLocation = {
        latitude: row.latitude,
        longitude: row.longitude,
        placeName: row.place_name || undefined,
      };
    }

    return item;
  },

  /**
   * Retrieves all saved plant entries from SQLite database ordered by discovery date.
   */
  getAllItems(): GardenItem[] {
    try {
      const rows = db.getAllSync<GardenItemRow>(
        'SELECT * FROM garden_items ORDER BY date_added DESC'
      );
      return rows.map(this.mapRowToItem);
    } catch (error) {
      console.error('[GardenModel] Error getting all items:', error);
      return [];
    }
  },

  /**
   * Finds a specific saved plant by its unique instance ID.
   */
  getItemById(id: string): GardenItem | null {
    try {
      const row = db.getFirstSync<GardenItemRow>(
        'SELECT * FROM garden_items WHERE id = ?',
        id
      );
      return row ? this.mapRowToItem(row) : null;
    } catch (error) {
      console.error('[GardenModel] Error getting item by ID:', error);
      return null;
    }
  },

  /**
   * Saves a new plant item or overwrites an existing item in the SQLite database.
   */
  saveItem(item: GardenItem): boolean {
    try {
      const isPetSafeInt = item.isPetSafe ? 1 : 0;
      const careGuideStr = JSON.stringify(item.careGuide);
      const lat = item.discoveryLocation?.latitude ?? null;
      const lon = item.discoveryLocation?.longitude ?? null;
      const place = item.discoveryLocation?.placeName ?? null;

      db.runSync(
        `INSERT OR REPLACE INTO garden_items (
          id, custom_name, date_added, last_watered, common_name, botanical_name,
          family, description, water_interval_days, sunlight, temperature, is_pet_safe,
          care_guide_json, photo_uri, latitude, longitude, place_name,
          pruning_month, fertilizing_month, health_status, diagnosed_issue, confidence_pct,
          symptom_description, organic_treatment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.id,
        item.customName,
        item.dateAdded,
        item.lastWatered,
        item.commonName,
        item.botanicalName,
        item.family,
        item.description,
        item.waterIntervalDays,
        item.sunlight,
        item.temperature,
        isPetSafeInt,
        careGuideStr,
        item.photoUri,
        lat,
        lon,
        place,
        item.pruningMonth ?? null,
        item.fertilizingMonth ?? null,
        item.healthStatus || 'Healthy',
        item.diagnosedIssue ?? null,
        item.confidencePct ?? null,
        item.symptomDescription ?? null,
        item.organicTreatment ?? null
      );
      return true;
    } catch (error) {
      console.error('[GardenModel] Error saving garden item:', error);
      return false;
    }
  },

  /**
   * Records a historical watering event in SQLite, and updates the last_watered column.
   */
  recordWaterEvent(id: string, timestamp: string): boolean {
    try {
      // Begin local SQL Transaction
      db.runSync('UPDATE garden_items SET last_watered = ? WHERE id = ?', timestamp, id);
      
      const logId = `${id}_${Date.now()}`;
      db.runSync(
        'INSERT INTO watering_logs (id, garden_item_id, timestamp) VALUES (?, ?, ?)',
        logId,
        id,
        timestamp
      );
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to record water event:', error);
      return false;
    }
  },

  /**
   * Retrieves all watering timestamps for a specific plant instance.
   */
  getWateringLogs(itemId: string): string[] {
    try {
      const logs = db.getAllSync<{ timestamp: string }>(
        'SELECT timestamp FROM watering_logs WHERE garden_item_id = ? ORDER BY timestamp DESC',
        itemId
      );
      return logs.map(l => l.timestamp);
    } catch (error) {
      console.error('[GardenModel] Error getting water logs:', error);
      return [];
    }
  },

  /**
   * Deletes a plant item from the garden database (cascades logs automatically).
   */
  deleteItem(id: string): boolean {
    try {
      db.runSync('DELETE FROM garden_items WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to delete garden item:', error);
      return false;
    }
  },

  /**
   * Retrieves all chronological growth logs recorded for a plant.
   */
  getProgressLogs(itemId: string): PlantProgressLog[] {
    try {
      const rows = db.getAllSync<{ id: string; garden_item_id: string; timestamp: string; photo_uri: string; notes: string }>(
        'SELECT * FROM plant_progress_logs WHERE garden_item_id = ? ORDER BY timestamp DESC',
        itemId
      );
      return rows.map(r => ({
        id: r.id,
        gardenItemId: r.garden_item_id,
        timestamp: r.timestamp,
        photoUri: r.photo_uri,
        notes: r.notes,
      }));
    } catch (error) {
      console.error('[GardenModel] Failed to retrieve progress logs:', error);
      return [];
    }
  },

  /**
   * Saves a new growth log / time-series image & journal entry in SQLite.
   */
  saveProgressLog(log: PlantProgressLog): boolean {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO plant_progress_logs (id, garden_item_id, timestamp, photo_uri, notes)
         VALUES (?, ?, ?, ?, ?)`,
        log.id,
        log.gardenItemId,
        log.timestamp,
        log.photoUri,
        log.notes
      );
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to save progress log:', error);
      return false;
    }
  },

  /**
   * Removes a specific progress log entry.
   */
  deleteProgressLog(id: string): boolean {
    try {
      db.runSync('DELETE FROM plant_progress_logs WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to delete progress log:', error);
      return false;
    }
  },

  /**
   * Retrieves all nursery shopping items from the SQLite database.
   */
  getWishlist(): WishlistItem[] {
    try {
      const rows = db.getAllSync<{ id: string; common_name: string; botanical_name: string; photo_uri: string; water_interval_days: number; is_bought: number }>(
        'SELECT * FROM wishlist_items ORDER BY is_bought ASC, common_name ASC'
      );
      return rows.map(r => ({
        id: r.id,
        commonName: r.common_name,
        botanicalName: r.botanical_name,
        photoUri: r.photo_uri,
        waterIntervalDays: r.water_interval_days,
        isBought: r.is_bought === 1,
      }));
    } catch (error) {
      console.error('[GardenModel] Failed to query wishlist database items:', error);
      return [];
    }
  },

  /**
   * Adds an item to the nurseries shopping wishlist.
   */
  addToWishlist(item: Omit<WishlistItem, 'isBought'>): boolean {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO wishlist_items (id, common_name, botanical_name, photo_uri, water_interval_days, is_bought)
         VALUES (?, ?, ?, ?, ?, 0)`,
        item.id,
        item.commonName,
        item.botanicalName,
        item.photoUri,
        item.waterIntervalDays
      );
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to add item to SQLite wishlist:', error);
      return false;
    }
  },

  /**
   * Toggles the purchased status of a wishlist checklist item.
   */
  toggleWishlistBought(id: string, isBought: boolean): boolean {
    try {
      db.runSync(
        'UPDATE wishlist_items SET is_bought = ? WHERE id = ?',
        isBought ? 1 : 0,
        id
      );
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to toggle wishlist bought status:', error);
      return false;
    }
  },

  /**
   * Deletes a checklist item from the wishlist database.
   */
  deleteFromWishlist(id: string): boolean {
    try {
      db.runSync('DELETE FROM wishlist_items WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error('[GardenModel] Failed to delete wishlist database item:', error);
      return false;
    }
  },

  /**
   * Verifies if a plant is already cataloged on the nurseries wishlist.
   */
  isInWishlist(id: string): boolean {
    try {
      const row = db.getFirstSync<{ id: string }>(
        'SELECT id FROM wishlist_items WHERE id = ?',
        id
      );
      return !!row;
    } catch {
      return false;
    }
  }
};

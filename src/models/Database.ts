import * as SQLite from 'expo-sqlite';

// Open the database synchronously
export const db = SQLite.openDatabaseSync('nubbly_garden.db');

/**
 * Initializes the SQLite database schemas for persistent plant care cataloging.
 */
export function initDatabase() {
  try {
    // Enable Foreign Key support and create tables
    db.execSync(`
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS garden_items (
        id TEXT PRIMARY KEY,
        custom_name TEXT,
        date_added TEXT,
        last_watered TEXT,
        common_name TEXT,
        botanical_name TEXT,
        family TEXT,
        description TEXT,
        water_interval_days INTEGER,
        sunlight TEXT,
        temperature TEXT,
        is_pet_safe INTEGER,
        care_guide_json TEXT,
        photo_uri TEXT,
        latitude REAL,
        longitude REAL,
        place_name TEXT
      );

      CREATE TABLE IF NOT EXISTS watering_logs (
        id TEXT PRIMARY KEY,
        garden_item_id TEXT,
        timestamp TEXT,
        FOREIGN KEY(garden_item_id) REFERENCES garden_items(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS plant_progress_logs (
        id TEXT PRIMARY KEY,
        garden_item_id TEXT,
        timestamp TEXT,
        photo_uri TEXT,
        notes TEXT,
        FOREIGN KEY(garden_item_id) REFERENCES garden_items(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY,
        common_name TEXT,
        botanical_name TEXT,
        photo_uri TEXT,
        water_interval_days INTEGER,
        is_bought INTEGER DEFAULT 0
      );
    `);

    // Dynamic relational migrations to support Phase 5 & 6 features
    const migrations = [
      'pruning_month INTEGER',
      'fertilizing_month INTEGER',
      'health_status TEXT DEFAULT \'Healthy\'',
      'diagnosed_issue TEXT',
      'confidence_pct INTEGER',
      'symptom_description TEXT',
      'organic_treatment TEXT'
    ];

    migrations.forEach(columnDef => {
      try {
        db.execSync(`ALTER TABLE garden_items ADD COLUMN ${columnDef};`);
        console.log(`[Database] Migration successful: added column ${columnDef}`);
      } catch {
        // SQLite will error if the column already exists, which we ignore safely
      }
    });

    console.log('[Database] Tables successfully initialized/verified.');
  } catch (error) {
    console.error('[Database] Critical error initializing SQLite database:', error);
  }
}


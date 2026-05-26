import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GardenModel, GardenItem } from '../models/GardenModel';
import { PlantModel, Plant } from '../models/PlantModel';

const GRID_LAYOUT_KEY = 'nubbly_bed_grid_layout_v1';

export type CompanionStatus = 'companion' | 'antagonist' | 'neutral';

export interface GridCell {
  row: number;
  col: number;
  plantId: string | null;
  commonName: string | null;
}

// Relational companion matching database
const COMPANION_RULES: Record<string, { companions: string[]; antagonists: string[] }> = {
  'tomato': {
    companions: ['basil', 'marigold'],
    antagonists: ['potato', 'fennel']
  },
  'basil': {
    companions: ['tomato', 'marigold'],
    antagonists: []
  },
  'snake plant': {
    companions: ['monstera', 'aloe vera'],
    antagonists: ['boston fern'] // Fern needs high humidity, Snake plant needs drought
  },
  'boston fern': {
    companions: ['peace lily', 'spider plant'],
    antagonists: ['snake plant', 'aloe vera']
  },
  'aloe vera': {
    companions: ['snake plant', 'jade plant'],
    antagonists: ['boston fern']
  },
  'monstera': {
    companions: ['snake plant', 'peace lily'],
    antagonists: []
  },
  'peace lily': {
    companions: ['boston fern', 'spider plant'],
    antagonists: []
  },
  'spider plant': {
    companions: ['peace lily', 'boston fern'],
    antagonists: []
  },
  'jade plant': {
    companions: ['aloe vera', 'snake plant'],
    antagonists: ['boston fern']
  }
};

export function checkCompanionStatus(name1: string | null, name2: string | null): CompanionStatus {
  if (!name1 || !name2) return 'neutral';
  
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();

  // Find exact rules
  const rule1 = Object.keys(COMPANION_RULES).find(k => n1.includes(k));
  const rule2 = Object.keys(COMPANION_RULES).find(k => n2.includes(k));

  if (rule1) {
    const list = COMPANION_RULES[rule1];
    if (list.companions.some(c => n2.includes(c))) return 'companion';
    if (list.antagonists.some(a => n2.includes(a))) return 'antagonist';
  }

  if (rule2) {
    const list = COMPANION_RULES[rule2];
    if (list.companions.some(c => n1.includes(c))) return 'companion';
    if (list.antagonists.some(a => n1.includes(a))) return 'antagonist';
  }

  return 'neutral';
}

export function usePlannerController() {
  const gridSize = 3; // 3x3 default grid
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  
  const [gardenList, setGardenList] = useState<GardenItem[]>([]);
  const [catalogList, setCatalogList] = useState<Plant[]>([]);

  /**
   * Initializes or loads the saved grid layout from secure local stores.
   */
  const loadGridLayout = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Gather catalog lists for mapping
      const savedGarden = GardenModel.getAllItems();
      const preseededCatalog = PlantModel.getAll();
      setGardenList(savedGarden);
      setCatalogList(preseededCatalog);

      // 2. Load stored layout
      const stored = await SecureStore.getItemAsync(GRID_LAYOUT_KEY);
      if (stored) {
        setGrid(JSON.parse(stored));
      } else {
        // Initialize an empty 3x3 grid
        const initialGrid: GridCell[] = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            initialGrid.push({ row: r, col: c, plantId: null, commonName: null });
          }
        }
        setGrid(initialGrid);
      }
    } catch (e) {
      console.error('[PlannerController] Failed to restore garden planner grid:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGridLayout();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadGridLayout]);

  /**
   * Updates the selected grid slot with a plant instance.
   */
  const onPlacePlant = async (row: number, col: number, plantId: string | null, commonName: string | null) => {
    try {
      const updatedGrid = grid.map(cell => {
        if (cell.row === row && cell.col === col) {
          return { ...cell, plantId, commonName };
        }
        return cell;
      });

      setGrid(updatedGrid);
      await SecureStore.setItemAsync(GRID_LAYOUT_KEY, JSON.stringify(updatedGrid));
      setSelectedCell(null);
    } catch (e) {
      console.error('[PlannerController] Failed to persist cell placement:', e);
    }
  };

  /**
   * Evaluates compatibility of a cell based on its neighbors (Top, Bottom, Left, Right).
   */
  const getCellCompatibility = (row: number, col: number, testPlantName: string | null): CompanionStatus => {
    if (!testPlantName) return 'neutral';

    const neighbors = [
      { r: row - 1, c: col }, // Top
      { r: row + 1, c: col }, // Bottom
      { r: row, c: col - 1 }, // Left
      { r: row, c: col + 1 }, // Right
    ];

    let hasAntagonist = false;
    let hasCompanion = false;

    neighbors.forEach(n => {
      const cell = grid.find(g => g.row === n.r && g.col === n.c);
      if (cell && cell.commonName) {
        const status = checkCompanionStatus(testPlantName, cell.commonName);
        if (status === 'antagonist') hasAntagonist = true;
        if (status === 'companion') hasCompanion = true;
      }
    });

    if (hasAntagonist) return 'antagonist';
    if (hasCompanion) return 'companion';
    return 'neutral';
  };

  /**
   * Clears the entire planner grid.
   */
  const onClearGrid = async () => {
    try {
      const cleared = grid.map(cell => ({ ...cell, plantId: null, commonName: null }));
      setGrid(cleared);
      await SecureStore.setItemAsync(GRID_LAYOUT_KEY, JSON.stringify(cleared));
    } catch (e) {
      console.error('[PlannerController] Failed to clear planner grid:', e);
    }
  };

  return {
    loading,
    gridSize,
    grid,
    selectedCell,
    gardenList,
    catalogList,
    setSelectedCell,
    onPlacePlant,
    onClearGrid,
    getCellCompatibility,
  };
}

export type PlannerControllerType = ReturnType<typeof usePlannerController>;

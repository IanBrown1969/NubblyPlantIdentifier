export interface PlantCareGuide {
  watering: string;
  sunlight: string;
  temperature: string;
  soil: string;
  fertilizer: string;
  troubleshooting: {
    symptom: string;
    cause: string;
    solution: string;
  }[];
}

export interface Plant {
  id: string;
  commonName: string;
  botanicalName: string;
  family: string;
  description: string;
  waterIntervalDays: number;
  sunlight: string;
  temperature: string;
  isPetSafe: boolean;
  careGuide: PlantCareGuide;
  photoUri: string; // Preloaded or AI scanned asset
}

// Pre-seeded database of common house plants for exploring and matching
export const PRESEEDED_PLANTS: Plant[] = [
  {
    id: 'monstera-deliciosa',
    commonName: 'Monstera Deliciosa',
    botanicalName: 'Monstera deliciosa',
    family: 'Araceae',
    description: 'Famous for its dramatic leaf fenestrations, the Swiss Cheese plant is an iconic, fast-growing tropical climber perfect for bright indoor spaces.',
    waterIntervalDays: 7,
    sunlight: 'Bright Indirect Light',
    temperature: '18°C - 30°C',
    isPetSafe: false,
    photoUri: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Water thoroughly when the top 2-3 inches of soil feel dry. Monstera leaves will droop slightly when thirsty. Avoid soggy soil to prevent root rot.',
      sunlight: 'Prefers medium to bright, indirect sunlight. Direct harsh sunlight can scorch the foliage, while low light slows growth and results in smaller leaves with fewer holes.',
      temperature: 'Enjoys a warm, humid environment. Keep away from cold drafts or air conditioning vents. Ideal humidity is above 50%; mist or wipe leaves with a damp cloth weekly.',
      soil: 'Thrives in a well-aerated, peat-based potting blend mixed with plenty of perlite and orchid bark to ensure fast drainage.',
      fertilizer: 'Apply a balanced liquid houseplant fertilizer diluted to half-strength once a month during spring and summer. Do not fertilize in winter.',
      troubleshooting: [
        {
          symptom: 'Yellowing lower leaves',
          cause: 'Overwatering or wet roots',
          solution: 'Reduce watering frequency and check that the container drainage holes are clear. Let the potting mix dry out completely before watering again.'
        },
        {
          symptom: 'Brown leaf tips or crispy margins',
          cause: 'Low humidity or mineral buildup',
          solution: 'Increase ambient humidity with a tray or misting, and use filtered water or let tap water sit out for 24 hours before pouring.'
        }
      ]
    }
  },
  {
    id: 'snake-plant',
    commonName: 'Snake Plant',
    botanicalName: 'Sansevieria trifasciata',
    family: 'Asparagaceae',
    description: 'An exceptionally hardy succulent with striking sword-like vertical leaves. Renowned for its air-purifying abilities and resilience to neglect.',
    waterIntervalDays: 18,
    sunlight: 'Low to Bright Light',
    temperature: '15°C - 29°C',
    isPetSafe: false,
    photoUri: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Extremely drought-tolerant. Only water when the soil has dried out completely. In winter, water only once every 4 to 6 weeks. When in doubt, leave it dry.',
      sunlight: 'Highly versatile. Will tolerate low, shaded corners but grows faster and displays richer green and gold margins in bright, indirect light.',
      temperature: 'Prefers warm temperatures but is hardy down to 10°C. Does not require extra humidity and thrives in dry, standard home atmospheres.',
      soil: 'Requires a loose, sandy succulent or cactus potting mix that drains rapidly to avoid moisture lock around the rhizomes.',
      fertilizer: 'Feed sparingly with an all-purpose plant food diluted to quarter-strength only once or twice in spring and summer. Never in winter.',
      troubleshooting: [
        {
          symptom: 'Mushy, bending leaves or black base',
          cause: 'Root rot due to overwatering',
          solution: 'Stop watering immediately. Carefully cut off rotten leaves at the base. If roots are black and soft, repot in fresh dry soil and trim affected roots.'
        },
        {
          symptom: 'Wrinkled leaves or slight curling',
          cause: 'Severe underwatering',
          solution: 'Give the soil a deep, thorough watering until water drains out from the bottom. The leaves should plump back up in a few days.'
        }
      ]
    }
  },
  {
    id: 'fiddle-leaf-fig',
    commonName: 'Fiddle Leaf Fig',
    botanicalName: 'Ficus lyrata',
    family: 'Moraceae',
    description: 'A popular focal-point plant featuring massive, glossy violin-shaped leaves. Beautiful and elegant, it rewards consistent placement and watering routines.',
    waterIntervalDays: 10,
    sunlight: 'Bright Consistent Light',
    temperature: '18°C - 26°C',
    isPetSafe: false,
    photoUri: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Water when the top 2 inches of soil feel dry. Pour water evenly around the trunk until it drains, then empty the collection saucer.',
      sunlight: 'Needs abundant, consistent bright indirect light. Rotate the plant 90 degrees every month to ensure balanced leaf growth and avoid leaning.',
      temperature: 'Loves constant temperatures and high humidity. Protect from drafty doorways, windows, and heaters. Dust leaves regularly to assist photosynthesis.',
      soil: 'Use a premium, rich potting mix that retains nutrients but incorporates coarse sand and perlite to maintain drainage paths.',
      fertilizer: 'Feed once every 3 weeks from spring through late summer using a high-nitrogen foliage fertilizer. Do not feed in autumn or winter.',
      troubleshooting: [
        {
          symptom: 'Dropping green leaves',
          cause: 'Cold drafts, relocation stress, or low light',
          solution: 'Find a bright, warm location away from doors or vents, and avoid moving the plant once it stabilizes.'
        },
        {
          symptom: 'Large brown spots in center of leaves',
          cause: 'Root suffocation from overwatering',
          solution: 'Verify that the pot has drainage holes and is not sitting in pooled water. Reduce watering frequency and let the soil dry out more.'
        }
      ]
    }
  },
  {
    id: 'peace-lily',
    commonName: 'Peace Lily',
    botanicalName: 'Spathiphyllum wallisii',
    family: 'Araceae',
    description: 'An elegant foliage plant with deep glossy leaves and beautiful pure white sail-like flowers. Very expressive, it acts as a perfect indicator plant.',
    waterIntervalDays: 6,
    sunlight: 'Medium to Low Light',
    temperature: '18°C - 27°C',
    isPetSafe: false,
    photoUri: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Keep soil lightly and consistently moist. When thirsty, the entire plant will dramatic droop. Watering it will cause it to perk back up within hours.',
      sunlight: 'Prefers partial shade or medium, indirect light. Direct sun will scorch the delicate white spathes and cause leaves to curl and pale.',
      temperature: 'Thrives in warm, draft-free spaces. Appreciates regular misting or placing near humid bathrooms/kitchens.',
      soil: 'A classic organic-rich soil blend with perlite and a pinch of compost to hold light moisture without waterlogging.',
      fertilizer: 'Feed lightly every 6 weeks during spring and summer with a water-soluble balanced plant food to encourage flowering.',
      troubleshooting: [
        {
          symptom: 'Dramatic drooping of all stems',
          cause: 'Extreme thirst / dehydrated soil',
          solution: 'Give the plant a thorough soak immediately. Consider bottom-watering by placing the pot in a tub of water for 30 minutes to saturate the peat.'
        },
        {
          symptom: 'Yellow leaves with black tips',
          cause: 'Overwatering or heavy tap minerals',
          solution: 'Ensure the soil is not swampy. Use filtered or rainwater, and let the soil surface dry out slightly before the next watering.'
        }
      ]
    }
  },
  {
    id: 'spider-plant',
    commonName: 'Spider Plant',
    botanicalName: 'Chlorophytum comosum',
    family: 'Asparagaceae',
    description: 'An easy-care favorite displaying cascading ribbon-like green and white leaves. Produces miniature arching spiderettes that are simple to propagate.',
    waterIntervalDays: 7,
    sunlight: 'Bright Indirect Light',
    temperature: '13°C - 25°C',
    isPetSafe: true,
    photoUri: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Water moderately in spring and summer, allowing the top inch to dry. Water sparingly in winter. Highly resilient roots store water.',
      sunlight: 'Grows best in bright, indirect light but adapts easily to semi-shade. Variegation is strongest under filtered sun.',
      temperature: 'Tolerant of a wide range of temperatures down to 8°C. Prefers moderate humidity but handles dry air well.',
      soil: 'Standard, well-draining container potting mix that handles regular watering cycles.',
      fertilizer: 'Apply half-strength liquid fertilizer twice a month during active growth. Too much fertilizer can inhibit baby spiderette production.',
      troubleshooting: [
        {
          symptom: 'Brown, dry leaf tips',
          cause: 'Tap water minerals (fluoride/chlorine) or low humidity',
          solution: 'Flush the soil with distilled or rainwater, and clip off brown tips with clean shears, following the leaf shape.'
        },
        {
          symptom: 'Faded, pale leaves or lack of growth',
          cause: 'Saturated soil or rootbound pot',
          solution: 'Repot the plant to check roots. If thick white tubers fill the pot, move to a size larger container with fresh drainage.'
        }
      ]
    }
  },
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    botanicalName: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    description: 'A stemless succulent boasting fleshy, serrated leaves filled with soothing gel. Excellent for sunny windowsills and natural skincare.',
    waterIntervalDays: 14,
    sunlight: 'Bright Direct Light',
    temperature: '15°C - 28°C',
    isPetSafe: false,
    photoUri: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop',
    careGuide: {
      watering: 'Water deeply but very infrequently. Allow soil to dry completely to the bottom of the pot. Ensure no water collects in the center leaf rosette.',
      sunlight: 'Needs at least six hours of bright, direct sunlight daily. Place in south or west-facing windows for plump, healthy green leaves.',
      temperature: 'Requires a warm environment. Susceptible to frost damage; bring indoors if temperatures fall near 10°C.',
      soil: 'A gritty, extremely free-draining sandy cactus mix with high amounts of perlite, pumice, or gravel.',
      fertilizer: 'Requires almost no fertilization. Feed once a year in spring with a balanced succulent formula.',
      troubleshooting: [
        {
          symptom: 'Soggy, translucent or brown leaves',
          cause: 'Waterlogged roots and tissue decay',
          solution: 'Remove from pot immediately, cut away soft mushy roots and leaves, let the base dry for a day, then replot in dry gravelly mix.'
        },
        {
          symptom: 'Thin, flat or curling leaves',
          cause: 'Insufficient light or extreme dehydration',
          solution: 'Move to a sunnier window. If the soil is bone dry, give it a thorough water. Aloe stores water in its leaves; flat leaves mean stores are low.'
        }
      ]
    }
  }
];

export const PlantModel = {
  /**
   * Retrieves all preseeded encyclopedia plants.
   */
  getAll(): Plant[] {
    return PRESEEDED_PLANTS;
  },

  /**
   * Finds a specific preseeded plant by its ID.
   */
  getById(id: string): Plant | undefined {
    return PRESEEDED_PLANTS.find(p => p.id === id);
  },

  /**
   * Performs botanical matching search against common and botanical names.
   */
  search(query: string, filter: string = 'All'): Plant[] {
    let results = PRESEEDED_PLANTS;

    // Apply Filter Categories
    if (filter !== 'All') {
      const category = filter.toLowerCase();
      if (category === 'pet safe') {
        results = results.filter(p => p.isPetSafe);
      } else if (category === 'low light') {
        results = results.filter(p => p.sunlight.toLowerCase().includes('low'));
      } else if (category === 'succulent') {
        results = results.filter(p => 
          p.commonName.toLowerCase().includes('aloe') || 
          p.commonName.toLowerCase().includes('snake') || 
          p.description.toLowerCase().includes('succulent')
        );
      }
    }

    // Apply Search Query
    if (query.trim()) {
      const searchTxt = query.toLowerCase().trim();
      results = results.filter(p => 
        p.commonName.toLowerCase().includes(searchTxt) ||
        p.botanicalName.toLowerCase().includes(searchTxt) ||
        p.family.toLowerCase().includes(searchTxt)
      );
    }

    return results;
  }
};

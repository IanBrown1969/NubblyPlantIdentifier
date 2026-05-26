export interface NurseryOption {
  name: string;
  description: string;
  url: string;
  logoText: string;
}

/**
 * Matches wishlist items to local nurseries with an online presence
 * and geolocated physical garden search links.
 */
export function getOnlineNurseries(commonName: string, botanicalName: string): NurseryOption[] {
  const query = encodeURIComponent(commonName);
  const nameLower = (commonName + ' ' + botanicalName).toLowerCase();

  // 1. Succulents & Cacti
  if (
    nameLower.includes('succulent') ||
    nameLower.includes('cactus') ||
    nameLower.includes('aloe') ||
    nameLower.includes('crassula') ||
    nameLower.includes('ovata') ||
    nameLower.includes('echeveria') ||
    nameLower.includes('sedum') ||
    nameLower.includes('jade') ||
    nameLower.includes('haworthia')
  ) {
    return [
      {
        name: 'Local Nursery Search',
        description: 'Locate family-owned garden centers and specialty plant shops carrying succulents near you.',
        url: `https://www.google.com/maps/search/succulent+cacti+nursery+garden+center+${query}`,
        logoText: 'LN',
      },
      {
        name: 'Mountain Crest Gardens',
        description: 'Family-run boutique succulent farm in California shipping premium varieties nationwide.',
        url: `https://mountaincrestgardens.com/search.php?search_query=${query}`,
        logoText: 'MC',
      },
      {
        name: 'Etsy Local Growers',
        description: 'Buy directly from home growers and local nursery suppliers shipping within your region.',
        url: `https://www.etsy.com/search?q=${query}+plant`,
        logoText: 'ET',
      },
    ];
  }

  // 2. Ferns & Indoor Tropicals
  if (
    nameLower.includes('fern') ||
    nameLower.includes('nephrolepis') ||
    nameLower.includes('monstera') ||
    nameLower.includes('lyrata') ||
    nameLower.includes('fig') ||
    nameLower.includes('ficus') ||
    nameLower.includes('pothos') ||
    nameLower.includes('philodendron') ||
    nameLower.includes('houseplant') ||
    nameLower.includes('indoor') ||
    nameLower.includes('spathiphyllum') ||
    nameLower.includes('sansevieria') ||
    nameLower.includes('spider plant') ||
    nameLower.includes('chlorophytum')
  ) {
    return [
      {
        name: 'Local Plant Shops',
        description: 'Find local, independent houseplant nurseries in your neighborhood carrying active stock.',
        url: `https://www.google.com/maps/search/indoor+plant+nursery+garden+center+${query}`,
        logoText: 'LN',
      },
      {
        name: 'Logee\'s Greenhouses',
        description: 'Historic family-owned retail nursery and greenhouses in Connecticut shipping unique tropicals since 1892.',
        url: `https://www.logees.com/catalogsearch/result/?q=${query}`,
        logoText: 'LP',
      },
      {
        name: 'Monrovia Pick-up Network',
        description: 'Order premium foliage online and pick up at your closest local independent partner nursery.',
        url: `https://www.monrovia.com/catalogsearch/result/?q=${query}`,
        logoText: 'MN',
      },
    ];
  }

  // 3. Fallback / General Outdoor & Trees
  return [
    {
      name: 'Local Garden Centers',
      description: 'Locate family-owned nurseries and tree yards in your area stocking outdoor cultivars.',
      url: `https://www.google.com/maps/search/outdoor+plant+nursery+garden+center+${query}`,
      logoText: 'LN',
    },
    {
      name: 'Monrovia Partner Network',
      description: 'Buy premium landscape specimens online and pick up at your closest local independent nursery.',
      url: `https://www.monrovia.com/catalogsearch/result/?q=${query}`,
      logoText: 'MN',
    },
    {
      name: 'Plant Delights Nursery',
      description: 'Famous physical botanical garden and family retail sanctuary in North Carolina shipping rare perennials.',
      url: `https://www.plantdelights.com/pages/search-results?q=${query}`,
      logoText: 'PD',
    },
  ];
}

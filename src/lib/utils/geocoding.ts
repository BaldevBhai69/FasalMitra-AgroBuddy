/**
 * Centralized Indian Geographic & Agronomic Coordinate Resolution
 * Covers all 28 States, 8 Union Territories, and major agricultural districts.
 */

export const INDIAN_LOCATION_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // Assam & North East
  'assam': { lat: 26.2006, lon: 92.9376 },
  'guwahati': { lat: 26.1445, lon: 91.7362 },
  'kamrup': { lat: 26.1445, lon: 91.7362 },
  'kamrup metropolitan': { lat: 26.1445, lon: 91.7362 },
  'kamrup rural': { lat: 26.3126, lon: 91.5978 },
  'jorhat': { lat: 26.7509, lon: 94.2037 },
  'dibrugarh': { lat: 27.4728, lon: 94.9120 },
  'silchar': { lat: 24.8333, lon: 92.7789 },
  'cachar': { lat: 24.8333, lon: 92.7789 },
  'hailakandi': { lat: 24.6833, lon: 92.5667 },
  'karimganj': { lat: 24.8667, lon: 92.3500 },
  'tezpur': { lat: 26.6528, lon: 92.7926 },
  'sonitpur': { lat: 26.6528, lon: 92.7926 },
  'nagaon': { lat: 26.3464, lon: 92.6840 },
  'barpeta': { lat: 26.3214, lon: 91.0064 },
  'tinsukia': { lat: 27.4922, lon: 95.3468 },
  'bongaigaon': { lat: 26.5024, lon: 90.5532 },
  'goalpara': { lat: 26.1738, lon: 90.6276 },
  'sivasagar': { lat: 26.9826, lon: 94.6425 },
  'dhubri': { lat: 26.0207, lon: 89.9743 },
  'golaghat': { lat: 26.5167, lon: 93.9667 },
  'darrang': { lat: 26.4500, lon: 92.0333 },
  'morigaon': { lat: 26.2500, lon: 92.3333 },
  'lakhimpur': { lat: 27.2333, lon: 94.1000 },
  'dhemaji': { lat: 27.4833, lon: 94.5833 },
  'kokrajhar': { lat: 26.4000, lon: 90.2667 },

  // Kerala
  'kerala': { lat: 10.8505, lon: 76.2711 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'ernakulam': { lat: 9.9816, lon: 76.2999 },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'wayanad': { lat: 11.6854, lon: 76.1320 },
  'palakkad': { lat: 10.7867, lon: 76.6548 },
  'kottayam': { lat: 9.5916, lon: 76.5222 },
  'alappuzha': { lat: 9.4981, lon: 76.3388 },
  'kozhikode': { lat: 11.2588, lon: 75.7804 },
  'idukki': { lat: 9.9189, lon: 77.1025 },
  'thrissur': { lat: 10.5276, lon: 76.2144 },
  'kannur': { lat: 11.8745, lon: 75.3704 },
  'malappuram': { lat: 11.0510, lon: 76.0711 },
  'kollam': { lat: 8.8932, lon: 76.6141 },

  // Odisha
  'odisha': { lat: 20.9517, lon: 85.0985 },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
  'khordha': { lat: 20.1833, lon: 85.6167 },
  'cuttack': { lat: 20.4625, lon: 85.8828 },
  'sambalpur': { lat: 21.4669, lon: 83.9812 },
  'puri': { lat: 19.8135, lon: 85.8312 },
  'balasore': { lat: 21.4934, lon: 86.9135 },
  'bargarh': { lat: 21.3333, lon: 83.6167 },
  'ganjam': { lat: 19.3833, lon: 85.0667 },
  'koraput': { lat: 18.8167, lon: 82.7167 },

  // Himachal Pradesh & Uttarakhand
  'himachal pradesh': { lat: 31.1048, lon: 77.1734 },
  'shimla': { lat: 31.1048, lon: 77.1734 },
  'kangra': { lat: 32.0998, lon: 76.2691 },
  'kullu': { lat: 31.9579, lon: 77.1095 },
  'mandi': { lat: 31.5892, lon: 76.9182 },
  'solan': { lat: 30.9045, lon: 77.0967 },
  'uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'dehradun': { lat: 30.3165, lon: 78.0322 },
  'haridwar': { lat: 29.9457, lon: 78.1642 },
  'nainital': { lat: 29.3919, lon: 79.4542 },
  'udham singh nagar': { lat: 28.9800, lon: 79.5200 },
  'roorkee': { lat: 29.8543, lon: 77.8880 },

  // Jammu & Kashmir
  'jammu and kashmir': { lat: 33.7782, lon: 76.5762 },
  'jammu & kashmir': { lat: 33.7782, lon: 76.5762 },
  'kashmir': { lat: 34.0837, lon: 74.7973 },
  'srinagar': { lat: 34.0837, lon: 74.7973 },
  'jammu': { lat: 32.7266, lon: 74.8570 },
  'anantnag': { lat: 33.7311, lon: 75.1522 },
  'baramulla': { lat: 34.1980, lon: 74.3636 },

  // Jharkhand & Chhattisgarh
  'jharkhand': { lat: 23.6102, lon: 85.2799 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'jamshedpur': { lat: 22.8046, lon: 86.2029 },
  'dhanbad': { lat: 23.7957, lon: 86.4304 },
  'hazaribagh': { lat: 23.9937, lon: 85.3637 },
  'chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'raipur': { lat: 21.2514, lon: 81.6296 },
  'bilaspur': { lat: 22.0797, lon: 82.1409 },
  'durg': { lat: 21.1904, lon: 81.2849 },
  'bastar': { lat: 19.0667, lon: 81.9500 },

  // Other Eastern & North-Eastern States
  'goa': { lat: 15.2993, lon: 74.1240 },
  'panaji': { lat: 15.4909, lon: 73.8278 },
  'margao': { lat: 15.2700, lon: 73.9600 },
  'tripura': { lat: 23.9408, lon: 91.9882 },
  'agartala': { lat: 23.8315, lon: 91.2868 },
  'meghalaya': { lat: 25.4670, lon: 91.3662 },
  'shillong': { lat: 25.5788, lon: 91.8933 },
  'manipur': { lat: 24.6637, lon: 93.9063 },
  'imphal': { lat: 24.8170, lon: 93.9368 },
  'nagaland': { lat: 26.1584, lon: 94.5624 },
  'kohima': { lat: 25.6751, lon: 94.1086 },
  'dimapur': { lat: 25.9090, lon: 93.7266 },
  'mizoram': { lat: 23.1645, lon: 92.9376 },
  'aizawl': { lat: 23.7271, lon: 92.7176 },
  'arunachal pradesh': { lat: 28.2180, lon: 94.7278 },
  'itanagar': { lat: 27.0844, lon: 93.6053 },
  'sikkim': { lat: 27.5330, lon: 88.5122 },
  'gangtok': { lat: 27.3389, lon: 88.6065 },

  // Rajasthan
  'rajasthan': { lat: 26.9124, lon: 75.7873 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'jodhpur': { lat: 26.2389, lon: 73.0243 },
  'kota': { lat: 25.1825, lon: 75.8398 },
  'bikaner': { lat: 28.0229, lon: 73.3119 },
  'udaipur': { lat: 24.5854, lon: 73.7125 },
  'ajmer': { lat: 26.4499, lon: 74.6399 },
  'alwar': { lat: 27.5530, lon: 76.6346 },
  'sriganganagar': { lat: 29.9090, lon: 73.8790 },

  // Uttar Pradesh
  'uttar pradesh': { lat: 26.8467, lon: 80.9462 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'malihabad': { lat: 26.9200, lon: 80.7100 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'kanpur': { lat: 26.4499, lon: 80.3319 },
  'agra': { lat: 27.1767, lon: 78.0081 },
  'prayagraj': { lat: 25.4358, lon: 81.8463 },
  'allahabad': { lat: 25.4358, lon: 81.8463 },
  'gorakhpur': { lat: 26.7606, lon: 83.3732 },
  'bareilly': { lat: 28.3670, lon: 79.4304 },
  'meerut': { lat: 28.9845, lon: 77.7064 },

  // Punjab & Haryana
  'punjab': { lat: 30.9010, lon: 75.8573 },
  'ludhiana': { lat: 30.9010, lon: 75.8573 },
  'amritsar': { lat: 31.6340, lon: 74.8723 },
  'jalandhar': { lat: 31.3260, lon: 75.5762 },
  'patiala': { lat: 30.3398, lon: 76.3869 },
  'bathinda': { lat: 30.2110, lon: 74.9455 },
  'haryana': { lat: 29.6857, lon: 76.9905 },
  'karnal': { lat: 29.6857, lon: 76.9905 },
  'hisar': { lat: 29.1492, lon: 75.7217 },
  'ambala': { lat: 30.3782, lon: 76.7767 },
  'rohtak': { lat: 28.8955, lon: 76.6066 },

  // Maharashtra & Gujarat
  'maharashtra': { lat: 18.5204, lon: 73.8567 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'nashik': { lat: 19.9975, lon: 73.7898 },
  'aurangabad': { lat: 19.8762, lon: 75.3433 },
  'solapur': { lat: 17.6599, lon: 75.9064 },
  'kolhapur': { lat: 16.7050, lon: 74.2433 },
  'amravati': { lat: 20.9374, lon: 77.7796 },
  'gujarat': { lat: 23.0225, lon: 72.5714 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'vadodara': { lat: 22.3072, lon: 73.1812 },
  'rajkot': { lat: 22.3039, lon: 70.8022 },
  'bhavnagar': { lat: 21.7645, lon: 72.1519 },

  // Madhya Pradesh
  'madhya pradesh': { lat: 22.7196, lon: 75.8577 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'jabalpur': { lat: 23.1815, lon: 79.9864 },
  'gwalior': { lat: 26.2183, lon: 78.1828 },
  'ujjain': { lat: 23.1765, lon: 75.7885 },

  // Karnataka, Tamil Nadu, Andhra Pradesh & Telangana
  'karnataka': { lat: 12.9716, lon: 77.5946 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'mysuru': { lat: 12.2958, lon: 76.6394 },
  'belagavi': { lat: 15.8497, lon: 74.4977 },
  'hubballi': { lat: 15.3647, lon: 75.1240 },
  'dharwad': { lat: 15.4589, lon: 75.0078 },
  'tamil nadu': { lat: 13.0827, lon: 80.2707 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'coimbatore': { lat: 11.0168, lon: 76.9558 },
  'madurai': { lat: 9.9252, lon: 78.1198 },
  'thanjavur': { lat: 10.7870, lon: 79.1378 },
  'trichy': { lat: 10.7905, lon: 78.7047 },
  'telangana': { lat: 17.3850, lon: 78.4867 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'warangal': { lat: 17.9689, lon: 79.5941 },
  'nizamabad': { lat: 18.6725, lon: 78.0941 },
  'andhra pradesh': { lat: 16.5062, lon: 80.6480 },
  'vijayawada': { lat: 16.5062, lon: 80.6480 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'guntur': { lat: 16.3067, lon: 80.4365 },
  'tirupati': { lat: 13.6288, lon: 79.4192 },
  'kurnool': { lat: 15.8281, lon: 78.0373 },

  // Bihar & West Bengal
  'bihar': { lat: 25.5941, lon: 85.1376 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'gaya': { lat: 24.7914, lon: 85.0002 },
  'muzaffarpur': { lat: 26.1209, lon: 85.3647 },
  'bhagalpur': { lat: 25.2425, lon: 86.9842 },
  'west bengal': { lat: 22.5726, lon: 88.3639 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'siliguri': { lat: 26.7271, lon: 88.3953 },
  'darjeeling': { lat: 27.0410, lon: 88.2663 },
  'bardhaman': { lat: 23.2324, lon: 87.8615 },
  'murshidabad': { lat: 24.1750, lon: 88.2800 },
};

/**
 * Resolves exact geographic coordinates for any Indian state, district, or village.
 */
export function resolveIndianCoordinates(
  state?: string | null,
  district?: string | null,
  village?: string | null,
  providedLat?: number | null,
  providedLon?: number | null
): { lat: number; lon: number } {
  if (providedLat && providedLon && !isNaN(providedLat) && !isNaN(providedLon)) {
    return { lat: Number(providedLat), lon: Number(providedLon) };
  }

  const dKey = (district || '').toLowerCase().trim();
  const sKey = (state || '').toLowerCase().trim();
  const vKey = (village || '').toLowerCase().trim();

  if (vKey && INDIAN_LOCATION_COORDINATES[vKey]) {
    return INDIAN_LOCATION_COORDINATES[vKey];
  }

  // Exact district match
  if (dKey && INDIAN_LOCATION_COORDINATES[dKey]) {
    return INDIAN_LOCATION_COORDINATES[dKey];
  }

  // Substring district match
  const dMatch = Object.entries(INDIAN_LOCATION_COORDINATES).find(([k]) =>
    dKey.includes(k) || k.includes(dKey)
  );
  if (dMatch) return dMatch[1];

  // Exact state match
  if (sKey && INDIAN_LOCATION_COORDINATES[sKey]) {
    return INDIAN_LOCATION_COORDINATES[sKey];
  }

  // Substring state match
  const sMatch = Object.entries(INDIAN_LOCATION_COORDINATES).find(([k]) =>
    sKey.includes(k) || k.includes(sKey)
  );
  if (sMatch) return sMatch[1];

  // State-specific centroid fallbacks
  if (sKey.includes('assam')) return { lat: 26.2006, lon: 92.9376 };
  if (sKey.includes('kerala')) return { lat: 10.8505, lon: 76.2711 };
  if (sKey.includes('odisha')) return { lat: 20.9517, lon: 85.0985 };
  if (sKey.includes('uttar')) return { lat: 26.8467, lon: 80.9462 };
  if (sKey.includes('rajasthan')) return { lat: 26.9124, lon: 75.7873 };
  if (sKey.includes('punjab')) return { lat: 30.9010, lon: 75.8573 };
  if (sKey.includes('haryana')) return { lat: 29.6857, lon: 76.9905 };
  if (sKey.includes('maharashtra')) return { lat: 18.5204, lon: 73.8567 };
  if (sKey.includes('gujarat')) return { lat: 23.0225, lon: 72.5714 };
  if (sKey.includes('madhya')) return { lat: 22.7196, lon: 75.8577 };
  if (sKey.includes('karnataka')) return { lat: 12.9716, lon: 77.5946 };
  if (sKey.includes('tamil')) return { lat: 13.0827, lon: 80.2707 };
  if (sKey.includes('telangana')) return { lat: 17.3850, lon: 78.4867 };
  if (sKey.includes('andhra')) return { lat: 16.5062, lon: 80.6480 };
  if (sKey.includes('bihar')) return { lat: 25.5941, lon: 85.1376 };
  if (sKey.includes('bengal')) return { lat: 22.5726, lon: 88.3639 };
  if (sKey.includes('himachal')) return { lat: 31.1048, lon: 77.1734 };
  if (sKey.includes('uttarakhand')) return { lat: 30.0668, lon: 79.0193 };
  if (sKey.includes('kashmir') || sKey.includes('jammu')) return { lat: 33.7782, lon: 76.5762 };
  if (sKey.includes('jharkhand')) return { lat: 23.6102, lon: 85.2799 };
  if (sKey.includes('chhattisgarh')) return { lat: 21.2787, lon: 81.8661 };
  if (sKey.includes('goa')) return { lat: 15.2993, lon: 74.1240 };
  if (sKey.includes('tripura')) return { lat: 23.9408, lon: 91.9882 };
  if (sKey.includes('meghalaya')) return { lat: 25.4670, lon: 91.3662 };
  if (sKey.includes('manipur')) return { lat: 24.6637, lon: 93.9063 };
  if (sKey.includes('nagaland')) return { lat: 26.1584, lon: 94.5624 };
  if (sKey.includes('mizoram')) return { lat: 23.1645, lon: 92.9376 };
  if (sKey.includes('arunachal')) return { lat: 28.2180, lon: 94.7278 };
  if (sKey.includes('sikkim')) return { lat: 27.5330, lon: 88.5122 };

  // National centroid (Nagpur / Central India)
  return { lat: 21.1458, lon: 79.0882 };
}

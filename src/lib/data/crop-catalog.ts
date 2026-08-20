import { CropCatalog } from '../../types/crop.types';

export const MASTER_CROP_CATALOG: (Partial<CropCatalog> & {
  id: string;
  name: string;
  hindi_name: string;
  icon_emoji: string;
  category: string;
  optimal_temperature_min: number;
  optimal_temperature_max: number;
  optimal_soil_moisture_min: number;
  optimal_soil_moisture_max: number;
  optimal_ph_min: number;
  optimal_ph_max: number;
  optimal_nitrogen_min: number;
  optimal_nitrogen_max: number;
  optimal_phosphorus_min: number;
  optimal_phosphorus_max: number;
  optimal_potassium_min: number;
  optimal_potassium_max: number;
  duration_days_min: number;
  duration_days_max: number;
  msp_price_per_quintal: number;
})[] = [
  // 1. Tomato
  {
    id: 'cat-tomato',
    name: 'Tomato',
    hindi_name: 'टमाटर',
    icon_emoji: '🍅',
    category: 'Vegetable',
    optimal_temperature_min: 18.0,
    optimal_temperature_max: 27.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 6.8,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 80.0,
    optimal_potassium_min: 120.0,
    optimal_potassium_max: 180.0,
    kc_initial: 0.45,
    kc_mid: 1.15,
    kc_end: 0.80,
    duration_days_min: 75,
    duration_days_max: 95,
    water_requirement_mm: 550.0,
    sowing_seasons: ['Rabi', 'Kharif', 'Zaid'],
    msp_price_per_quintal: 2400.0,
    is_perishable: true,
    storage_duration_days: 21,
    general_tips: [
      'Use raised beds with drip irrigation and plastic mulch for maximum water efficiency.',
      'Staking improves fruit quality and prevents ground-borne fungal infections.',
      'Avoid overhead sprinklers during flowering to prevent blossom drop.'
    ],
    fertilizer_guide: {
      basal: 'NPK 50:50:50 kg/ha + 25 tonnes FYM during land preparation',
      vegetative: 'Top dress 30 kg Nitrogen at 30 days after transplanting',
      flowering: 'Apply 25 kg Nitrogen + 25 kg Potassium at early flowering'
    }
  },

  // 2. Potato
  {
    id: 'cat-potato',
    name: 'Potato',
    hindi_name: 'आलू',
    icon_emoji: '🥔',
    category: 'Vegetable',
    optimal_temperature_min: 15.0,
    optimal_temperature_max: 22.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 5.2,
    optimal_ph_max: 6.5,
    optimal_nitrogen_min: 120.0,
    optimal_nitrogen_max: 180.0,
    optimal_phosphorus_min: 60.0,
    optimal_phosphorus_max: 100.0,
    optimal_potassium_min: 100.0,
    optimal_potassium_max: 160.0,
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.75,
    duration_days_min: 90,
    duration_days_max: 120,
    water_requirement_mm: 500.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 1600.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Earthing up at 30 and 45 days is critical to prevent greening of tubers by sunlight.',
      'Stop irrigation 10-12 days prior to harvest to toughen tuber skin.'
    ],
    fertilizer_guide: {
      basal: 'NPK 60:80:100 kg/ha + 20 tonnes compost',
      earthing_up: 'Top dress 60 kg Nitrogen per ha at first earthing up (30 DAS)'
    }
  },

  // 3. Onion
  {
    id: 'cat-onion',
    name: 'Onion',
    hindi_name: 'प्याज',
    icon_emoji: '🧅',
    category: 'Vegetable',
    optimal_temperature_min: 13.0,
    optimal_temperature_max: 24.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 80.0,
    optimal_nitrogen_max: 120.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.50,
    kc_mid: 1.05,
    kc_end: 0.75,
    duration_days_min: 110,
    duration_days_max: 140,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Rabi', 'Kharif'],
    msp_price_per_quintal: 1950.0,
    is_perishable: false,
    storage_duration_days: 120,
    general_tips: [
      'Withhold water 15 days before harvest when 50% tops drop (neck fall).',
      'Cure onions in shade for 7-10 days before storage to prevent neck rot.'
    ],
    fertilizer_guide: {
      basal: 'NPK 50:50:50 kg/ha + 20 kg Sulphur per hectare',
      top_dressing: '50 kg N in two splits at 30 and 45 days after transplanting'
    }
  },

  // 4. Rice (Paddy)
  {
    id: 'cat-rice',
    name: 'Rice (Paddy)',
    hindi_name: 'चावल (धान)',
    icon_emoji: '🌾',
    category: 'Cereal',
    optimal_temperature_min: 22.0,
    optimal_temperature_max: 34.0,
    optimal_soil_moisture_min: 70.0,
    optimal_soil_moisture_max: 95.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 7.0,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 1.05,
    kc_mid: 1.20,
    kc_end: 0.90,
    duration_days_min: 110,
    duration_days_max: 150,
    water_requirement_mm: 1200.0,
    sowing_seasons: ['Kharif', 'Rabi'],
    msp_price_per_quintal: 2300.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Adopt Alternate Wetting and Drying (AWD) technique to save 30% water.',
      'Drain field completely 10-12 days before anticipated harvest date.'
    ],
    fertilizer_guide: {
      basal: 'NPK 50:60:40 kg/ha + 25 kg ZnSO4',
      active_tillering: 'Top dress 35 kg Nitrogen at 21-25 DAT'
    }
  },

  // 5. Wheat
  {
    id: 'cat-wheat',
    name: 'Wheat',
    hindi_name: 'गेहूं',
    icon_emoji: '🌾',
    category: 'Cereal',
    optimal_temperature_min: 12.0,
    optimal_temperature_max: 25.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 140.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 30.0,
    optimal_potassium_max: 50.0,
    kc_initial: 0.35,
    kc_mid: 1.15,
    kc_end: 0.40,
    duration_days_min: 110,
    duration_days_max: 140,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 2275.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Crown Root Initiation (CRI) irrigation at 21 DAS is the single most critical watering.',
      'Avoid irrigation on windy days during milking to prevent crop lodging.'
    ],
    fertilizer_guide: {
      basal: 'NPK 60:60:40 kg/ha at sowing time',
      first_irrigation: 'Top dress 30 kg Nitrogen at CRI stage (21 DAS)'
    }
  },

  // 6. Maize (Corn)
  {
    id: 'cat-maize',
    name: 'Maize (Corn)',
    hindi_name: 'मक्का',
    icon_emoji: '🌽',
    category: 'Cereal',
    optimal_temperature_min: 18.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 5.8,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 120.0,
    optimal_nitrogen_max: 160.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 70.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 0.40,
    kc_mid: 1.20,
    kc_end: 0.60,
    duration_days_min: 85,
    duration_days_max: 110,
    water_requirement_mm: 500.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 2090.0,
    is_perishable: false,
    storage_duration_days: 240,
    general_tips: [
      'Tasseling and silking are the most water-sensitive stages.',
      'Scout regularly for Fall Armyworm in central leaf whorls.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:60:40 kg/ha',
      knee_high: 'Top dress 40 kg Nitrogen at V6 stage (30 DAS)'
    }
  },

  // 7. Cotton
  {
    id: 'cat-cotton',
    name: 'Cotton',
    hindi_name: 'कपास',
    icon_emoji: '🌱',
    category: 'Cash Crop',
    optimal_temperature_min: 21.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 8.0,
    optimal_nitrogen_min: 90.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 0.45,
    kc_mid: 1.15,
    kc_end: 0.65,
    duration_days_min: 150,
    duration_days_max: 180,
    water_requirement_mm: 700.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 7121.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Avoid excessive nitrogen which promotes vegetative canopy over fruiting bolls.',
      'Withhold irrigation when 10% bolls begin opening to prevent lint staining.'
    ],
    fertilizer_guide: {
      basal: 'NPK 30:50:30 kg/ha',
      squaring: '30 kg N at square initiation (45 DAS)'
    }
  },

  // 8. Sugarcane
  {
    id: 'cat-sugarcane',
    name: 'Sugarcane',
    hindi_name: 'गन्ना',
    icon_emoji: '🎋',
    category: 'Cash Crop',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 38.0,
    optimal_soil_moisture_min: 55.0,
    optimal_soil_moisture_max: 75.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.8,
    optimal_nitrogen_min: 150.0,
    optimal_nitrogen_max: 250.0,
    optimal_phosphorus_min: 60.0,
    optimal_phosphorus_max: 90.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 150.0,
    kc_initial: 0.40,
    kc_mid: 1.25,
    kc_end: 0.75,
    duration_days_min: 300,
    duration_days_max: 365,
    water_requirement_mm: 1800.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 340.0,
    is_perishable: false,
    storage_duration_days: 7,
    general_tips: [
      'Trash mulching (10 cm) conserves up to 35% soil moisture in peak summer.',
      'Stop irrigation 20 days prior to cane harvest to concentrate sucrose Brix.'
    ],
    fertilizer_guide: {
      basal: 'NPK 75:60:60 kg/ha',
      formative: '75 kg N at 45 days after planting'
    }
  },

  // 9. Mango
  {
    id: 'cat-mango',
    name: 'Mango',
    hindi_name: 'आम',
    icon_emoji: '🥭',
    category: 'Fruit',
    optimal_temperature_min: 24.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 35.0,
    optimal_soil_moisture_max: 55.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 100.0,
    optimal_potassium_max: 150.0,
    kc_initial: 0.50,
    kc_mid: 0.85,
    kc_end: 0.70,
    duration_days_min: 240,
    duration_days_max: 365,
    water_requirement_mm: 900.0,
    sowing_seasons: ['Zaid', 'Kharif'],
    msp_price_per_quintal: 4500.0,
    is_perishable: true,
    storage_duration_days: 14,
    general_tips: [
      'Withhold irrigation 2 months prior to flowering to promote floral bud initiation.',
      'Resume regular basin watering once fruits reach pea-size.'
    ],
    fertilizer_guide: {
      post_harvest: 'Apply 500g N, 250g P2O5, 750g K2O + 50 kg FYM per tree in August'
    }
  },

  // 10. Soybean
  {
    id: 'cat-soybean',
    name: 'Soybean',
    hindi_name: 'सोयाबीन',
    icon_emoji: '🫘',
    category: 'Oilseed',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 30.0,
    optimal_nitrogen_max: 60.0,
    optimal_phosphorus_min: 60.0,
    optimal_phosphorus_max: 80.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.50,
    duration_days_min: 90,
    duration_days_max: 110,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 4892.0,
    is_perishable: false,
    storage_duration_days: 240,
    general_tips: [
      'Inoculate seeds with Bradyrhizobium culture before sowing for biological N fixation.',
      'Use broad bed furrow (BBF) layout to prevent waterlogging during monsoon.'
    ],
    fertilizer_guide: {
      basal: 'NPK 20:60:40 kg/ha + 20 kg Sulphur'
    }
  },

  // 11. Mustard
  {
    id: 'cat-mustard',
    name: 'Mustard',
    hindi_name: 'सरसों',
    icon_emoji: '🌼',
    category: 'Oilseed',
    optimal_temperature_min: 10.0,
    optimal_temperature_max: 24.0,
    optimal_soil_moisture_min: 35.0,
    optimal_soil_moisture_max: 55.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 60.0,
    optimal_nitrogen_max: 90.0,
    optimal_phosphorus_min: 30.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 30.0,
    optimal_potassium_max: 50.0,
    kc_initial: 0.35,
    kc_mid: 1.05,
    kc_end: 0.45,
    duration_days_min: 105,
    duration_days_max: 130,
    water_requirement_mm: 350.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 5650.0,
    is_perishable: false,
    storage_duration_days: 300,
    general_tips: [
      'Apply elemental Sulphur (30 kg/ha) at sowing to increase seed oil percentage by 3-5%.',
      'Watch for Mustard Aphids during cloudy winter spells.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:40:20 kg/ha + 30 kg Sulphur/ha'
    }
  },

  // 12. Chickpea (Gram / Chana)
  {
    id: 'cat-chickpea',
    name: 'Chickpea (Gram)',
    hindi_name: 'चना',
    icon_emoji: '🫘',
    category: 'Pulse',
    optimal_temperature_min: 14.0,
    optimal_temperature_max: 26.0,
    optimal_soil_moisture_min: 30.0,
    optimal_soil_moisture_max: 50.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 8.0,
    optimal_nitrogen_min: 20.0,
    optimal_nitrogen_max: 40.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.35,
    duration_days_min: 100,
    duration_days_max: 125,
    water_requirement_mm: 300.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 5440.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Do NOT irrigate during peak flowering to avoid flower drop.',
      'Nipping shoots at 35-40 days increases lateral branching and pod yield by 20%.'
    ],
    fertilizer_guide: {
      basal: 'NPK 20:40:20 kg/ha + 20 kg Sulphur'
    }
  },

  // 13. Groundnut (Peanut)
  {
    id: 'cat-groundnut',
    name: 'Groundnut',
    hindi_name: 'मूंगफली',
    icon_emoji: '🥜',
    category: 'Oilseed',
    optimal_temperature_min: 22.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.0,
    optimal_nitrogen_min: 20.0,
    optimal_nitrogen_max: 40.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 0.40,
    kc_mid: 1.05,
    kc_end: 0.60,
    duration_days_min: 110,
    duration_days_max: 130,
    water_requirement_mm: 500.0,
    sowing_seasons: ['Kharif', 'Zaid'],
    msp_price_per_quintal: 6783.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Apply Gypsum (400 kg/ha) at pegging (45 DAS) for pod shell hardening.',
      'Loose sandy loam soil enables effortless subterranean peg entry.'
    ],
    fertilizer_guide: {
      basal: 'NPK 20:40:40 kg/ha',
      pegging: '400 kg Gypsum/ha at 40-45 DAS'
    }
  },

  // 14. Banana
  {
    id: 'cat-banana',
    name: 'Banana',
    hindi_name: 'केला',
    icon_emoji: '🍌',
    category: 'Fruit',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 55.0,
    optimal_soil_moisture_max: 75.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 200.0,
    optimal_nitrogen_max: 300.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 90.0,
    optimal_potassium_min: 250.0,
    optimal_potassium_max: 400.0,
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 1.00,
    duration_days_min: 300,
    duration_days_max: 365,
    water_requirement_mm: 1500.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 3200.0,
    is_perishable: true,
    storage_duration_days: 10,
    general_tips: [
      'Drip fertigation delivers 40% higher bunch weight with 45% water savings.',
      'Bagging bunches with blue polythene sleeves increases finger size.'
    ],
    fertilizer_guide: {
      fertigation_schedule: '200g N, 60g P2O5, 300g K2O per plant across weekly fertigations'
    }
  },

  // 15. Apple
  {
    id: 'cat-apple',
    name: 'Apple',
    hindi_name: 'सेब',
    icon_emoji: '🍎',
    category: 'Fruit',
    optimal_temperature_min: -2.0,
    optimal_temperature_max: 24.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 5.8,
    optimal_ph_max: 6.8,
    optimal_nitrogen_min: 80.0,
    optimal_nitrogen_max: 140.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 70.0,
    optimal_potassium_min: 100.0,
    optimal_potassium_max: 160.0,
    kc_initial: 0.45,
    kc_mid: 0.95,
    kc_end: 0.70,
    duration_days_min: 150,
    duration_days_max: 210,
    water_requirement_mm: 800.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 8000.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Requires 800-1200 chilling hours (< 7°C) in winter for uniform bud break.',
      'Anti-hail nets prevent fruit bruising during summer thunderstorms.'
    ],
    fertilizer_guide: {
      dormant: '500g N, 250g P, 500g K per mature tree + 30 kg FYM in December'
    }
  },

  // 16. Garlic
  {
    id: 'cat-garlic',
    name: 'Garlic',
    hindi_name: 'लहसुन',
    icon_emoji: '🧄',
    category: 'Vegetable',
    optimal_temperature_min: 12.0,
    optimal_temperature_max: 24.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 70.0,
    optimal_nitrogen_max: 100.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 70.0,
    optimal_potassium_max: 100.0,
    kc_initial: 0.50,
    kc_mid: 1.00,
    kc_end: 0.70,
    duration_days_min: 120,
    duration_days_max: 150,
    water_requirement_mm: 400.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 7500.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Withhold water 15-20 days before harvest to prevent clove sprouting in ground.',
      'Plant only large outer cloves for superior grade yield.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:40:40 kg/ha + 25 kg Sulphur'
    }
  },

  // 17. Ginger
  {
    id: 'cat-ginger',
    name: 'Ginger',
    hindi_name: 'अदरक',
    icon_emoji: '🫚',
    category: 'Spices',
    optimal_temperature_min: 18.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 6.8,
    optimal_nitrogen_min: 60.0,
    optimal_nitrogen_max: 90.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 0.80,
    duration_days_min: 210,
    duration_days_max: 260,
    water_requirement_mm: 1200.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 6200.0,
    is_perishable: false,
    storage_duration_days: 120,
    general_tips: [
      'Heavy green leaf mulching (15 t/ha) at planting is essential.',
      'Ensure excellent slope drainage to avoid fungal Soft Rot (Pythium).'
    ],
    fertilizer_guide: {
      basal: 'NPK 25:50:25 kg/ha + 25 tonnes FYM + 2 kg Trichoderma'
    }
  },

  // 18. Green Chili
  {
    id: 'cat-chili',
    name: 'Green Chili',
    hindi_name: 'हरी मिर्च',
    icon_emoji: '🌶️',
    category: 'Vegetable',
    optimal_temperature_min: 18.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 40.0,
    optimal_soil_moisture_max: 60.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.0,
    optimal_nitrogen_min: 80.0,
    optimal_nitrogen_max: 120.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 60.0,
    optimal_potassium_max: 100.0,
    kc_initial: 0.40,
    kc_mid: 1.05,
    kc_end: 0.80,
    duration_days_min: 120,
    duration_days_max: 180,
    water_requirement_mm: 550.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 4200.0,
    is_perishable: true,
    storage_duration_days: 14,
    general_tips: [
      'Manage thrips and mites aggressively to prevent Chilli Leaf Curl Virus.',
      'Frequent light irrigations yield higher grade fruits than flooding.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:50:40 kg/ha',
      split_nitrogen: '30 kg N/ha in 3 split doses at 30, 60, and 90 DAT'
    }
  },

  // 19. Brinjal (Eggplant)
  {
    id: 'cat-brinjal',
    name: 'Brinjal (Eggplant)',
    hindi_name: 'बैंगन',
    icon_emoji: '🍆',
    category: 'Vegetable',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 32.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 6.8,
    optimal_nitrogen_min: 90.0,
    optimal_nitrogen_max: 130.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 60.0,
    optimal_potassium_max: 90.0,
    kc_initial: 0.45,
    kc_mid: 1.05,
    kc_end: 0.85,
    duration_days_min: 110,
    duration_days_max: 160,
    water_requirement_mm: 600.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 1700.0,
    is_perishable: true,
    storage_duration_days: 10,
    general_tips: [
      'Clip and destroy shoots bored by Fruit and Shoot Borer larvae.',
      'Maintain 60% soil moisture — water stress causes bitter dull fruits.'
    ],
    fertilizer_guide: {
      basal: 'NPK 50:50:50 kg/ha'
    }
  },

  // 20. Cabbage
  {
    id: 'cat-cabbage',
    name: 'Cabbage',
    hindi_name: 'पत्तागोभी',
    icon_emoji: '🥬',
    category: 'Vegetable',
    optimal_temperature_min: 12.0,
    optimal_temperature_max: 22.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.0,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 70.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.45,
    kc_mid: 1.05,
    kc_end: 0.90,
    duration_days_min: 70,
    duration_days_max: 100,
    water_requirement_mm: 400.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 1400.0,
    is_perishable: true,
    storage_duration_days: 21,
    general_tips: [
      'Fluctuating soil moisture during head formation causes head bursting.',
      'Diamondback Moth (DBM) is the primary pest; use pheromone traps.'
    ],
    fertilizer_guide: {
      basal: 'NPK 60:60:60 kg/ha'
    }
  },

  // 21. Cauliflower
  {
    id: 'cat-cauliflower',
    name: 'Cauliflower',
    hindi_name: 'फूलगोभी',
    icon_emoji: '🥦',
    category: 'Vegetable',
    optimal_temperature_min: 12.0,
    optimal_temperature_max: 20.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.0,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 150.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 80.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.45,
    kc_mid: 1.05,
    kc_end: 0.85,
    duration_days_min: 75,
    duration_days_max: 105,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 1500.0,
    is_perishable: true,
    storage_duration_days: 14,
    general_tips: [
      'Blanch curds by tying outer leaves 5-7 days before harvest for snow-white quality.',
      'Boron deficiency causes browning and hollow stems — spray Borax 0.2%.'
    ],
    fertilizer_guide: {
      basal: 'NPK 60:80:60 kg/ha + 15 kg Borax'
    }
  },

  // 22. Okra (Bhindi)
  {
    id: 'cat-okra',
    name: 'Okra (Bhindi)',
    hindi_name: 'भिंडी',
    icon_emoji: '🌱',
    category: 'Vegetable',
    optimal_temperature_min: 22.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 45.0,
    optimal_soil_moisture_max: 65.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 60.0,
    optimal_nitrogen_max: 100.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 40.0,
    optimal_potassium_max: 60.0,
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.75,
    duration_days_min: 65,
    duration_days_max: 90,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Kharif', 'Zaid'],
    msp_price_per_quintal: 2200.0,
    is_perishable: true,
    storage_duration_days: 7,
    general_tips: [
      'Harvest pods every 2-3 days while tender before they turn fibrous.',
      'Plant Yellow Vein Mosaic Virus (YVMV) resistant varieties like Arka Anamika.'
    ],
    fertilizer_guide: {
      basal: 'NPK 30:50:30 kg/ha'
    }
  },

  // 23. Turmeric
  {
    id: 'cat-turmeric',
    name: 'Turmeric',
    hindi_name: 'हल्दी',
    icon_emoji: '🫚',
    category: 'Spices',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 7.2,
    optimal_nitrogen_min: 60.0,
    optimal_nitrogen_max: 90.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 0.75,
    duration_days_min: 240,
    duration_days_max: 280,
    water_requirement_mm: 1400.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 7800.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Heavy tree-leaf mulching enhances curcumin percentage and saves irrigation.',
      'Ensure ridge height is at least 30 cm for unconstrained finger rhizome growth.'
    ],
    fertilizer_guide: {
      basal: 'NPK 30:60:30 kg/ha + 25 tonnes FYM'
    }
  },

  // 24. Black Gram (Urad)
  {
    id: 'cat-urad',
    name: 'Black Gram (Urad)',
    hindi_name: 'उड़द',
    icon_emoji: '🫘',
    category: 'Pulse',
    optimal_temperature_min: 25.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 35.0,
    optimal_soil_moisture_max: 55.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 20.0,
    optimal_nitrogen_max: 30.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.35,
    duration_days_min: 70,
    duration_days_max: 85,
    water_requirement_mm: 300.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 7400.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Foliar spray of 2% DAP at peak flowering boosts pod set by 15%.',
      'Harvest when 80% pods turn black to prevent in-field shattering.'
    ],
    fertilizer_guide: {
      basal: 'NPK 20:40:20 kg/ha + Rhizobium seed treatment'
    }
  },

  // 25. Green Gram (Moong)
  {
    id: 'cat-moong',
    name: 'Green Gram (Moong)',
    hindi_name: 'मूंग',
    icon_emoji: '🫘',
    category: 'Pulse',
    optimal_temperature_min: 25.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 35.0,
    optimal_soil_moisture_max: 55.0,
    optimal_ph_min: 6.2,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 20.0,
    optimal_nitrogen_max: 30.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.35,
    duration_days_min: 60,
    duration_days_max: 75,
    water_requirement_mm: 250.0,
    sowing_seasons: ['Kharif', 'Zaid'],
    msp_price_per_quintal: 8682.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Ideal short-duration catch crop between wheat and rice.',
      'Avoid irrigation during pod ripening for uniform drying.'
    ],
    fertilizer_guide: {
      basal: 'NPK 20:40:20 kg/ha + 20 kg Sulphur'
    }
  },

  // 26. Pigeon Pea (Arhar / Tur)
  {
    id: 'cat-arhar',
    name: 'Pigeon Pea (Arhar)',
    hindi_name: 'अरहर (तूर)',
    icon_emoji: '🫘',
    category: 'Pulse',
    optimal_temperature_min: 20.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 35.0,
    optimal_soil_moisture_max: 55.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 7.5,
    optimal_nitrogen_min: 25.0,
    optimal_nitrogen_max: 35.0,
    optimal_phosphorus_min: 50.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.40,
    kc_mid: 1.05,
    kc_end: 0.40,
    duration_days_min: 140,
    duration_days_max: 180,
    water_requirement_mm: 600.0,
    sowing_seasons: ['Kharif'],
    msp_price_per_quintal: 7550.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Deep taproot system imparts outstanding drought tolerance once established.',
      'Intercrop with Soybean (1:2 ratio) or Cotton (1:4 ratio) for maximum yield.'
    ],
    fertilizer_guide: {
      basal: 'NPK 25:50:25 kg/ha + 20 kg Sulphur'
    }
  },

  // 27. Pearl Millet (Bajra)
  {
    id: 'cat-bajra',
    name: 'Pearl Millet (Bajra)',
    hindi_name: 'बाजरा',
    icon_emoji: '🌾',
    category: 'Cereal',
    optimal_temperature_min: 25.0,
    optimal_temperature_max: 38.0,
    optimal_soil_moisture_min: 25.0,
    optimal_soil_moisture_max: 45.0,
    optimal_ph_min: 6.5,
    optimal_ph_max: 8.5,
    optimal_nitrogen_min: 60.0,
    optimal_nitrogen_max: 80.0,
    optimal_phosphorus_min: 30.0,
    optimal_phosphorus_max: 40.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.35,
    kc_mid: 1.00,
    kc_end: 0.35,
    duration_days_min: 75,
    duration_days_max: 90,
    water_requirement_mm: 300.0,
    sowing_seasons: ['Kharif', 'Zaid'],
    msp_price_per_quintal: 2625.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Thrives in arid sandy soils with minimal rainfall (< 400 mm).',
      'One protective irrigation at heading stage boosts yield by 35% in dry spells.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:30:20 kg/ha'
    }
  },

  // 28. Sorghum (Jowar)
  {
    id: 'cat-jowar',
    name: 'Sorghum (Jowar)',
    hindi_name: 'ज्वार',
    icon_emoji: '🌾',
    category: 'Cereal',
    optimal_temperature_min: 22.0,
    optimal_temperature_max: 35.0,
    optimal_soil_moisture_min: 30.0,
    optimal_soil_moisture_max: 50.0,
    optimal_ph_min: 6.0,
    optimal_ph_max: 8.5,
    optimal_nitrogen_min: 80.0,
    optimal_nitrogen_max: 100.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 30.0,
    optimal_potassium_max: 40.0,
    kc_initial: 0.35,
    kc_mid: 1.05,
    kc_end: 0.45,
    duration_days_min: 95,
    duration_days_max: 115,
    water_requirement_mm: 450.0,
    sowing_seasons: ['Kharif', 'Rabi'],
    msp_price_per_quintal: 3371.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Highly drought-resilient due to waxy leaf coating and deep fibrous roots.'
    ],
    fertilizer_guide: {
      basal: 'NPK 40:40:40 kg/ha'
    }
  },

  // 29. Barley
  {
    id: 'cat-barley',
    name: 'Barley',
    hindi_name: 'जौ',
    icon_emoji: '🌾',
    category: 'Cereal',
    optimal_temperature_min: 12.0,
    optimal_temperature_max: 24.0,
    optimal_soil_moisture_min: 30.0,
    optimal_soil_moisture_max: 50.0,
    optimal_ph_min: 6.5,
    optimal_ph_max: 8.5,
    optimal_nitrogen_min: 50.0,
    optimal_nitrogen_max: 70.0,
    optimal_phosphorus_min: 25.0,
    optimal_phosphorus_max: 35.0,
    optimal_potassium_min: 20.0,
    optimal_potassium_max: 30.0,
    kc_initial: 0.35,
    kc_mid: 1.05,
    kc_end: 0.35,
    duration_days_min: 105,
    duration_days_max: 125,
    water_requirement_mm: 300.0,
    sowing_seasons: ['Rabi'],
    msp_price_per_quintal: 1850.0,
    is_perishable: false,
    storage_duration_days: 365,
    general_tips: [
      'Highest salinity and alkalinity tolerance among all temperate cereal crops.'
    ],
    fertilizer_guide: {
      basal: 'NPK 30:30:20 kg/ha'
    }
  },

  // 30. Tea
  {
    id: 'cat-tea',
    name: 'Tea',
    hindi_name: 'चाय',
    icon_emoji: '🍃',
    category: 'Plantation',
    optimal_temperature_min: 15.0,
    optimal_temperature_max: 30.0,
    optimal_soil_moisture_min: 60.0,
    optimal_soil_moisture_max: 80.0,
    optimal_ph_min: 4.5,
    optimal_ph_max: 5.5,
    optimal_nitrogen_min: 120.0,
    optimal_nitrogen_max: 160.0,
    optimal_phosphorus_min: 30.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 60.0,
    optimal_potassium_max: 100.0,
    kc_initial: 0.70,
    kc_mid: 1.00,
    kc_end: 0.90,
    duration_days_min: 300,
    duration_days_max: 365,
    water_requirement_mm: 1600.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 18000.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Requires acidic soils (pH 4.5 - 5.5) and well-drained sloping topography.',
      'Regular 7-10 day plucking round of "two leaves and a bud" maintains premium cup quality.'
    ],
    fertilizer_guide: {
      annual: 'NPK 140:40:80 kg/ha in 4 split doses during plucking season'
    }
  },

  // 31. Coffee
  {
    id: 'cat-coffee',
    name: 'Coffee',
    hindi_name: 'कॉफ़ी',
    icon_emoji: '☕',
    category: 'Plantation',
    optimal_temperature_min: 18.0,
    optimal_temperature_max: 28.0,
    optimal_soil_moisture_min: 50.0,
    optimal_soil_moisture_max: 70.0,
    optimal_ph_min: 5.5,
    optimal_ph_max: 6.5,
    optimal_nitrogen_min: 100.0,
    optimal_nitrogen_max: 140.0,
    optimal_phosphorus_min: 30.0,
    optimal_phosphorus_max: 50.0,
    optimal_potassium_min: 80.0,
    optimal_potassium_max: 120.0,
    kc_initial: 0.60,
    kc_mid: 0.90,
    kc_end: 0.80,
    duration_days_min: 240,
    duration_days_max: 300,
    water_requirement_mm: 1500.0,
    sowing_seasons: ['Kharif', 'Rabi'],
    msp_price_per_quintal: 22000.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Blossom showers in March/April are non-negotiable for synchronous flower opening.',
      'Two-tier shade tree canopy protects bushes from scorching sun.'
    ],
    fertilizer_guide: {
      pre_monsoon: 'NPK 40:30:40 kg/ha in May',
      post_monsoon: 'NPK 40:30:40 kg/ha in October'
    }
  },

  // 32. Rubber
  {
    id: 'cat-rubber',
    name: 'Rubber',
    hindi_name: 'रबर',
    icon_emoji: '🌳',
    category: 'Plantation',
    optimal_temperature_min: 22.0,
    optimal_temperature_max: 34.0,
    optimal_soil_moisture_min: 60.0,
    optimal_soil_moisture_max: 80.0,
    optimal_ph_min: 4.5,
    optimal_ph_max: 6.0,
    optimal_nitrogen_min: 80.0,
    optimal_nitrogen_max: 120.0,
    optimal_phosphorus_min: 40.0,
    optimal_phosphorus_max: 60.0,
    optimal_potassium_min: 60.0,
    optimal_potassium_max: 100.0,
    kc_initial: 0.80,
    kc_mid: 1.05,
    kc_end: 0.95,
    duration_days_min: 300,
    duration_days_max: 365,
    water_requirement_mm: 2000.0,
    sowing_seasons: ['Kharif', 'Rabi', 'Zaid'],
    msp_price_per_quintal: 18500.0,
    is_perishable: false,
    storage_duration_days: 180,
    general_tips: [
      'Tapping of latex starts after 6-7 years when trunk girth exceeds 50 cm.',
      'Rain guarding with polythene skirts enables uninterrupted monsoon tapping.'
    ],
    fertilizer_guide: {
      mature_plantation: 'NPK 30:30:30 kg/ha per annum'
    }
  }
];

export const CROP_CATEGORIES = [
  'All',
  'Cereal',
  'Pulse',
  'Vegetable',
  'Fruit',
  'Oilseed',
  'Cash Crop',
  'Spices',
  'Plantation'
] as const;

export const CROP_PRESETS = MASTER_CROP_CATALOG;


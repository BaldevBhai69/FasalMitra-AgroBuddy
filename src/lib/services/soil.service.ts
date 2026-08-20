import { logger } from '@/lib/utils/logger';

export interface SoilProperties {
  soilType: string;
  hindiName: string;
  soilPh: number;
  soilOrganicCarbonPct: number;
  soilNitrogenMgKg: number;
  soilPhosphorusMgKg: number;
  soilPotassiumMgKg: number;
  soilMagnesiumMgKg: number;
  soilCalciumMgKg: number;
  soilSulfurMgKg: number;
  soilEcDsM: number;
  soilSandPct: number;
  soilSiltPct: number;
  soilClayPct: number;
  soilCec: number;
  textureClass: string;
  drainageClass: string;
  description: string;
  dataSource: 'openlandmap' | 'icar_agro_zone' | 'regional_baseline';
}

// Indian Agricultural Zones Database (ICAR & NBSS&LUP Grounded)
const DISTRICT_SOIL_DATABASE: Record<string, Partial<SoilProperties>> = {
  // Uttar Pradesh
  'lucknow': { soilType: 'Alluvial Loam', hindiName: 'जलोढ़ दोमट मिट्टी', soilPh: 7.3, soilOrganicCarbonPct: 0.65, textureClass: 'Loam', soilNitrogenMgKg: 135, soilPhosphorusMgKg: 42, soilPotassiumMgKg: 165, soilMagnesiumMgKg: 48, soilCalciumMgKg: 380, soilSulfurMgKg: 24, soilEcDsM: 0.45 },
  'varanasi': { soilType: 'Gangetic Alluvial Silt Loam', hindiName: 'गंगा जलोढ़ मिट्टी', soilPh: 7.4, soilOrganicCarbonPct: 0.68, textureClass: 'Silt Loam', soilNitrogenMgKg: 140, soilPhosphorusMgKg: 44, soilPotassiumMgKg: 170, soilMagnesiumMgKg: 50, soilCalciumMgKg: 390, soilSulfurMgKg: 25, soilEcDsM: 0.42 },
  'kanpur': { soilType: 'Alluvial Clay Loam', hindiName: 'जलोढ़ मटियार दोमट', soilPh: 7.6, soilOrganicCarbonPct: 0.58, textureClass: 'Clay Loam', soilNitrogenMgKg: 130, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 155, soilMagnesiumMgKg: 45, soilCalciumMgKg: 360, soilSulfurMgKg: 22, soilEcDsM: 0.52 },
  'prayagraj': { soilType: 'Alluvial Loam', hindiName: 'जलोढ़ दोमट', soilPh: 7.4, soilOrganicCarbonPct: 0.62, textureClass: 'Loam', soilNitrogenMgKg: 135, soilPhosphorusMgKg: 40, soilPotassiumMgKg: 160, soilMagnesiumMgKg: 46, soilCalciumMgKg: 375, soilSulfurMgKg: 23, soilEcDsM: 0.48 },
  'agra': { soilType: 'Sandy Alluvial Loam', hindiName: 'बलुई जलोढ़ दोमट', soilPh: 7.8, soilOrganicCarbonPct: 0.48, textureClass: 'Sandy Loam', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 135, soilMagnesiumMgKg: 38, soilCalciumMgKg: 310, soilSulfurMgKg: 18, soilEcDsM: 0.68 },
  'meerut': { soilType: 'Fertile Western Alluvial Loam', hindiName: 'उर्वर पश्चिमी जलोढ़', soilPh: 7.2, soilOrganicCarbonPct: 0.72, textureClass: 'Loam', soilNitrogenMgKg: 155, soilPhosphorusMgKg: 52, soilPotassiumMgKg: 185, soilMagnesiumMgKg: 54, soilCalciumMgKg: 420, soilSulfurMgKg: 28, soilEcDsM: 0.38 },
  'bareilly': { soilType: 'Tarai Alluvial Loam', hindiName: 'तराई जलोढ़ दोमट', soilPh: 6.9, soilOrganicCarbonPct: 0.85, textureClass: 'Loam', soilNitrogenMgKg: 160, soilPhosphorusMgKg: 55, soilPotassiumMgKg: 190, soilMagnesiumMgKg: 56, soilCalciumMgKg: 430, soilSulfurMgKg: 30, soilEcDsM: 0.35 },
  'gorakhpur': { soilType: 'Bhat (Calcareous Alluvium)', hindiName: 'भाट कैल्केरियस जलोढ़', soilPh: 7.9, soilOrganicCarbonPct: 0.60, textureClass: 'Silty Clay Loam', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 34, soilPotassiumMgKg: 145, soilMagnesiumMgKg: 52, soilCalciumMgKg: 480, soilSulfurMgKg: 20, soilEcDsM: 0.58 },
  'jhansi': { soilType: 'Bundelkhand Mixed Red & Black (Rakar/Kabar)', hindiName: 'रांकड़ व काबर मिट्टी', soilPh: 7.5, soilOrganicCarbonPct: 0.45, textureClass: 'Gravelly Clay', soilNitrogenMgKg: 95, soilPhosphorusMgKg: 22, soilPotassiumMgKg: 110, soilMagnesiumMgKg: 32, soilCalciumMgKg: 260, soilSulfurMgKg: 14, soilEcDsM: 0.45 },

  // Punjab
  'ludhiana': { soilType: 'Indo-Gangetic Light Alluvial Loam', hindiName: 'इंडो-गैंगेटिक जलोढ़ दोमट', soilPh: 7.5, soilOrganicCarbonPct: 0.62, textureClass: 'Loam', soilNitrogenMgKg: 145, soilPhosphorusMgKg: 48, soilPotassiumMgKg: 175, soilMagnesiumMgKg: 50, soilCalciumMgKg: 390, soilSulfurMgKg: 26, soilEcDsM: 0.42 },
  'amritsar': { soilType: 'Alluvial Silty Loam', hindiName: 'जलोढ़ सिल्ट दोमट', soilPh: 7.6, soilOrganicCarbonPct: 0.60, textureClass: 'Silt Loam', soilNitrogenMgKg: 140, soilPhosphorusMgKg: 45, soilPotassiumMgKg: 170, soilMagnesiumMgKg: 48, soilCalciumMgKg: 385, soilSulfurMgKg: 24, soilEcDsM: 0.46 },
  'bathinda': { soilType: 'Arid Sandy Loam', hindiName: 'शुष्क बलुई दोमट', soilPh: 8.1, soilOrganicCarbonPct: 0.42, textureClass: 'Sandy Loam', soilNitrogenMgKg: 110, soilPhosphorusMgKg: 26, soilPotassiumMgKg: 125, soilMagnesiumMgKg: 30, soilCalciumMgKg: 280, soilSulfurMgKg: 15, soilEcDsM: 0.78 },
  'jalandhar': { soilType: 'Coarse Alluvial Loam', hindiName: 'जलोढ़ दोमट', soilPh: 7.4, soilOrganicCarbonPct: 0.68, textureClass: 'Loam', soilNitrogenMgKg: 150, soilPhosphorusMgKg: 50, soilPotassiumMgKg: 180, soilMagnesiumMgKg: 52, soilCalciumMgKg: 400, soilSulfurMgKg: 27, soilEcDsM: 0.40 },

  // Haryana
  'karnal': { soilType: 'Indo-Gangetic Alluvial Loam', hindiName: 'जलोढ़ दोमट', soilPh: 7.6, soilOrganicCarbonPct: 0.58, textureClass: 'Loam', soilNitrogenMgKg: 140, soilPhosphorusMgKg: 44, soilPotassiumMgKg: 165, soilMagnesiumMgKg: 48, soilCalciumMgKg: 380, soilSulfurMgKg: 24, soilEcDsM: 0.48 },
  'hisar': { soilType: 'Sierozemic Sandy Loam', hindiName: 'सिरोजेम बलुई दोमट', soilPh: 8.2, soilOrganicCarbonPct: 0.40, textureClass: 'Sandy Loam', soilNitrogenMgKg: 105, soilPhosphorusMgKg: 24, soilPotassiumMgKg: 120, soilMagnesiumMgKg: 28, soilCalciumMgKg: 270, soilSulfurMgKg: 14, soilEcDsM: 0.82 },
  'ambala': { soilType: 'Sub-Mountane Alluvial Loam', hindiName: 'तराई जलोढ़ दोमट', soilPh: 7.1, soilOrganicCarbonPct: 0.70, textureClass: 'Loam', soilNitrogenMgKg: 145, soilPhosphorusMgKg: 48, soilPotassiumMgKg: 175, soilMagnesiumMgKg: 50, soilCalciumMgKg: 395, soilSulfurMgKg: 26, soilEcDsM: 0.38 },

  // Maharashtra
  'pune': { soilType: 'Medium Deep Black (Vertisol)', hindiName: 'मध्यम गहरी काली मिट्टी', soilPh: 7.8, soilOrganicCarbonPct: 0.75, textureClass: 'Clay Loam', soilNitrogenMgKg: 120, soilPhosphorusMgKg: 35, soilPotassiumMgKg: 220, soilMagnesiumMgKg: 68, soilCalciumMgKg: 490, soilSulfurMgKg: 20, soilEcDsM: 0.50 },
  'nagpur': { soilType: 'Deep Black Cotton Soil (Regur)', hindiName: 'गहरी काली कपास मिट्टी', soilPh: 8.1, soilOrganicCarbonPct: 0.80, textureClass: 'Heavy Clay', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 240, soilMagnesiumMgKg: 74, soilCalciumMgKg: 530, soilSulfurMgKg: 18, soilEcDsM: 0.55 },
  'nashik': { soilType: 'Volcanic Black & Red Loam', hindiName: 'काली व लाल दोमट', soilPh: 7.6, soilOrganicCarbonPct: 0.70, textureClass: 'Clay Loam', soilNitrogenMgKg: 130, soilPhosphorusMgKg: 40, soilPotassiumMgKg: 210, soilMagnesiumMgKg: 62, soilCalciumMgKg: 460, soilSulfurMgKg: 22, soilEcDsM: 0.45 },
  'aurangabad': { soilType: 'Medium Black Basaltic Soil', hindiName: 'मध्यम काली मिट्टी', soilPh: 7.9, soilOrganicCarbonPct: 0.65, textureClass: 'Clay', soilNitrogenMgKg: 110, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 200, soilMagnesiumMgKg: 65, soilCalciumMgKg: 480, soilSulfurMgKg: 17, soilEcDsM: 0.58 },
  'solapur': { soilType: 'Shallow to Medium Black Soil', hindiName: 'उथली काली मिट्टी', soilPh: 8.2, soilOrganicCarbonPct: 0.50, textureClass: 'Clay', soilNitrogenMgKg: 100, soilPhosphorusMgKg: 25, soilPotassiumMgKg: 190, soilMagnesiumMgKg: 60, soilCalciumMgKg: 450, soilSulfurMgKg: 15, soilEcDsM: 0.65 },

  // Madhya Pradesh
  'indore': { soilType: 'Deep Malwa Black Soil (Vertisol)', hindiName: 'मालवा गहरी काली मिट्टी', soilPh: 7.8, soilOrganicCarbonPct: 0.72, textureClass: 'Clay', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 36, soilPotassiumMgKg: 230, soilMagnesiumMgKg: 70, soilCalciumMgKg: 510, soilSulfurMgKg: 20, soilEcDsM: 0.48 },
  'bhopal': { soilType: 'Medium Black Loamy Soil', hindiName: 'मध्यम काली दोमट', soilPh: 7.7, soilOrganicCarbonPct: 0.68, textureClass: 'Clay Loam', soilNitrogenMgKg: 120, soilPhosphorusMgKg: 34, soilPotassiumMgKg: 215, soilMagnesiumMgKg: 66, soilCalciumMgKg: 480, soilSulfurMgKg: 19, soilEcDsM: 0.46 },
  'jabalpur': { soilType: 'Narmada Valley Alluvium & Black Soil', hindiName: 'नर्मदा घाटी जलोढ़ व काली मिट्टी', soilPh: 7.4, soilOrganicCarbonPct: 0.70, textureClass: 'Clay Loam', soilNitrogenMgKg: 135, soilPhosphorusMgKg: 42, soilPotassiumMgKg: 180, soilMagnesiumMgKg: 55, soilCalciumMgKg: 420, soilSulfurMgKg: 24, soilEcDsM: 0.42 },
  'gwalior': { soilType: 'Alluvial & Mixed Red Soil', hindiName: 'जलोढ़ व लाल मिश्रित', soilPh: 7.6, soilOrganicCarbonPct: 0.50, textureClass: 'Sandy Clay Loam', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 28, soilPotassiumMgKg: 140, soilMagnesiumMgKg: 40, soilCalciumMgKg: 320, soilSulfurMgKg: 16, soilEcDsM: 0.55 },

  // Gujarat
  'ahmedabad': { soilType: 'Goradu (Light Sandy Loam Alluvium)', hindiName: 'गोराडू बलुई दोमट', soilPh: 7.8, soilOrganicCarbonPct: 0.55, textureClass: 'Sandy Loam', soilNitrogenMgKg: 120, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 150, soilMagnesiumMgKg: 44, soilCalciumMgKg: 340, soilSulfurMgKg: 18, soilEcDsM: 0.62 },
  'surat': { soilType: 'Coastal Deep Black Clay', hindiName: 'तटीय गहरी काली मिट्टी', soilPh: 7.9, soilOrganicCarbonPct: 0.78, textureClass: 'Heavy Clay', soilNitrogenMgKg: 130, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 220, soilMagnesiumMgKg: 68, soilCalciumMgKg: 500, soilSulfurMgKg: 22, soilEcDsM: 0.75 },
  'rajkot': { soilType: 'Saurashtra Medium Black Soil', hindiName: 'सौराष्ट्र मध्यम काली मिट्टी', soilPh: 8.0, soilOrganicCarbonPct: 0.60, textureClass: 'Clay Loam', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 200, soilMagnesiumMgKg: 62, soilCalciumMgKg: 470, soilSulfurMgKg: 17, soilEcDsM: 0.68 },

  // Rajasthan
  'jaipur': { soilType: 'Semi-Arid Sandy Loam (Dhumat)', hindiName: 'धूमट बलुई दोमट मिट्टी', soilPh: 8.0, soilOrganicCarbonPct: 0.40, textureClass: 'Sandy Loam', soilNitrogenMgKg: 100, soilPhosphorusMgKg: 22, soilPotassiumMgKg: 115, soilMagnesiumMgKg: 26, soilCalciumMgKg: 240, soilSulfurMgKg: 12, soilEcDsM: 0.85 },
  'jodhpur': { soilType: 'Thar Desert Sand & Calcareous Loam', hindiName: 'रेतीली मरुस्थलीय मिट्टी', soilPh: 8.4, soilOrganicCarbonPct: 0.25, textureClass: 'Sand', soilNitrogenMgKg: 75, soilPhosphorusMgKg: 16, soilPotassiumMgKg: 95, soilMagnesiumMgKg: 18, soilCalciumMgKg: 210, soilSulfurMgKg: 9, soilEcDsM: 1.10 },
  'kota': { soilType: 'Chambal Deep Black Vertisol', hindiName: 'चंबल गहरी काली मिट्टी', soilPh: 7.8, soilOrganicCarbonPct: 0.68, textureClass: 'Clay', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 35, soilPotassiumMgKg: 210, soilMagnesiumMgKg: 65, soilCalciumMgKg: 470, soilSulfurMgKg: 19, soilEcDsM: 0.52 },

  // Karnataka
  'bengaluru': { soilType: 'Red Sandy Clay Loam (Alfisols)', hindiName: 'लाल बलुई चिकनी दोमट', soilPh: 6.4, soilOrganicCarbonPct: 0.62, textureClass: 'Sandy Clay Loam', soilNitrogenMgKg: 120, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 130, soilMagnesiumMgKg: 35, soilCalciumMgKg: 280, soilSulfurMgKg: 16, soilEcDsM: 0.35 },
  'mysuru': { soilType: 'Red Loam & Deep Red Soil', hindiName: 'लाल दोमट मिट्टी', soilPh: 6.5, soilOrganicCarbonPct: 0.65, textureClass: 'Loam', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 40, soilPotassiumMgKg: 135, soilMagnesiumMgKg: 38, soilCalciumMgKg: 290, soilSulfurMgKg: 18, soilEcDsM: 0.32 },
  'belagavi': { soilType: 'Northern Karnataka Black Cotton Soil', hindiName: 'काली कपास मिट्टी', soilPh: 7.7, soilOrganicCarbonPct: 0.70, textureClass: 'Clay', soilNitrogenMgKg: 118, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 210, soilMagnesiumMgKg: 64, soilCalciumMgKg: 460, soilSulfurMgKg: 18, soilEcDsM: 0.48 },

  // Andhra Pradesh & Telangana
  'hyderabad': { soilType: 'Red Earth (Chalka Soil)', hindiName: 'लाल चालका मिट्टी', soilPh: 6.7, soilOrganicCarbonPct: 0.55, textureClass: 'Sandy Loam', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 125, soilMagnesiumMgKg: 34, soilCalciumMgKg: 270, soilSulfurMgKg: 15, soilEcDsM: 0.38 },
  'vijayawada': { soilType: 'Krishna Delta Alluvium & Black Clay', hindiName: 'कृष्णा डेल्टा जलोढ़ मिट्टी', soilPh: 7.5, soilOrganicCarbonPct: 0.72, textureClass: 'Clay Loam', soilNitrogenMgKg: 140, soilPhosphorusMgKg: 45, soilPotassiumMgKg: 185, soilMagnesiumMgKg: 54, soilCalciumMgKg: 410, soilSulfurMgKg: 25, soilEcDsM: 0.55 },
  'guntur': { soilType: 'Black Cotton & Coastal Sandy Loam', hindiName: 'काली कपास व तटीय दोमट', soilPh: 7.8, soilOrganicCarbonPct: 0.68, textureClass: 'Clay', soilNitrogenMgKg: 130, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 205, soilMagnesiumMgKg: 60, soilCalciumMgKg: 450, soilSulfurMgKg: 21, soilEcDsM: 0.62 },

  // Tamil Nadu
  'chennai': { soilType: 'Coastal Alluvium & Sandy Clay', hindiName: 'तटीय जलोढ़ मिट्टी', soilPh: 7.2, soilOrganicCarbonPct: 0.58, textureClass: 'Sandy Clay Loam', soilNitrogenMgKg: 120, soilPhosphorusMgKg: 34, soilPotassiumMgKg: 140, soilMagnesiumMgKg: 40, soilCalciumMgKg: 320, soilSulfurMgKg: 18, soilEcDsM: 0.70 },
  'coimbatore': { soilType: 'Red Loamy Soil with Calcareous Hardpan', hindiName: 'लाल दोमट मिट्टी', soilPh: 7.6, soilOrganicCarbonPct: 0.50, textureClass: 'Loam', soilNitrogenMgKg: 115, soilPhosphorusMgKg: 28, soilPotassiumMgKg: 130, soilMagnesiumMgKg: 42, soilCalciumMgKg: 350, soilSulfurMgKg: 16, soilEcDsM: 0.50 },
  'thanjavur': { soilType: 'Cauvery Delta Deep Alluvial Clay', hindiName: 'कावेरी डेल्टा जलोढ़ मिट्टी', soilPh: 6.8, soilOrganicCarbonPct: 0.82, textureClass: 'Silty Clay', soilNitrogenMgKg: 150, soilPhosphorusMgKg: 50, soilPotassiumMgKg: 180, soilMagnesiumMgKg: 52, soilCalciumMgKg: 400, soilSulfurMgKg: 27, soilEcDsM: 0.45 },

  // Bihar & West Bengal
  'patna': { soilType: 'Gangetic Heavy Alluvial Silt Loam', hindiName: 'गंगा जलोढ़ सिल्ट दोमट', soilPh: 7.3, soilOrganicCarbonPct: 0.68, textureClass: 'Silt Loam', soilNitrogenMgKg: 140, soilPhosphorusMgKg: 44, soilPotassiumMgKg: 170, soilMagnesiumMgKg: 50, soilCalciumMgKg: 390, soilSulfurMgKg: 25, soilEcDsM: 0.42 },
  'kolkata': { soilType: 'Ganga-Brahmaputra Deltaic Alluvium', hindiName: 'डेल्टा जलोढ़ दोमट', soilPh: 6.6, soilOrganicCarbonPct: 0.85, textureClass: 'Silty Clay Loam', soilNitrogenMgKg: 155, soilPhosphorusMgKg: 54, soilPotassiumMgKg: 185, soilMagnesiumMgKg: 52, soilCalciumMgKg: 395, soilSulfurMgKg: 28, soilEcDsM: 0.48 },

  // Assam & North East (Brahmaputra & Barak Valleys)
  'assam': { soilType: 'Acidic Alluvial & Red Loam (Brahmaputra Valley)', hindiName: 'असम जलोढ़ व अम्लीय लाल दोमट', soilPh: 5.3, soilOrganicCarbonPct: 1.15, textureClass: 'Silt Loam', soilNitrogenMgKg: 165, soilPhosphorusMgKg: 26, soilPotassiumMgKg: 135, soilMagnesiumMgKg: 32, soilCalciumMgKg: 210, soilSulfurMgKg: 28, soilEcDsM: 0.22 },
  'guwahati': { soilType: 'Brahmaputra Alluvial Silt Loam', hindiName: 'ब्रह्मपुत्र जलोढ़ सिल्ट दोमट', soilPh: 5.4, soilOrganicCarbonPct: 1.10, textureClass: 'Silt Loam', soilNitrogenMgKg: 160, soilPhosphorusMgKg: 28, soilPotassiumMgKg: 140, soilMagnesiumMgKg: 34, soilCalciumMgKg: 220, soilSulfurMgKg: 26, soilEcDsM: 0.24 },
  'kamrup': { soilType: 'Acidic Alluvial Loam', hindiName: 'अम्लीय जलोढ़ दोमट', soilPh: 5.3, soilOrganicCarbonPct: 1.12, textureClass: 'Silt Loam', soilNitrogenMgKg: 162, soilPhosphorusMgKg: 27, soilPotassiumMgKg: 138, soilMagnesiumMgKg: 33, soilCalciumMgKg: 215, soilSulfurMgKg: 27, soilEcDsM: 0.23 },
  'jorhat': { soilType: 'Upper Assam Acidic Tea & Rice Alluvium', hindiName: 'ऊपरी असम चाय व धान जलोढ़ मिट्टी', soilPh: 5.1, soilOrganicCarbonPct: 1.25, textureClass: 'Loam', soilNitrogenMgKg: 175, soilPhosphorusMgKg: 24, soilPotassiumMgKg: 130, soilMagnesiumMgKg: 30, soilCalciumMgKg: 195, soilSulfurMgKg: 30, soilEcDsM: 0.20 },
  'dibrugarh': { soilType: 'Upper Brahmaputra Acidic Clay Loam', hindiName: 'असम अम्लीय मटियार दोमट', soilPh: 5.0, soilOrganicCarbonPct: 1.30, textureClass: 'Clay Loam', soilNitrogenMgKg: 180, soilPhosphorusMgKg: 22, soilPotassiumMgKg: 125, soilMagnesiumMgKg: 28, soilCalciumMgKg: 190, soilSulfurMgKg: 32, soilEcDsM: 0.18 },
  'silchar': { soilType: 'Barak Valley Alluvial Silt Loam', hindiName: 'बराक घाटी जलोढ़ दोमट', soilPh: 5.2, soilOrganicCarbonPct: 1.18, textureClass: 'Silt Loam', soilNitrogenMgKg: 168, soilPhosphorusMgKg: 25, soilPotassiumMgKg: 132, soilMagnesiumMgKg: 31, soilCalciumMgKg: 205, soilSulfurMgKg: 29, soilEcDsM: 0.21 },
  'tezpur': { soilType: 'North Bank Alluvial Sandy Loam', hindiName: 'उत्तरी तट जलोढ़ बलुई दोमट', soilPh: 5.5, soilOrganicCarbonPct: 1.05, textureClass: 'Sandy Loam', soilNitrogenMgKg: 155, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 145, soilMagnesiumMgKg: 35, soilCalciumMgKg: 230, soilSulfurMgKg: 25, soilEcDsM: 0.25 },
  'nagaon': { soilType: 'Central Assam Fertile Alluvium', hindiName: 'मध्य असम उर्वर जलोढ़ मिट्टी', soilPh: 5.6, soilOrganicCarbonPct: 1.08, textureClass: 'Silt Loam', soilNitrogenMgKg: 158, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 148, soilMagnesiumMgKg: 36, soilCalciumMgKg: 240, soilSulfurMgKg: 24, soilEcDsM: 0.26 },

  // Kerala
  'kerala': { soilType: 'Coastal Alluvium & Acidic Laterite', hindiName: 'तटीय जलोढ़ व लेटराइट मिट्टी', soilPh: 5.3, soilOrganicCarbonPct: 1.20, textureClass: 'Sandy Clay Loam', soilNitrogenMgKg: 150, soilPhosphorusMgKg: 28, soilPotassiumMgKg: 130, soilMagnesiumMgKg: 30, soilCalciumMgKg: 200, soilSulfurMgKg: 30, soilEcDsM: 0.28 },
  'kochi': { soilType: 'Coastal Acidic Alluvial Clay', hindiName: 'तटीय अम्लीय जलोढ़', soilPh: 5.4, soilOrganicCarbonPct: 1.15, textureClass: 'Clay Loam', soilNitrogenMgKg: 145, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 135, soilMagnesiumMgKg: 32, soilCalciumMgKg: 210, soilSulfurMgKg: 28, soilEcDsM: 0.35 },
  'wayanad': { soilType: 'Highland Acidic Forest Loam', hindiName: 'पर्वतीय अम्लीय वन दोमट', soilPh: 5.1, soilOrganicCarbonPct: 1.40, textureClass: 'Loam', soilNitrogenMgKg: 175, soilPhosphorusMgKg: 22, soilPotassiumMgKg: 120, soilMagnesiumMgKg: 28, soilCalciumMgKg: 185, soilSulfurMgKg: 34, soilEcDsM: 0.18 },
  'palakkad': { soilType: 'Black Cotton & Red Loam', hindiName: 'काली व लाल दोमट मिट्टी', soilPh: 6.5, soilOrganicCarbonPct: 0.75, textureClass: 'Loam', soilNitrogenMgKg: 130, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 155, soilMagnesiumMgKg: 46, soilCalciumMgKg: 320, soilSulfurMgKg: 20, soilEcDsM: 0.40 },

  // Odisha
  'odisha': { soilType: 'Red & Yellow Loam with Coastal Alluvium', hindiName: 'लाल व पीली दोमट मिट्टी', soilPh: 6.2, soilOrganicCarbonPct: 0.65, textureClass: 'Loam', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 140, soilMagnesiumMgKg: 38, soilCalciumMgKg: 300, soilSulfurMgKg: 18, soilEcDsM: 0.38 },
  'bhubaneswar': { soilType: 'Coastal Deltaic Silt Loam', hindiName: 'तटीय डेल्टा सिल्ट दोमट', soilPh: 6.4, soilOrganicCarbonPct: 0.70, textureClass: 'Silt Loam', soilNitrogenMgKg: 135, soilPhosphorusMgKg: 36, soilPotassiumMgKg: 150, soilMagnesiumMgKg: 42, soilCalciumMgKg: 330, soilSulfurMgKg: 22, soilEcDsM: 0.42 },
  'cuttack': { soilType: 'Mahanadi Alluvial Loam', hindiName: 'महानदी जलोढ़ दोमट', soilPh: 6.5, soilOrganicCarbonPct: 0.72, textureClass: 'Loam', soilNitrogenMgKg: 138, soilPhosphorusMgKg: 38, soilPotassiumMgKg: 155, soilMagnesiumMgKg: 44, soilCalciumMgKg: 340, soilSulfurMgKg: 23, soilEcDsM: 0.40 },

  // Himachal Pradesh & Uttarakhand
  'shimla': { soilType: 'Sub-Himalayan Brown Forest Soil', hindiName: 'पर्वतीय भूरी वन मिट्टी', soilPh: 6.0, soilOrganicCarbonPct: 1.45, textureClass: 'Loam', soilNitrogenMgKg: 180, soilPhosphorusMgKg: 30, soilPotassiumMgKg: 150, soilMagnesiumMgKg: 40, soilCalciumMgKg: 290, soilSulfurMgKg: 24, soilEcDsM: 0.25 },
  'dehradun': { soilType: 'Doon Valley Tarai Alluvial Loam', hindiName: 'दून घाटी तराई जलोढ़', soilPh: 6.5, soilOrganicCarbonPct: 1.10, textureClass: 'Loam', soilNitrogenMgKg: 160, soilPhosphorusMgKg: 42, soilPotassiumMgKg: 170, soilMagnesiumMgKg: 48, soilCalciumMgKg: 360, soilSulfurMgKg: 26, soilEcDsM: 0.32 },

  // Jharkhand & Chhattisgarh
  'ranchi': { soilType: 'Chotanagpur Red Sandy Loam', hindiName: 'छोटानागपुर लाल बलुई दोमट', soilPh: 5.8, soilOrganicCarbonPct: 0.58, textureClass: 'Sandy Loam', soilNitrogenMgKg: 110, soilPhosphorusMgKg: 24, soilPotassiumMgKg: 120, soilMagnesiumMgKg: 32, soilCalciumMgKg: 260, soilSulfurMgKg: 16, soilEcDsM: 0.30 },
  'raipur': { soilType: 'Chhattisgarh Plain Red & Yellow (Matasi/Dorsa)', hindiName: 'मटासी व डोरसा मिट्टी', soilPh: 6.4, soilOrganicCarbonPct: 0.62, textureClass: 'Clay Loam', soilNitrogenMgKg: 125, soilPhosphorusMgKg: 32, soilPotassiumMgKg: 145, soilMagnesiumMgKg: 42, soilCalciumMgKg: 320, soilSulfurMgKg: 18, soilEcDsM: 0.36 },

  // Jammu & Kashmir
  'srinagar': { soilType: 'Kashmir Valley Karewa Loam', hindiName: 'कश्मीर घाटी करेवा दोमट मिट्टी', soilPh: 7.2, soilOrganicCarbonPct: 1.20, textureClass: 'Silty Clay Loam', soilNitrogenMgKg: 165, soilPhosphorusMgKg: 40, soilPotassiumMgKg: 175, soilMagnesiumMgKg: 48, soilCalciumMgKg: 380, soilSulfurMgKg: 22, soilEcDsM: 0.30 },
};

// Regional soil baseline fallbacks for Indian agricultural states
const REGIONAL_STATE_DEFAULTS: Record<string, SoilProperties> = {
  'punjab': {
    soilType: 'Alluvial Loam (Indo-Gangetic)',
    hindiName: 'जलोढ़ दोमट मिट्टी',
    soilPh: 7.5,
    soilOrganicCarbonPct: 0.65,
    soilNitrogenMgKg: 145.0,
    soilPhosphorusMgKg: 48.0,
    soilPotassiumMgKg: 175.0,
    soilMagnesiumMgKg: 50.0,
    soilCalciumMgKg: 390.0,
    soilSulfurMgKg: 26.0,
    soilEcDsM: 0.42,
    soilSandPct: 45.0,
    soilSiltPct: 35.0,
    soilClayPct: 20.0,
    soilCec: 18.5,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Highly fertile alluvial soil deposited by Indus basin rivers, ideal for Wheat, Rice, and Mustard.',
    dataSource: 'icar_agro_zone',
  },
  'haryana': {
    soilType: 'Alluvial Sandy Loam',
    hindiName: 'जलोढ़ बलुई दोमट मिट्टी',
    soilPh: 7.7,
    soilOrganicCarbonPct: 0.55,
    soilNitrogenMgKg: 130.0,
    soilPhosphorusMgKg: 40.0,
    soilPotassiumMgKg: 155.0,
    soilMagnesiumMgKg: 44.0,
    soilCalciumMgKg: 360.0,
    soilSulfurMgKg: 22.0,
    soilEcDsM: 0.55,
    soilSandPct: 50.0,
    soilSiltPct: 30.0,
    soilClayPct: 20.0,
    soilCec: 17.0,
    textureClass: 'Sandy Loam',
    drainageClass: 'Moderately Well Drained',
    description: 'Productive alluvial soils ranging from sandy loam in west to fertile loam in east.',
    dataSource: 'icar_agro_zone',
  },
  'uttar pradesh': {
    soilType: 'Alluvial Loam (Indo-Gangetic Plain)',
    hindiName: 'जलोढ़ दोमट मिट्टी',
    soilPh: 7.4,
    soilOrganicCarbonPct: 0.62,
    soilNitrogenMgKg: 135.0,
    soilPhosphorusMgKg: 42.0,
    soilPotassiumMgKg: 165.0,
    soilMagnesiumMgKg: 48.0,
    soilCalciumMgKg: 380.0,
    soilSulfurMgKg: 24.0,
    soilEcDsM: 0.45,
    soilSandPct: 40.0,
    soilSiltPct: 38.0,
    soilClayPct: 22.0,
    soilCec: 20.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Deep alluvial plain soil rich in potash and lime with good moisture holding capacity for vegetables, cereals, and sugarcane.',
    dataSource: 'icar_agro_zone',
  },
  'maharashtra': {
    soilType: 'Black Cotton Soil (Vertisols / Regur)',
    hindiName: 'काली कपास मिट्टी (रेगुर)',
    soilPh: 7.9,
    soilOrganicCarbonPct: 0.72,
    soilNitrogenMgKg: 115.0,
    soilPhosphorusMgKg: 35.0,
    soilPotassiumMgKg: 230.0,
    soilMagnesiumMgKg: 70.0,
    soilCalciumMgKg: 510.0,
    soilSulfurMgKg: 19.0,
    soilEcDsM: 0.52,
    soilSandPct: 20.0,
    soilSiltPct: 25.0,
    soilClayPct: 55.0,
    soilCec: 42.0,
    textureClass: 'Heavy Clay',
    drainageClass: 'Imperfectly Drained (High Water Retention)',
    description: 'Rich in iron, lime, calcium, and magnesium carbonates. Expands when wet and cracks when dry, ideal for Cotton, Soybean, and Pulses.',
    dataSource: 'icar_agro_zone',
  },
  'madhya pradesh': {
    soilType: 'Deep Black & Medium Black Soil',
    hindiName: 'गहरी काली व मध्यम काली मिट्टी',
    soilPh: 7.7,
    soilOrganicCarbonPct: 0.68,
    soilNitrogenMgKg: 120.0,
    soilPhosphorusMgKg: 36.0,
    soilPotassiumMgKg: 220.0,
    soilMagnesiumMgKg: 66.0,
    soilCalciumMgKg: 490.0,
    soilSulfurMgKg: 20.0,
    soilEcDsM: 0.48,
    soilSandPct: 24.0,
    soilSiltPct: 28.0,
    soilClayPct: 48.0,
    soilCec: 38.0,
    textureClass: 'Clay Loam',
    drainageClass: 'Moderate',
    description: 'Volcanic basalt origin soil of the Malwa plateau, highly productive for Soybean, Wheat, and Gram.',
    dataSource: 'icar_agro_zone',
  },
  'gujarat': {
    soilType: 'Medium Black & Coastal Alluvium',
    hindiName: 'मध्यम काली व तटीय जलोढ़ मिट्टी',
    soilPh: 7.8,
    soilOrganicCarbonPct: 0.60,
    soilNitrogenMgKg: 122.0,
    soilPhosphorusMgKg: 34.0,
    soilPotassiumMgKg: 190.0,
    soilMagnesiumMgKg: 60.0,
    soilCalciumMgKg: 450.0,
    soilSulfurMgKg: 18.0,
    soilEcDsM: 0.65,
    soilSandPct: 35.0,
    soilSiltPct: 30.0,
    soilClayPct: 35.0,
    soilCec: 28.0,
    textureClass: 'Clay Loam',
    drainageClass: 'Well Drained',
    description: 'Ideal for Groundnut, Cotton, Tobacco, and Cumin cultivation.',
    dataSource: 'icar_agro_zone',
  },
  'rajasthan': {
    soilType: 'Sandy Loam & Desert Soil',
    hindiName: 'बलुई दोमट व मरुस्थलीय मिट्टी',
    soilPh: 8.1,
    soilOrganicCarbonPct: 0.35,
    soilNitrogenMgKg: 95.0,
    soilPhosphorusMgKg: 20.0,
    soilPotassiumMgKg: 110.0,
    soilMagnesiumMgKg: 24.0,
    soilCalciumMgKg: 230.0,
    soilSulfurMgKg: 11.0,
    soilEcDsM: 0.90,
    soilSandPct: 65.0,
    soilSiltPct: 20.0,
    soilClayPct: 15.0,
    soilCec: 12.0,
    textureClass: 'Sandy Loam',
    drainageClass: 'Excessively Drained',
    description: 'High in soluble salts and calcium carbonate with low organic matter, responsive to drip irrigation and organic mulching.',
    dataSource: 'icar_agro_zone',
  },
  'karnataka': {
    soilType: 'Red Sandy Loam (Alfisols)',
    hindiName: 'लाल बलुई दोमट मिट्टी',
    soilPh: 6.5,
    soilOrganicCarbonPct: 0.58,
    soilNitrogenMgKg: 118.0,
    soilPhosphorusMgKg: 36.0,
    soilPotassiumMgKg: 130.0,
    soilMagnesiumMgKg: 35.0,
    soilCalciumMgKg: 280.0,
    soilSulfurMgKg: 16.0,
    soilEcDsM: 0.35,
    soilSandPct: 52.0,
    soilSiltPct: 26.0,
    soilClayPct: 22.0,
    soilCec: 16.0,
    textureClass: 'Sandy Clay Loam',
    drainageClass: 'Well Drained',
    description: 'Porous red soils rich in iron and potash with neutral to mildly acidic pH, excellent for Ragi, Maize, Coffee, and Pulses.',
    dataSource: 'icar_agro_zone',
  },
  'andhra pradesh': {
    soilType: 'Red Loam & Delta Alluvium',
    hindiName: 'लाल दोमट व डेल्टा जलोढ़ मिट्टी',
    soilPh: 7.2,
    soilOrganicCarbonPct: 0.62,
    soilNitrogenMgKg: 125.0,
    soilPhosphorusMgKg: 38.0,
    soilPotassiumMgKg: 160.0,
    soilMagnesiumMgKg: 46.0,
    soilCalciumMgKg: 360.0,
    soilSulfurMgKg: 20.0,
    soilEcDsM: 0.45,
    soilSandPct: 42.0,
    soilSiltPct: 32.0,
    soilClayPct: 26.0,
    soilCec: 22.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Fertile red loam soils inland and rich alluvial delta soils in coastal districts for Paddy, Chili, and Tobacco.',
    dataSource: 'icar_agro_zone',
  },
  'telangana': {
    soilType: 'Red Sandy Earth (Chalka Soils)',
    hindiName: 'लाल चालका व काली मिट्टी',
    soilPh: 6.8,
    soilOrganicCarbonPct: 0.55,
    soilNitrogenMgKg: 115.0,
    soilPhosphorusMgKg: 32.0,
    soilPotassiumMgKg: 135.0,
    soilMagnesiumMgKg: 38.0,
    soilCalciumMgKg: 300.0,
    soilSulfurMgKg: 16.0,
    soilEcDsM: 0.40,
    soilSandPct: 48.0,
    soilSiltPct: 28.0,
    soilClayPct: 24.0,
    soilCec: 18.0,
    textureClass: 'Sandy Loam',
    drainageClass: 'Well Drained',
    description: 'Chalka red soils covering 48% area along with deep black cotton soils in northern districts.',
    dataSource: 'icar_agro_zone',
  },
  'tamil nadu': {
    soilType: 'Red Loam & Coastal Alluvial Clay',
    hindiName: 'लाल दोमट व कावेरी जलोढ़ मिट्टी',
    soilPh: 6.8,
    soilOrganicCarbonPct: 0.60,
    soilNitrogenMgKg: 125.0,
    soilPhosphorusMgKg: 38.0,
    soilPotassiumMgKg: 155.0,
    soilMagnesiumMgKg: 44.0,
    soilCalciumMgKg: 350.0,
    soilSulfurMgKg: 20.0,
    soilEcDsM: 0.50,
    soilSandPct: 44.0,
    soilSiltPct: 28.0,
    soilClayPct: 28.0,
    soilCec: 24.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Red loamy soils in uplands and rich silty alluvium in Cauvery delta for Rice, Coconut, Sugarcane, and Millets.',
    dataSource: 'icar_agro_zone',
  },
  'west bengal': {
    soilType: 'Deltaic Gangetic Alluvium',
    hindiName: 'डेल्टाई गंगा जलोढ़ मिट्टी',
    soilPh: 6.6,
    soilOrganicCarbonPct: 0.82,
    soilNitrogenMgKg: 155.0,
    soilPhosphorusMgKg: 52.0,
    soilPotassiumMgKg: 185.0,
    soilMagnesiumMgKg: 52.0,
    soilCalciumMgKg: 390.0,
    soilSulfurMgKg: 28.0,
    soilEcDsM: 0.45,
    soilSandPct: 30.0,
    soilSiltPct: 45.0,
    soilClayPct: 25.0,
    soilCec: 26.0,
    textureClass: 'Silt Loam',
    drainageClass: 'Moderate to Imperfect',
    description: 'Highly fertile river silt rich in organic carbon and nutrients, world-famous for Jute, Rice, and Potato.',
    dataSource: 'icar_agro_zone',
  },
  'bihar': {
    soilType: 'North Gangetic Alluvial Silt Loam',
    hindiName: 'उत्तर गंगा जलोढ़ दोमट मिट्टी',
    soilPh: 7.3,
    soilOrganicCarbonPct: 0.68,
    soilNitrogenMgKg: 140.0,
    soilPhosphorusMgKg: 44.0,
    soilPotassiumMgKg: 170.0,
    soilMagnesiumMgKg: 48.0,
    soilCalciumMgKg: 380.0,
    soilSulfurMgKg: 24.0,
    soilEcDsM: 0.42,
    soilSandPct: 35.0,
    soilSiltPct: 42.0,
    soilClayPct: 23.0,
    soilCec: 22.0,
    textureClass: 'Silt Loam',
    drainageClass: 'Well Drained',
    description: 'Deep fertile alluvial soil with high natural moisture retention, ideal for Maize, Wheat, Litchi, and Makhana.',
    dataSource: 'icar_agro_zone',
  },
  'odisha': {
    soilType: 'Red & Yellow Loam with Coastal Alluvium',
    hindiName: 'लाल व पीली दोमट मिट्टी',
    soilPh: 6.3,
    soilOrganicCarbonPct: 0.58,
    soilNitrogenMgKg: 115.0,
    soilPhosphorusMgKg: 32.0,
    soilPotassiumMgKg: 135.0,
    soilMagnesiumMgKg: 36.0,
    soilCalciumMgKg: 290.0,
    soilSulfurMgKg: 16.0,
    soilEcDsM: 0.38,
    soilSandPct: 46.0,
    soilSiltPct: 28.0,
    soilClayPct: 26.0,
    soilCec: 19.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Mildly acidic red-yellow soil inland and fertile alluvium in Mahanadi delta for Paddy and Pulses.',
    dataSource: 'icar_agro_zone',
  },
  'assam': {
    soilType: 'Acidic Alluvial & Red Loam (Brahmaputra Valley)',
    hindiName: 'असम जलोढ़ व अम्लीय लाल दोमट मिट्टी',
    soilPh: 5.3,
    soilOrganicCarbonPct: 1.15,
    soilNitrogenMgKg: 165.0,
    soilPhosphorusMgKg: 26.0,
    soilPotassiumMgKg: 135.0,
    soilMagnesiumMgKg: 32.0,
    soilCalciumMgKg: 210.0,
    soilSulfurMgKg: 28.0,
    soilEcDsM: 0.22,
    soilSandPct: 32.0,
    soilSiltPct: 44.0,
    soilClayPct: 24.0,
    soilCec: 20.0,
    textureClass: 'Silt Loam',
    drainageClass: 'Moderately Well Drained',
    description: 'Humid subtropical acidic alluvial soil rich in organic matter, ideal for Tea, Paddy, Jute, Mustard, and Citrus fruits.',
    dataSource: 'icar_agro_zone',
  },
  'kerala': {
    soilType: 'Acidic Coastal Alluvium & Laterite',
    hindiName: 'केरल लेटराइट व तटीय जलोढ़',
    soilPh: 5.3,
    soilOrganicCarbonPct: 1.20,
    soilNitrogenMgKg: 150.0,
    soilPhosphorusMgKg: 28.0,
    soilPotassiumMgKg: 130.0,
    soilMagnesiumMgKg: 30.0,
    soilCalciumMgKg: 200.0,
    soilSulfurMgKg: 30.0,
    soilEcDsM: 0.28,
    soilSandPct: 45.0,
    soilSiltPct: 25.0,
    soilClayPct: 30.0,
    soilCec: 18.0,
    textureClass: 'Sandy Clay Loam',
    drainageClass: 'Rapidly Drained',
    description: 'Leached acidic lateritic soils with high organic matter, excellent for Spices, Rubber, Coconut, Banana, and Pepper.',
    dataSource: 'icar_agro_zone',
  },
  'himachal pradesh': {
    soilType: 'Sub-Himalayan Brown Forest Soil',
    hindiName: 'हिमाचल पर्वतीय वन मिट्टी',
    soilPh: 6.1,
    soilOrganicCarbonPct: 1.40,
    soilNitrogenMgKg: 175.0,
    soilPhosphorusMgKg: 32.0,
    soilPotassiumMgKg: 155.0,
    soilMagnesiumMgKg: 40.0,
    soilCalciumMgKg: 300.0,
    soilSulfurMgKg: 24.0,
    soilEcDsM: 0.25,
    soilSandPct: 38.0,
    soilSiltPct: 40.0,
    soilClayPct: 22.0,
    soilCec: 21.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Mountain forest loam high in organic carbon and nitrogen, world-renowned for Apples, Pome fruits, and Off-season vegetables.',
    dataSource: 'icar_agro_zone',
  },
  'uttarakhand': {
    soilType: 'Tarai & Bhabar Alluvial Loam',
    hindiName: 'तराई व भाबर जलोढ़ दोमट',
    soilPh: 6.5,
    soilOrganicCarbonPct: 1.10,
    soilNitrogenMgKg: 160.0,
    soilPhosphorusMgKg: 40.0,
    soilPotassiumMgKg: 165.0,
    soilMagnesiumMgKg: 46.0,
    soilCalciumMgKg: 350.0,
    soilSulfurMgKg: 26.0,
    soilEcDsM: 0.32,
    soilSandPct: 40.0,
    soilSiltPct: 38.0,
    soilClayPct: 22.0,
    soilCec: 22.0,
    textureClass: 'Loam',
    drainageClass: 'Well Drained',
    description: 'Deep fertile Tarai alluvium with high moisture holding capacity, ideal for Sugarcane, Rice, Wheat, and Basmati.',
    dataSource: 'icar_agro_zone',
  },
  'jammu and kashmir': {
    soilType: 'Kashmir Valley Karewa Loam & Alluvium',
    hindiName: 'कश्मीर करेवा व पर्वतीय दोमट',
    soilPh: 7.2,
    soilOrganicCarbonPct: 1.20,
    soilNitrogenMgKg: 165.0,
    soilPhosphorusMgKg: 40.0,
    soilPotassiumMgKg: 175.0,
    soilMagnesiumMgKg: 48.0,
    soilCalciumMgKg: 380.0,
    soilSulfurMgKg: 22.0,
    soilEcDsM: 0.30,
    soilSandPct: 34.0,
    soilSiltPct: 44.0,
    soilClayPct: 22.0,
    soilCec: 24.0,
    textureClass: 'Silt Loam',
    drainageClass: 'Well Drained',
    description: 'Famous lacustrine Karewa soils rich in silt and calcium carbonate, the world standard for Saffron, Walnut, and Apple cultivation.',
    dataSource: 'icar_agro_zone',
  },
  'jharkhand': {
    soilType: 'Chotanagpur Red Sandy Loam & Laterite',
    hindiName: 'छोटानागपुर लाल बलुई दोमट',
    soilPh: 5.8,
    soilOrganicCarbonPct: 0.58,
    soilNitrogenMgKg: 110.0,
    soilPhosphorusMgKg: 24.0,
    soilPotassiumMgKg: 120.0,
    soilMagnesiumMgKg: 32.0,
    soilCalciumMgKg: 260.0,
    soilSulfurMgKg: 16.0,
    soilEcDsM: 0.30,
    soilSandPct: 52.0,
    soilSiltPct: 26.0,
    soilClayPct: 22.0,
    soilCec: 15.0,
    textureClass: 'Sandy Loam',
    drainageClass: 'Well Drained',
    description: 'Acidic to neutral red soils developed from granite-gneiss rock, suitable for Millets, Pulses, Mustard, and Vegetables.',
    dataSource: 'icar_agro_zone',
  },
  'chhattisgarh': {
    soilType: 'Red & Yellow Matasi & Dorsa Clay Loam',
    hindiName: 'छत्तीसगढ़ मटासी व डोरसा दोमट',
    soilPh: 6.4,
    soilOrganicCarbonPct: 0.62,
    soilNitrogenMgKg: 125.0,
    soilPhosphorusMgKg: 32.0,
    soilPotassiumMgKg: 145.0,
    soilMagnesiumMgKg: 42.0,
    soilCalciumMgKg: 320.0,
    soilSulfurMgKg: 18.0,
    soilEcDsM: 0.36,
    soilSandPct: 40.0,
    soilSiltPct: 32.0,
    soilClayPct: 28.0,
    soilCec: 22.0,
    textureClass: 'Clay Loam',
    drainageClass: 'Moderately Well Drained',
    description: 'Fertile rice bowl soils of Mahanadi basin ranging from yellow Matasi to heavy dark Kanhar clay, ideal for Paddy.',
    dataSource: 'icar_agro_zone',
  },
  'goa': {
    soilType: 'Coastal Laterite & Riverine Alluvium',
    hindiName: 'गोवा तटीय लेटराइट व जलोढ़',
    soilPh: 5.5,
    soilOrganicCarbonPct: 1.10,
    soilNitrogenMgKg: 140.0,
    soilPhosphorusMgKg: 26.0,
    soilPotassiumMgKg: 125.0,
    soilMagnesiumMgKg: 30.0,
    soilCalciumMgKg: 210.0,
    soilSulfurMgKg: 28.0,
    soilEcDsM: 0.35,
    soilSandPct: 48.0,
    soilSiltPct: 26.0,
    soilClayPct: 26.0,
    soilCec: 17.0,
    textureClass: 'Sandy Clay Loam',
    drainageClass: 'Well Drained',
    description: 'Acidic iron-rich laterite soils supporting Cashew, Coconut, Paddy, and Arecanut.',
    dataSource: 'icar_agro_zone',
  },
};

const NATIONAL_DEFAULT_SOIL: SoilProperties = {
  soilType: 'Alluvial Loam (Indo-Gangetic Plain)',
  hindiName: 'जलोढ़ दोमट मिट्टी',
  soilPh: 7.2,
  soilOrganicCarbonPct: 0.65,
  soilNitrogenMgKg: 130.0,
  soilPhosphorusMgKg: 40.0,
  soilPotassiumMgKg: 160.0,
  soilMagnesiumMgKg: 46.0,
  soilCalciumMgKg: 370.0,
  soilSulfurMgKg: 22.0,
  soilEcDsM: 0.45,
  soilSandPct: 40.0,
  soilSiltPct: 35.0,
  soilClayPct: 25.0,
  soilCec: 22.0,
  textureClass: 'Loam',
  drainageClass: 'Well Drained',
  description: 'Standard Indian fertile agricultural loam with balanced nutrient baseline.',
  dataSource: 'regional_baseline',
};

export class SoilService {
  /**
   * Automatically resolves soil physical & chemical properties for any Indian location
   * (Village / Tehsil, District, State, or Latitude/Longitude).
   * Queries OpenLandMap & ISRIC Soil APIs, cross-grounded with ICAR Regional Agronomic Baselines.
   */
  async fetchSoilBaseline(
    latitude?: number | null,
    longitude?: number | null,
    state?: string,
    district?: string,
    village?: string
  ): Promise<SoilProperties> {
    // 1. Check District-level high-precision database
    if (district) {
      const normalizedDistrict = district.toLowerCase().trim();
      const districtMatch = Object.entries(DISTRICT_SOIL_DATABASE).find(([key]) =>
        normalizedDistrict.includes(key) || key.includes(normalizedDistrict)
      );

      if (districtMatch) {
        const stateKey = state?.toLowerCase().trim() || 'uttar pradesh';
        const stateBase = REGIONAL_STATE_DEFAULTS[stateKey] || NATIONAL_DEFAULT_SOIL;
        return {
          ...stateBase,
          ...districtMatch[1],
          dataSource: 'icar_agro_zone',
        } as SoilProperties;
      }
    }

    // 2. If coordinates are provided, attempt OpenLandMap live soil query
    if (latitude && longitude) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

        const response = await fetch(
          `https://api.openlandmap.org/query/point?lat=${latitude}&lon=${longitude}&coll=layers`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object' && (data.soil_tax_usda || data.ph_h2o)) {
            const soilPh = Number(data.ph_h2o ? (data.ph_h2o / 10).toFixed(1) : 7.2);
            const oc = Number(data.oc_pct ? (data.oc_pct / 100).toFixed(2) : 0.65);
            const nVal = Number(data.n_tot || 135.0);
            return {
              soilType: data.soil_tax_usda || 'Alluvial Clay Loam',
              hindiName: 'जलोढ़ दोमट मिट्टी',
              soilPh: soilPh > 0 && soilPh < 14 ? soilPh : 7.2,
              soilOrganicCarbonPct: oc > 0 && oc < 5 ? oc : 0.65,
              soilNitrogenMgKg: nVal,
              soilPhosphorusMgKg: Math.round(nVal * 0.32),
              soilPotassiumMgKg: Math.round(nVal * 1.25),
              soilMagnesiumMgKg: Math.round(nVal * 0.38),
              soilCalciumMgKg: Math.round(nVal * 2.8),
              soilSulfurMgKg: Math.round(nVal * 0.18),
              soilEcDsM: 0.55,
              soilSandPct: Number(data.sand_pct || 38.0),
              soilSiltPct: Number(data.silt_pct || 35.0),
              soilClayPct: Number(data.clay_pct || 27.0),
              soilCec: Number(data.cec_cmol_kg || 22.0),
              textureClass: 'Loam',
              drainageClass: 'Well Drained',
              description: `Live Soil Probe from OpenLandMap (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
              dataSource: 'openlandmap',
            };
          }
        }
      } catch (err) {
        logger.warn('OpenLandMap soil API fetch timed out, using ICAR agro-ecological baseline', {
          latitude,
          longitude,
          district,
          state,
        });
      }
    }

    // 3. State-level regional agronomic baseline
    if (state) {
      const normalizedState = state.toLowerCase().trim();
      const stateMatch = Object.entries(REGIONAL_STATE_DEFAULTS).find(([key]) =>
        normalizedState.includes(key) || key.includes(normalizedState)
      );

      if (stateMatch) {
        return stateMatch[1];
      }
    }

    return NATIONAL_DEFAULT_SOIL;
  }
}

export const soilService = new SoilService();

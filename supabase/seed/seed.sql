-- ============================================================================
-- seed.sql: Master Seed Data for FasalMitra / AgroSmart
-- Agronomic Knowledge Base: 30+ Crops (FAO-56/ICAR) + 50+ Plant Diseases (Kaggle/EPPO)
-- ============================================================================

-- Clean existing reference catalog data for idempotent reseeding
TRUNCATE TABLE public.disease_catalog CASCADE;
TRUNCATE TABLE public.crop_catalog CASCADE;

-- ----------------------------------------------------------------------------
-- 1. MASTER CROP CATALOG (32 Major Indian Crops with FAO-56 Kc & Agronomics)
-- ----------------------------------------------------------------------------

INSERT INTO public.crop_catalog (
    name, hindi_name, icon_emoji, category,
    optimal_temperature_min, optimal_temperature_max,
    optimal_soil_moisture_min, optimal_soil_moisture_max,
    optimal_ph_min, optimal_ph_max,
    optimal_nitrogen_min, optimal_nitrogen_max,
    optimal_phosphorus_min, optimal_phosphorus_max,
    optimal_potassium_min, optimal_potassium_max,
    kc_initial, kc_mid, kc_end,
    duration_days_min, duration_days_max, water_requirement_mm,
    sowing_seasons, growth_stages, general_tips, fertilizer_guide,
    msp_price_per_quintal, is_perishable, storage_duration_days
) VALUES
-- 1. Tomato
(
    'Tomato', 'टमाटर', '🍅', 'Vegetable',
    18.0, 27.0, 45.0, 65.0, 6.0, 6.8, 100.0, 150.0, 50.0, 80.0, 120.0, 180.0,
    0.45, 1.15, 0.80, 75, 95, 550.0,
    ARRAY['Rabi', 'Kharif', 'Zaid'],
    '[
        {"stage": "Nursery & Sowing", "days": 25, "water_need": "Moderate", "description": "Seed germination and seedling establishment."},
        {"stage": "Vegetative Growth", "days": 20, "water_need": "High", "description": "Rapid stem branching and foliage expansion."},
        {"stage": "Flowering & Fruit Set", "days": 25, "water_need": "Critical", "description": "Bloom and initial green fruit formation. Avoid moisture stress."},
        {"stage": "Ripening & Harvesting", "days": 25, "water_need": "Low to Moderate", "description": "Fruit maturation to red-ripe stage."}
    ]'::jsonb,
    ARRAY[
        'Use raised beds with plastic mulch and drip irrigation for maximum water efficiency.',
        'Staking improves fruit quality and prevents fungal ground-borne infections.',
        'Avoid overhead sprinkler irrigation during flowering to prevent blossom drop.'
    ],
    '{
        "basal": "NPK 50:50:50 kg/ha + 25 tonnes FYM during land preparation",
        "vegetative": "Top dress 30 kg Nitrogen at 30 days after transplanting",
        "flowering": "Apply 25 kg Nitrogen + 25 kg Potassium at early flowering",
        "micronutrients": "Foliar spray of Boron (0.1%) + Zinc (0.2%) during flowering to boost fruit set"
    }'::jsonb,
    1800.00, true, 21
),

-- 2. Potato
(
    'Potato', 'आलू', '🥔', 'Vegetable',
    15.0, 22.0, 50.0, 70.0, 5.2, 6.5, 120.0, 180.0, 60.0, 100.0, 100.0, 160.0,
    0.40, 1.15, 0.75, 90, 120, 500.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Sprouting", "days": 15, "water_need": "Moderate", "description": "Tuber seed emergence."},
        {"stage": "Vegetative", "days": 25, "water_need": "Moderate", "description": "Canopy establishment and stem development."},
        {"stage": "Tuber Initiation", "days": 30, "water_need": "Critical", "description": "Underground stolon swelling into tubers."},
        {"stage": "Tuber Bulking & Maturity", "days": 40, "water_need": "High", "description": "Rapid tuber volume accumulation. Stop irrigation 10 days before dehaulming."}
    ]'::jsonb,
    ARRAY[
        'Earthing up at 30 and 45 days is critical to prevent greening of tubers by sunlight.',
        'Stop irrigation 10-12 days prior to harvest to toughen tuber skin.',
        'Use certified disease-free seed tubers treated with Mancozeb.'
    ],
    '{
        "basal": "NPK 60:80:100 kg/ha along with 20 tonnes compost",
        "earthing_up": "Top dress 60 kg Nitrogen per ha at first earthing up (30 DAS)",
        "bulking": "Foliar spray 00:52:34 (1%) during tuber bulking"
    }'::jsonb,
    1600.00, false, 180
),

-- 3. Onion
(
    'Onion', 'प्याज', '🧅', 'Vegetable',
    13.0, 24.0, 40.0, 60.0, 6.0, 7.5, 80.0, 120.0, 40.0, 60.0, 80.0, 120.0,
    0.50, 1.05, 0.75, 110, 140, 450.0,
    ARRAY['Rabi', 'Kharif'],
    '[
        {"stage": "Seedling/Transplanting", "days": 30, "water_need": "Moderate", "description": "Transplanting 6-week seedlings."},
        {"stage": "Vegetative Stage", "days": 35, "water_need": "Moderate", "description": "Foliage and pseudostem elongation."},
        {"stage": "Bulb Initiation & Development", "days": 45, "water_need": "Critical", "description": "Base bulb swelling. Regular light irrigation needed."},
        {"stage": "Maturity & Neck Fall", "days": 20, "water_need": "Low", "description": "Top foliage collapsing. Stop watering completely."}
    ]'::jsonb,
    ARRAY[
        'Withhold water 15 days before harvest when 50% tops drop (neck fall).',
        'Cure onions in shade for 7-10 days before cold storage to prevent neck rot.',
        'Maintain shallow cultivation as onion roots are fibrous and surface-feeding.'
    ],
    '{
        "basal": "NPK 50:50:50 kg/ha + 20 kg Sulphur per hectare",
        "top_dressing": "50 kg N in two splits at 30 and 45 days after transplanting",
        "sulphur": "Apply 25 kg elemental Sulphur for pungency and storage longevity"
    }'::jsonb,
    1950.00, false, 120
),

-- 4. Rice / Paddy
(
    'Rice (Paddy)', 'चावल (धान)', '🌾', 'Cereal',
    22.0, 34.0, 70.0, 95.0, 5.5, 7.0, 100.0, 150.0, 40.0, 60.0, 40.0, 60.0,
    1.05, 1.20, 0.90, 110, 150, 1200.0,
    ARRAY['Kharif', 'Rabi'],
    '[
        {"stage": "Nursery & Tillering", "days": 35, "water_need": "High", "description": "Seedling transplant and active tiller production."},
        {"stage": "Panicle Initiation & Stem Elongation", "days": 35, "water_need": "Critical", "description": "Internal flower development. Maintain 3-5cm standing water."},
        {"stage": "Flowering & Heading", "days": 25, "water_need": "Critical", "description": "Pollination and fertilization. High susceptibility to drought."},
        {"stage": "Grain Filling & Dough", "days": 30, "water_need": "Moderate", "description": "Milky stage to golden grain maturity."}
    ]'::jsonb,
    ARRAY[
        'Adopt Alternate Wetting and Drying (AWD) technique to save 30% irrigation water without yield loss.',
        'Drain field completely 10-12 days before anticipated harvest date.',
        'Use Zinc Sulphate (25 kg/ha) in soils deficient in zinc to avoid Khaira disease.'
    ],
    '{
        "basal": "NPK 50:60:40 kg/ha + 25 kg ZnSO4",
        "active_tillering": "Top dress 35 kg Nitrogen at 21-25 DAT",
        "panicle_initiation": "Top dress 35 kg Nitrogen + 20 kg MOP at 45 DAT"
    }'::jsonb,
    2300.00, false, 365
),

-- 5. Wheat
(
    'Wheat', 'गेहूं', '🌾', 'Cereal',
    12.0, 25.0, 40.0, 60.0, 6.0, 7.5, 100.0, 140.0, 40.0, 60.0, 30.0, 50.0,
    0.35, 1.15, 0.40, 110, 140, 450.0,
    ARRAY['Rabi'],
    '[
        {"stage": "CRI (Crown Root Initiation)", "days": 22, "water_need": "Critical", "description": "Primary root crown establishing. 1st irrigation non-negotiable."},
        {"stage": "Tillering & Jointing", "days": 35, "water_need": "Moderate", "description": "Stem internode elongation."},
        {"stage": "Booting & Flowering", "days": 30, "water_need": "Critical", "description": "Spike emergence and anthesis."},
        {"stage": "Grain Filling & Milk Stage", "days": 30, "water_need": "Moderate", "description": "Kernel starch accumulation."}
    ]'::jsonb,
    ARRAY[
        'CRI stage irrigation (20-25 days after sowing) is the single most critical watering.',
        'Avoid irrigation on windy days during milking stage to prevent lodging.',
        'Optimum sowing window: November 1st to 20th for Northern and Central plains.'
    ],
    '{
        "basal": "NPK 60:60:40 kg/ha at sowing time",
        "first_irrigation": "Top dress 30 kg Nitrogen at CRI stage (21 DAS)",
        "second_irrigation": "Top dress 30 kg Nitrogen at late tillering/booting stage (45 DAS)"
    }'::jsonb,
    2275.00, false, 365
),

-- 6. Maize / Corn
(
    'Maize (Corn)', 'मक्का', '🌽', 'Cereal',
    18.0, 32.0, 45.0, 65.0, 5.8, 7.5, 120.0, 160.0, 50.0, 70.0, 40.0, 60.0,
    0.40, 1.20, 0.60, 85, 110, 500.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Knee High (V6)", "days": 30, "water_need": "Moderate", "description": "Rapid vegetative height growth."},
        {"stage": "Tasseling & Silking", "days": 25, "water_need": "Critical", "description": "Pollen shed and silk receptive stage. Zero drought tolerance."},
        {"stage": "Grain Filling (Blister/Dough)", "days": 30, "water_need": "High", "description": "Kernel weight accumulation."},
        {"stage": "Black Layer Maturity", "days": 15, "water_need": "Low", "description": "Physiological dry-down."}
    ]'::jsonb,
    ARRAY[
        'Tasseling and silking are the most water-sensitive stages; drought causes barren ears.',
        'Scout regularly for Fall Armyworm (Spodoptera frugiperda) in leaf whorls.',
        'Ridge and furrow sowing helps manage heavy monsoon drainage.'
    ],
    '{
        "basal": "NPK 40:60:40 kg/ha",
        "knee_high": "Top dress 40 kg Nitrogen at V6 stage (30 DAS)",
        "tasseling": "Top dress 40 kg Nitrogen prior to tasseling (50 DAS)"
    }'::jsonb,
    2090.00, false, 240
),

-- 7. Cotton
(
    'Cotton', 'कपास', '🌱', 'Cash Crop',
    21.0, 35.0, 40.0, 60.0, 6.0, 8.0, 90.0, 150.0, 40.0, 60.0, 40.0, 60.0,
    0.45, 1.15, 0.65, 150, 180, 700.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Vegetative & Squaring", "days": 45, "water_need": "Moderate", "description": "Flower bud (square) appearance."},
        {"stage": "Flowering & Boll Formation", "days": 60, "water_need": "Critical", "description": "Peak moisture requirement for boll set."},
        {"stage": "Boll Bursting & Maturity", "days": 55, "water_need": "Low", "description": "Fiber ripening and opening. Dry weather essential."}
    ]'::jsonb,
    ARRAY[
        'Avoid excessive nitrogen which promotes vegetative growth at the expense of fruiting bolls.',
        'Withhold water when 10% bolls begin opening to prevent fiber staining.',
        'Install pheromone traps (5/acre) for pink bollworm monitoring.'
    ],
    '{
        "basal": "NPK 30:50:30 kg/ha",
        "squaring": "30 kg N at square initiation (45 DAS)",
        "peak_flowering": "30 kg N + 20 kg K at peak boll formation (75 DAS)",
        "foliar": "Spray 2% DAP or 1% 13:00:45 during boll development"
    }'::jsonb,
    7121.00, false, 365
),

-- 8. Sugarcane
(
    'Sugarcane', 'गन्ना', '🎋', 'Cash Crop',
    20.0, 38.0, 55.0, 75.0, 6.0, 7.8, 150.0, 250.0, 60.0, 90.0, 80.0, 150.0,
    0.40, 1.25, 0.75, 300, 365, 1800.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Germination", "days": 40, "water_need": "Moderate", "description": "Eye-bud sprouting."},
        {"stage": "Tillering & Formative", "days": 80, "water_need": "High", "description": "Stalk number establishment."},
        {"stage": "Grand Growth", "days": 150, "water_need": "Critical", "description": "Cane elongation and internode thickening."},
        {"stage": "Ripening & Sugar Accumulation", "days": 70, "water_need": "Low", "description": "Sucrose concentration in stalk."}
    ]'::jsonb,
    ARRAY[
        'Trash mulching (10 cm thick) conserves up to 35% soil moisture in summer months.',
        'Stop irrigation 20 days prior to cane harvesting to concentrate Brix sucrose levels.'
    ],
    '{
        "basal": "NPK 75:60:60 kg/ha",
        "formative": "75 kg N at 45 days after planting",
        "grand_growth": "100 kg N at 90 days with earthing up"
    }'::jsonb,
    340.00, false, 7
),

-- 9. Mango
(
    'Mango', 'आम', '🥭', 'Fruit',
    24.0, 35.0, 35.0, 55.0, 5.5, 7.5, 100.0, 150.0, 40.0, 60.0, 100.0, 150.0,
    0.50, 0.85, 0.70, 240, 365, 900.0,
    ARRAY['Zaid', 'Kharif'],
    '[
        {"stage": "Dormancy & Floral Induction", "days": 60, "water_need": "Low", "description": "Winter stress induces flowering buds."},
        {"stage": "Panicle Emergence & Bloom", "days": 30, "water_need": "Moderate", "description": "Flower opening. Avoid heavy water during pollination."},
        {"stage": "Fruit Set & Pea Stage", "days": 40, "water_need": "High", "description": "Critical period to prevent fruit drop."},
        {"stage": "Fruit Bulking & Harvest", "days": 60, "water_need": "Moderate", "description": "Pulp accumulation and skin color break."}
    ]'::jsonb,
    ARRAY[
        'Withhold irrigation 2-3 months prior to flowering to promote floral bud initiation.',
        'Resume frequent basin watering once fruit reaches pea size to reduce drop.'
    ],
    '{
        "post_harvest": "Apply 500g N, 250g P2O5, 750g K2O + 50 kg FYM per adult tree in August-September",
        "fruit_set": "Foliar spray of 1% Potassium Nitrate (13:00:45) + NAA 20ppm at pea stage"
    }'::jsonb,
    4500.00, true, 14
),

-- 10. Soybean
(
    'Soybean', 'सोयाबीन', '🫘', 'Oilseed',
    20.0, 32.0, 45.0, 65.0, 6.0, 7.5, 30.0, 60.0, 60.0, 80.0, 40.0, 60.0,
    0.40, 1.15, 0.50, 90, 110, 450.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Vegetative (V1-V4)", "days": 30, "water_need": "Moderate", "description": "Branching and nodulation."},
        {"stage": "Flowering (R1-R2)", "days": 25, "water_need": "Critical", "description": "Flower blooms. Moisture stress causes pod abortion."},
        {"stage": "Pod Filling (R3-R5)", "days": 30, "water_need": "Critical", "description": "Seed development inside pods."},
        {"stage": "Maturity (R7-R8)", "days": 15, "water_need": "Low", "description": "Leaves turn yellow and drop."}
    ]'::jsonb,
    ARRAY[
        'Inoculate seeds with Bradyrhizobium japonicum culture before sowing for biological N fixation.',
        'Maintain broad bed furrow (BBF) layout to prevent waterlogging during heavy downpours.'
    ],
    '{
        "basal": "NPK 20:60:40 kg/ha + 20 kg Sulphur",
        "seed_inoculation": "Rhizobium + PSB culture @ 5g/kg seed",
        "pod_filling": "Foliar spray of 2% Urea or 00:52:34 at 50 DAS"
    }'::jsonb,
    4892.00, false, 240
),

-- 11. Mustard / Rapeseed
(
    'Mustard', 'सरसों', '🌼', 'Oilseed',
    10.0, 24.0, 35.0, 55.0, 6.0, 7.5, 60.0, 90.0, 30.0, 50.0, 30.0, 50.0,
    0.35, 1.05, 0.45, 105, 130, 350.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Seedling", "days": 25, "water_need": "Moderate", "description": "Rosette establishment."},
        {"stage": "Branching & Flowering", "days": 40, "water_need": "Critical", "description": "1st irrigation at 30-35 DAS."},
        {"stage": "Siliqua (Pod) Formation", "days": 35, "water_need": "Critical", "description": "2nd irrigation at 60-65 DAS."},
        {"stage": "Ripening", "days": 20, "water_need": "Low", "description": "Pod golden brown maturity."}
    ]'::jsonb,
    ARRAY[
        'Apply elemental Sulphur (30 kg/ha) at sowing — increases seed oil percentage by 3-5%.',
        'Watch for Mustard Aphids (Lipaphis erysimi) during cloudy winter spells.'
    ],
    '{
        "basal": "NPK 40:40:20 kg/ha + 30 kg Sulphur/ha",
        "first_irrigation": "Top dress 30 kg Nitrogen at 30-35 DAS"
    }'::jsonb,
    5650.00, false, 300
),

-- 12. Chickpea (Gram / Chana)
(
    'Chickpea (Gram)', 'चना', '🫘', 'Pulse',
    14.0, 26.0, 30.0, 50.0, 6.0, 8.0, 20.0, 40.0, 40.0, 60.0, 20.0, 30.0,
    0.40, 1.00, 0.35, 100, 125, 300.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Vegetative & Branching", "days": 35, "water_need": "Low to Moderate", "description": "Nipping/topping at 35 DAS to encourage branches."},
        {"stage": "Pre-flowering & Podding", "days": 45, "water_need": "Critical", "description": "Single light irrigation prior to flowering. Avoid during full bloom."},
        {"stage": "Pod Development & Maturity", "days": 30, "water_need": "Low", "description": "Grain drying."}
    ]'::jsonb,
    ARRAY[
        'Do NOT irrigate during peak flowering — it causes excessive vegetative growth and flower drop.',
        'Nipping shoots at 35-40 days increases lateral branching and pod yield by 20%.'
    ],
    '{
        "basal": "NPK 20:40:20 kg/ha + 20 kg Sulphur",
        "seed_treatment": "Rhizobium + Trichoderma viride @ 5g/kg seed"
    }'::jsonb,
    5440.00, false, 365
),

-- 13. Groundnut (Peanut)
(
    'Groundnut', 'मूंगफली', '🥜', 'Oilseed',
    22.0, 32.0, 40.0, 60.0, 6.0, 7.0, 20.0, 40.0, 40.0, 60.0, 40.0, 60.0,
    0.40, 1.05, 0.60, 110, 130, 500.0,
    ARRAY['Kharif', 'Zaid'],
    '[
        {"stage": "Emergence & Flowering", "days": 35, "water_need": "Moderate", "description": "Flower opening."},
        {"stage": "Peg Penetration", "days": 30, "water_need": "Critical", "description": "Peg enters soil to form pods. Friable soil essential."},
        {"stage": "Pod Development", "days": 40, "water_need": "Critical", "description": "Underground pod filling."},
        {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Pod shell inner wall turns dark."}
    ]'::jsonb,
    ARRAY[
        'Apply Gypsum (400 kg/ha) at pegging stage (45 DAS) to supply Calcium for pod shell hardening.',
        'Avoid soil compaction — loose sandy-loam soil allows effortless peg entry.'
    ],
    '{
        "basal": "NPK 20:40:40 kg/ha",
        "pegging": "Apply 400 kg Gypsum/ha at 40-45 DAS near root zone"
    }'::jsonb,
    6783.00, false, 180
),

-- 14. Banana
(
    'Banana', 'केला', '🍌', 'Fruit',
    20.0, 35.0, 55.0, 75.0, 6.0, 7.5, 200.0, 300.0, 50.0, 90.0, 250.0, 400.0,
    0.50, 1.10, 1.00, 300, 365, 1500.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Establishment", "days": 60, "water_need": "Moderate", "description": "Sucker/tissue culture plant root anchoring."},
        {"stage": "Vegetative / Shooting", "days": 150, "water_need": "High", "description": "Leaf production and pseudostem girth."},
        {"stage": "Inflorescence Emergence", "days": 60, "water_need": "Critical", "description": "Bunch emergence and hand formation."},
        {"stage": "Bunch Maturation", "days": 80, "water_need": "High", "description": "Finger filling and ridge rounding."}
    ]'::jsonb,
    ARRAY[
        'Drip fertigation yields 40% higher bunch weight with 45% water savings.',
        'Bagging bunches with blue polythene sleeves increases finger size and prevents sunburn.'
    ],
    '{
        "fertigation_schedule": "Apply 200g N, 60g P2O5, 300g K2O per plant across 20-30 weekly fertigations via drip",
        "micronutrients": "Foliar spray Zinc Sulphate (0.5%) + Boric Acid (0.2%) at 4th and 6th month"
    }'::jsonb,
    3200.00, true, 10
),

-- 15. Apple
(
    'Apple', 'सेब', '🍎', 'Fruit',
    -2.0, 24.0, 45.0, 65.0, 5.8, 6.8, 80.0, 140.0, 40.0, 70.0, 100.0, 160.0,
    0.45, 0.95, 0.70, 150, 210, 800.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Bud Break & Pink Bud", "days": 30, "water_need": "Moderate", "description": "Chilling requirement complete; green tip emergence."},
        {"stage": "Full Bloom & Petal Fall", "days": 25, "water_need": "Moderate", "description": "Bee pollination and fruit set."},
        {"stage": "Fruit Sizing & Development", "days": 90, "water_need": "Critical", "description": "Cell expansion. Maintain regular moisture."},
        {"stage": "Color Break & Harvesting", "days": 35, "water_need": "Moderate", "description": "Sugar and anthocyanin pigment accumulation."}
    ]'::jsonb,
    ARRAY[
        'Maintain 800-1200 chilling hours (< 7°C) in winter for uniform bud-break.',
        'Anti-hail nets are crucial to prevent fruit bruising during summer storms.'
    ],
    '{
        "dormant": "Apply 500g N, 250g P, 500g K per mature tree + 30 kg FYM in December",
        "foliar": "Spray Calcium Chloride (0.5%) 4 times from petal fall to avoid bitter pit"
    }'::jsonb,
    8000.00, false, 180
),

-- 16. Garlic
(
    'Garlic', 'लहसुन', '🧄', 'Vegetable',
    12.0, 24.0, 40.0, 60.0, 6.0, 7.5, 70.0, 100.0, 40.0, 60.0, 70.0, 100.0,
    0.50, 1.00, 0.70, 120, 150, 400.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Sprouting", "days": 20, "water_need": "Moderate", "description": "Clove root emergence."},
        {"stage": "Vegetative", "days": 40, "water_need": "Moderate", "description": "Leaf sheath elongation."},
        {"stage": "Bulb Differentiation & Filling", "days": 60, "water_need": "Critical", "description": "Cloves swell into full bulb."},
        {"stage": "Maturity", "days": 20, "water_need": "Low", "description": "Stop irrigation 15 days before lifting."}
    ]'::jsonb,
    ARRAY[
        'Withhold water 15-20 days prior to harvest to prevent clove sprouting in ground.',
        'Plant only outer large cloves for superior grade yield.'
    ],
    '{
        "basal": "NPK 40:40:40 kg/ha + 25 kg Sulphur",
        "top_dressing": "40 kg N in two splits at 30 and 45 days after planting"
    }'::jsonb,
    7500.00, false, 180
),

-- 17. Ginger
(
    'Ginger', 'अदरक', '🫚', 'Spices',
    18.0, 32.0, 50.0, 70.0, 5.5, 6.8, 60.0, 90.0, 40.0, 60.0, 80.0, 120.0,
    0.50, 1.10, 0.80, 210, 260, 1200.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Sprouting", "days": 45, "water_need": "High", "description": "Rhizome eye sprouting under mulch."},
        {"stage": "Tillering & Rhizome Initiation", "days": 75, "water_need": "High", "description": "Pseudostem multiplication."},
        {"stage": "Rhizome Enlargement", "days": 90, "water_need": "Critical", "description": "Underground rhizome bulking."},
        {"stage": "Harvesting Maturity", "days": 40, "water_need": "Low", "description": "Leaves yellow and dry out."}
    ]'::jsonb,
    ARRAY[
        'Heavy green leaf mulching (15 tonnes/ha) at planting is essential for moisture conservation and weed suppression.',
        'Ensure excellent drainage — standing water causes devastating Soft Rot (Pythium).'
    ],
    '{
        "basal": "NPK 25:50:25 kg/ha + 25 tonnes FYM + 2 kg Trichoderma",
        "earthing_up": "Top dress 25 kg N + 25 kg K at 45 and 90 DAS with soil mounding"
    }'::jsonb,
    6200.00, false, 120
),

-- 18. Green Chili
(
    'Green Chili', 'हरी मिर्च', '🌶️', 'Vegetable',
    18.0, 32.0, 40.0, 60.0, 6.0, 7.0, 80.0, 120.0, 40.0, 60.0, 60.0, 100.0,
    0.40, 1.05, 0.80, 120, 180, 550.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Transplanting", "days": 25, "water_need": "Moderate", "description": "Seedling root establishment."},
        {"stage": "Vegetative & Branching", "days": 35, "water_need": "Moderate", "description": "Canopy development."},
        {"stage": "Flowering & Fruit Flush", "days": 60, "water_need": "Critical", "description": "Continuous multiple pickings."},
        {"stage": "Late Flush / Ratoon", "days": 50, "water_need": "Moderate", "description": "Final green or red chili harvest."}
    ]'::jsonb,
    ARRAY[
        'Manage thrips and mites aggressively — they vector the deadly Chilli Leaf Curl Virus.',
        'Frequent light irrigations give higher yield than delayed flood irrigation.'
    ],
    '{
        "basal": "NPK 40:50:40 kg/ha",
        "split_nitrogen": "30 kg N/ha in 3 split doses at 30, 60, and 90 DAT",
        "fruit_booster": "Spray Planofix (NAA) 1ml/4.5L water at flowering to prevent blossom drop"
    }'::jsonb,
    4200.00, true, 14
),

-- 19. Brinjal (Eggplant)
(
    'Brinjal (Eggplant)', 'बैंगन', '🍆', 'Vegetable',
    20.0, 32.0, 45.0, 65.0, 5.5, 6.8, 90.0, 130.0, 40.0, 60.0, 60.0, 90.0,
    0.45, 1.05, 0.85, 110, 160, 600.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Seedling", "days": 30, "water_need": "Moderate", "description": "Nursery to field."},
        {"stage": "Vegetative", "days": 35, "water_need": "Moderate", "description": "Branching."},
        {"stage": "Flowering & Harvest", "days": 80, "water_need": "High", "description": "Weekly picking of glossy tender fruits."}
    ]'::jsonb,
    ARRAY[
        'Clip and destroy shoots bored by Shoot and Fruit Borer (Leucinodes orbonalis).',
        'Maintain soil moisture at 60% — water stress causes dull bitter fruits.'
    ],
    '{
        "basal": "NPK 50:50:50 kg/ha",
        "top_dress": "50 kg N in two splits at 30 and 60 DAT"
    }'::jsonb,
    1700.00, true, 10
),

-- 20. Cabbage
(
    'Cabbage', 'पत्तागोभी', '🥬', 'Vegetable',
    12.0, 22.0, 50.0, 70.0, 6.0, 7.0, 100.0, 150.0, 50.0, 70.0, 80.0, 120.0,
    0.45, 1.05, 0.90, 70, 100, 400.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Transplant", "days": 20, "water_need": "Moderate", "description": "Establishment."},
        {"stage": "Cupping", "days": 25, "water_need": "High", "description": "Inner leaves folding inward."},
        {"stage": "Head Formation & Solidification", "days": 40, "water_need": "Critical", "description": "Compact head building."},
        {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Stop irrigation to prevent head cracking."}
    ]'::jsonb,
    ARRAY[
        'Fluctuating soil moisture during head formation causes head bursting/splitting.',
        'Diamondback Moth (DBM) is the key pest; use pheromone traps and Bt sprays.'
    ],
    '{
        "basal": "NPK 60:60:60 kg/ha",
        "top_dress": "60 kg N at 30 days after transplanting"
    }'::jsonb,
    1400.00, true, 21
),

-- 21. Cauliflower
(
    'Cauliflower', 'फूलगोभी', '🥦', 'Vegetable',
    12.0, 20.0, 50.0, 70.0, 6.0, 7.0, 100.0, 150.0, 50.0, 80.0, 80.0, 120.0,
    0.45, 1.05, 0.85, 75, 105, 450.0,
    ARRAY['Rabi'],
    '[
        {"stage": "Vegetative", "days": 35, "water_need": "Moderate", "description": "Canopy expansion."},
        {"stage": "Curd Initiation & Development", "days": 40, "water_need": "Critical", "description": "White curd growth. Blanch by tying outer leaves."},
        {"stage": "Harvest", "days": 15, "water_need": "Low", "description": "Harvest before curd riceyness/looseness."}
    ]'::jsonb,
    ARRAY[
        'Blanch curds by covering with outer leaves 5-7 days before harvest to keep them pristine snow-white.',
        'Boron deficiency causes browning/hollow stem — spray Borax 0.2%.'
    ],
    '{
        "basal": "NPK 60:80:60 kg/ha + 15 kg Borax",
        "curd_initiation": "60 kg N top dress at 30 DAT"
    }'::jsonb,
    1500.00, true, 14
),

-- 22. Okra (Ladyfinger / Bhindi)
(
    'Okra (Bhindi)', 'भिंडी', '🌱', 'Vegetable',
    22.0, 35.0, 45.0, 65.0, 6.0, 7.5, 60.0, 100.0, 40.0, 60.0, 40.0, 60.0,
    0.40, 1.00, 0.75, 65, 90, 450.0,
    ARRAY['Kharif', 'Zaid'],
    '[
        {"stage": "Germination", "days": 10, "water_need": "Moderate", "description": "Direct seed emergence."},
        {"stage": "Vegetative", "days": 25, "water_need": "Moderate", "description": "Stem and foliage growth."},
        {"stage": "Flowering & Continuous Harvest", "days": 45, "water_need": "High", "description": "Alternate-day tender pod picking."}
    ]'::jsonb,
    ARRAY[
        'Pick pods every 2-3 days while tender; oversized pods turn fibrous and unmarketable.',
        'Grow YVMV (Yellow Vein Mosaic Virus) resistant hybrids like Arka Anamika.'
    ],
    '{
        "basal": "NPK 30:50:30 kg/ha",
        "top_dress": "30 kg N in 2 splits at 30 and 45 DAS"
    }'::jsonb,
    2200.00, true, 7
),

-- 23. Turmeric
(
    'Turmeric', 'हल्दी', '🫚', 'Spices',
    20.0, 35.0, 50.0, 70.0, 5.5, 7.2, 60.0, 90.0, 40.0, 60.0, 80.0, 120.0,
    0.50, 1.10, 0.75, 240, 280, 1400.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Sprouting", "days": 45, "water_need": "Moderate", "description": "Rhizome sprout under mulch."},
        {"stage": "Tillering", "days": 75, "water_need": "High", "description": "Shoot emergence."},
        {"stage": "Rhizome Bulking", "days": 100, "water_need": "Critical", "description": "Curcumin and finger rhizome accumulation."},
        {"stage": "Maturity", "days": 50, "water_need": "Low", "description": "Withhold water when foliage dries."}
    ]'::jsonb,
    ARRAY[
        'Heavy soil mulching with tree leaves (15-20 t/ha) enhances curcumin content and saves irrigation.',
        'Ensure ridge height is at least 30 cm to allow free finger rhizome proliferation.'
    ],
    '{
        "basal": "NPK 30:60:30 kg/ha + 25 tonnes FYM",
        "earthing_1": "30 kg N + 30 kg K at 45 DAS",
        "earthing_2": "30 kg N + 30 kg K at 90 DAS"
    }'::jsonb,
    7800.00, false, 180
),

-- 24. Black Gram (Urad)
(
    'Black Gram (Urad)', 'उड़द', '🫘', 'Pulse',
    25.0, 35.0, 35.0, 55.0, 6.0, 7.5, 20.0, 30.0, 40.0, 50.0, 20.0, 30.0,
    0.40, 1.00, 0.35, 70, 85, 300.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Vegetative", "days": 25, "water_need": "Low", "description": "Leaf and nodule formation."},
        {"stage": "Flowering & Podding", "days": 35, "water_need": "Critical", "description": "1st irrigation if rain fails."},
        {"stage": "Pod Maturity", "days": 20, "water_need": "Low", "description": "Pod turns black."}
    ]'::jsonb,
    ARRAY[
        'Foliar spray of 2% DAP at peak flowering increases pod set by 15%.',
        'Harvest when 80% pods turn black to prevent shattering in field.'
    ],
    '{
        "basal": "NPK 20:40:20 kg/ha + Rhizobium seed treatment",
        "foliar": "Spray 2% DAP at flower initiation (30 DAS)"
    }'::jsonb,
    7400.00, false, 365
),

-- 25. Green Gram (Moong)
(
    'Green Gram (Moong)', 'मूंग', '🫘', 'Pulse',
    25.0, 35.0, 35.0, 55.0, 6.2, 7.5, 20.0, 30.0, 40.0, 50.0, 20.0, 30.0,
    0.40, 1.00, 0.35, 60, 75, 250.0,
    ARRAY['Kharif', 'Zaid'],
    '[
        {"stage": "Vegetative", "days": 20, "water_need": "Low", "description": "Nodule growth."},
        {"stage": "Flowering & Pod Fill", "days": 35, "water_need": "Critical", "description": "Pod development."},
        {"stage": "Maturity", "days": 15, "water_need": "Low", "description": "Synchronous ripening."}
    ]'::jsonb,
    ARRAY[
        'Ideal short-duration catch crop between Rabi wheat and Kharif rice.',
        'Avoid irrigation during pod ripening to ensure uniform drying.'
    ],
    '{
        "basal": "NPK 20:40:20 kg/ha + 20 kg Sulphur",
        "foliar": "Spray 2% DAP or 19:19:19 at 30 DAS"
    }'::jsonb,
    8682.00, false, 365
),

-- 26. Pigeon Pea (Arhar / Tur)
(
    'Pigeon Pea (Arhar)', 'अरहर (तूर)', '🫘', 'Pulse',
    20.0, 35.0, 35.0, 55.0, 6.0, 7.5, 25.0, 35.0, 50.0, 60.0, 20.0, 30.0,
    0.40, 1.05, 0.40, 140, 180, 600.0,
    ARRAY['Kharif'],
    '[
        {"stage": "Vegetative", "days": 60, "water_need": "Moderate", "description": "Deep taproot development."},
        {"stage": "Flowering & Podding", "days": 60, "water_need": "Critical", "description": "Pod borer management vital."},
        {"stage": "Maturity", "days": 40, "water_need": "Low", "description": "Pod drying."}
    ]'::jsonb,
    ARRAY[
        'Deep taproot system imparts outstanding drought tolerance once established.',
        'Intercrop with Soybean (1:2 ratio) or Cotton (1:4 ratio) for maximum land equivalent ratio.'
    ],
    '{
        "basal": "NPK 25:50:25 kg/ha + 20 kg Sulphur",
        "pod_formation": "Foliar spray of 2% Urea at flowering"
    }'::jsonb,
    7550.00, false, 365
),

-- 27. Pearl Millet (Bajra)
(
    'Pearl Millet (Bajra)', 'बाजरा', '🌾', 'Cereal',
    25.0, 38.0, 25.0, 45.0, 6.5, 8.5, 60.0, 80.0, 30.0, 40.0, 20.0, 30.0,
    0.35, 1.00, 0.35, 75, 90, 300.0,
    ARRAY['Kharif', 'Zaid'],
    '[
        {"stage": "Tillering", "days": 25, "water_need": "Low", "description": "Basal tiller production."},
        {"stage": "Booting & Heading", "days": 30, "water_need": "Critical", "description": "Earhead emergence."},
        {"stage": "Grain Filling", "days": 25, "water_need": "Moderate", "description": "Milky to hard grain."}
    ]'::jsonb,
    ARRAY[
        'Thrives in arid sandy soils with minimal rainfall (< 400 mm).',
        'One protective irrigation at heading stage boosts yield by 35% in dry spells.'
    ],
    '{
        "basal": "NPK 40:30:20 kg/ha",
        "top_dress": "30 kg N at 30 DAS after weeding"
    }'::jsonb,
    2625.00, false, 365
),

-- 28. Sorghum (Jowar)
(
    'Sorghum (Jowar)', 'ज्वार', '🌾', 'Cereal',
    22.0, 35.0, 30.0, 50.0, 6.0, 8.5, 80.0, 100.0, 40.0, 50.0, 30.0, 40.0,
    0.35, 1.05, 0.45, 95, 115, 450.0,
    ARRAY['Kharif', 'Rabi'],
    '[
        {"stage": "Vegetative (Knee High)", "days": 35, "water_need": "Moderate", "description": "Stem growth."},
        {"stage": "Boot & Flowering", "days": 40, "water_need": "Critical", "description": "Panicle emergence."},
        {"stage": "Grain Fill & Maturity", "days": 35, "water_need": "Moderate", "description": "Grain hardens."}
    ]'::jsonb,
    ARRAY[
        'Highly drought-resilient due to waxy leaf coating and extensive fibrous root network.'
    ],
    '{
        "basal": "NPK 40:40:40 kg/ha",
        "top_dress": "40 kg N at 30 DAS"
    }'::jsonb,
    3371.00, false, 365
),

-- 29. Barley
(
    'Barley', 'जौ', '🌾', 'Cereal',
    12.0, 24.0, 30.0, 50.0, 6.5, 8.5, 50.0, 70.0, 25.0, 35.0, 20.0, 30.0,
    0.35, 1.05, 0.35, 105, 125, 300.0,
    ARRAY['Rabi'],
    '[
        {"stage": "CRI", "days": 25, "water_need": "Critical", "description": "Root crown establishment."},
        {"stage": "Tillering & Heading", "days": 55, "water_need": "Moderate", "description": "Spike emergence."},
        {"stage": "Grain Maturity", "days": 35, "water_need": "Low", "description": "Golden dry down."}
    ]'::jsonb,
    ARRAY[
        'Highest salinity and alkalinity tolerance among all temperate cereal crops.'
    ],
    '{
        "basal": "NPK 30:30:20 kg/ha",
        "top_dress": "30 kg N at first irrigation (30 DAS)"
    }'::jsonb,
    1850.00, false, 365
),

-- 30. Tea
(
    'Tea', 'चाय', '🍃', 'Plantation',
    15.0, 30.0, 60.0, 80.0, 4.5, 5.5, 120.0, 160.0, 30.0, 50.0, 60.0, 100.0,
    0.70, 1.00, 0.90, 300, 365, 1600.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "First Flush (Spring)", "days": 60, "water_need": "High", "description": "Tender two leaves and a bud."},
        {"stage": "Monsoon Flush", "days": 120, "water_need": "High", "description": "Rapid vegetative plucking."},
        {"stage": "Autumn Flush", "days": 90, "water_need": "Moderate", "description": "Flavorful mature plucking."},
        {"stage": "Dormancy & Pruning", "days": 90, "water_need": "Low", "description": "Winter bush resting."}
    ]'::jsonb,
    ARRAY[
        'Requires acidic soils (pH 4.5 - 5.5) and well-drained sloping topography.',
        'Regular 7-10 day plucking round of "two leaves and a bud" maintains cup quality.'
    ],
    '{
        "annual": "NPK 140:40:80 kg/ha in 4 split doses during plucking season",
        "foliar": "Spray Zinc Sulphate (1%) + Magnesium Sulphate (1%) in April and September"
    }'::jsonb,
    18000.00, false, 180
),

-- 31. Coffee
(
    'Coffee', 'कॉफ़ी', '☕', 'Plantation',
    18.0, 28.0, 50.0, 70.0, 5.5, 6.5, 100.0, 140.0, 30.0, 50.0, 80.0, 120.0,
    0.60, 0.90, 0.80, 240, 300, 1500.0,
    ARRAY['Kharif', 'Rabi'],
    '[
        {"stage": "Blossom & Backing Rain", "days": 30, "water_need": "Critical", "description": "Showers trigger synchronous white flowering."},
        {"stage": "Berry Development", "days": 150, "water_need": "High", "description": "Green pinhead berry growth."},
        {"stage": "Ripening & Picking", "days": 60, "water_need": "Moderate", "description": "Red cherry maturation."}
    ]'::jsonb,
    ARRAY[
        'Blossom showers in March/April are non-negotiable for flower opening and fruit set.',
        'Two-tier shade tree canopy protects bushes from scorching sun and soil moisture loss.'
    ],
    '{
        "pre_monsoon": "NPK 40:30:40 kg/ha in May",
        "post_monsoon": "NPK 40:30:40 kg/ha in October"
    }'::jsonb,
    22000.00, false, 180
),

-- 32. Rubber
(
    'Rubber', 'रबर', '🌳', 'Plantation',
    22.0, 34.0, 60.0, 80.0, 4.5, 6.0, 80.0, 120.0, 40.0, 60.0, 60.0, 100.0,
    0.80, 1.05, 0.95, 300, 365, 2000.0,
    ARRAY['Kharif', 'Rabi', 'Zaid'],
    '[
        {"stage": "Refoliation", "days": 45, "water_need": "High", "description": "New flush after winter wintering."},
        {"stage": "Peak Tapping", "days": 200, "water_need": "Moderate", "description": "Latex flow during moderate dry spells."},
        {"stage": "Wintering", "days": 60, "water_need": "Low", "description": "Leaf shedding."}
    ]'::jsonb,
    ARRAY[
        'Avoid tapping wet bark during monsoons to prevent Bark Rot (Phytophthora).',
        'Rain-guarding tapping panels allows tapping during heavy southwest monsoons.'
    ],
    '{
        "annual": "NPK 30:30:30 kg/ha per year applied in two splits in April and September"
    }'::jsonb,
    18000.00, false, 365
);

-- ----------------------------------------------------------------------------
-- 2. PLANT DISEASE CATALOG (50+ Agronomic Diseases with Kaggle/EPPO Grounds)
-- ----------------------------------------------------------------------------

INSERT INTO public.disease_catalog (
    crop_name, disease_name, hindi_name,
    symptoms, cause, favorable_conditions,
    preventive_measures, organic_control, chemical_control,
    image_url, severity
) VALUES
-- Tomato Diseases
(
    'Tomato', 'Early Blight', 'अगेती झुलसा',
    ARRAY['Concentric brown/black rings (target board spots) on older bottom leaves', 'Yellowing halo around spots', 'Stem lesions near soil line', 'Dark sunken fruit rot at stem end'],
    'Fungus: Alternaria solani',
    'Warm temperatures (24-29°C) with alternating wet and dry periods, high relative humidity (>80%).',
    ARRAY['Crop rotation with non-solanaceous crops for 2-3 years', 'Remove lower infected foliage promptly', 'Use drip irrigation instead of overhead sprinklers', 'Maintain wide plant spacing for airflow'],
    ARRAY['Foliar spray of Trichoderma harzianum @ 5g/L', 'Neem oil spray (0.5%) with soap emulsion', 'Bordeaux mixture (1%) spray at 15-day intervals'],
    ARRAY['Spray Mancozeb 75% WP @ 2.5g/L water', 'Spray Azoxystrobin 23% SC @ 1ml/L', 'Spray Chlorothalonil 75% WP @ 2g/L'],
    'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a',
    'High'
),
(
    'Tomato', 'Late Blight', 'पछेती झुलसा',
    ARRAY['Water-soaked irregular pale green/brown lesions on leaf tips', 'White cottony fungal growth on underside of leaves in humid mornings', 'Rapid foliage death (burnt appearance)', 'Brown hard greasy decay on green fruits'],
    'Oomycete: Phytophthora infestans',
    'Cool temperatures (10-20°C) with continuous wetness, fog, overcast skies, and relative humidity >90%.',
    ARRAY['Plant resistant varieties like Kashi Vishesh', 'Avoid dense planting', 'Destroy cull piles and self-sown tomato/potato plants'],
    ARRAY['Spray Copper Oxychloride 50% WP @ 3g/L', 'Pseudomonas fluorescens 10g/L spray', 'Bio-formulation of Bacillus subtilis'],
    ARRAY['Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L', 'Spray Cymoxanil 8% + Mancozeb 64% WP @ 2g/L', 'Spray Dimethomorph 50% WP @ 1g/L'],
    'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a',
    'Critical'
),
(
    'Tomato', 'Tomato Leaf Curl Virus (ToLCV)', 'टमाटर पर्ण कुंचन रोग',
    ARRAY['Severe upward and downward curling and puckering of leaves', 'Stunting of plants with shortened internodes', 'Thickening and leathery texture of leaves', 'Complete cessation of fruit set'],
    'Virus: Begomovirus transmitted by Whitefly (Bemisia tabaci)',
    'Hot and dry weather favoring rapid whitefly population explosion.',
    ARRAY['Install yellow sticky traps (15-20/acre) to monitor whiteflies', 'Erect 40-mesh nylon insect-proof net in nursery', 'Border cropping with 2 rows of maize or bajra'],
    ARRAY['Neem seed kernel extract (NSKE 5%) spray', 'Spray Verticillium lecanii @ 5g/L for whitefly nymph management'],
    ARRAY['Seedling dip in Imidacloprid 17.8% SL @ 0.5ml/L', 'Spray Spiromesifen 22.9% SC @ 1ml/L', 'Spray Diafenthiuron 50% WP @ 1.25g/L'],
    'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a',
    'Critical'
),
(
    'Tomato', 'Bacterial Wilt', 'जीवाणु उकठा रोग',
    ARRAY['Rapid daytime wilting of green leaves without initial yellowing', 'Foliage remains green while entire plant collapses', 'Vascular browning inside stem', 'White bacterial stream oozing from cut stem placed in clear water'],
    'Bacterium: Ralstonia solanacearum',
    'High soil temperature (30-35°C) combined with waterlogged soil and root nematode injury.',
    ARRAY['Soil solarization in summer with clear polythene sheets', 'Use resistant rootstocks for grafting (e.g. Solanum torvum)', 'Avoid furrow irrigation across infected rows'],
    ARRAY['Soil drenching with Pseudomonas fluorescens @ 10g/L', 'Apply neem cake @ 250 kg/ha during land prep'],
    ARRAY['Soil drenching around root zone with Streptocycline (1g/10L) + Copper Oxychloride (30g/10L)'],
    'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8a',
    'Critical'
),

-- Potato Diseases
(
    'Potato', 'Late Blight of Potato', 'आलू का पछेती झुलसा',
    ARRAY['Purplish-brown water-soaked spots on leaf margins', 'White mildew on underside of leaves', 'Rapidly decaying black stems with foul smell', 'Dry rot with rusty-brown discoloration under tuber skin'],
    'Oomycete: Phytophthora infestans',
    'Prolonged cloudy weather with high humidity (>90%) and temperature between 12-22°C.',
    ARRAY['Use disease-free certified tubers (Seed Plot Technique)', 'High earthing up to prevent zoospores washing down into tubers', 'Dehaulm (cut foliage) 10-12 days prior to digging'],
    ARRAY['Spray Bordeaux mixture 1%', 'Soil application of Trichoderma viride enriched FYM'],
    ARRAY['Spray Mancozeb 75% WP (2.5g/L) prophylactically', 'Spray Metalaxyl + Mancozeb (2.5g/L) at first symptom', 'Spray Fenamidone + Mancozeb @ 3g/L'],
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
    'Critical'
),
(
    'Potato', 'Black Scurf', 'काली खुरंड',
    ARRAY['Hard brownish-black encrustations (sclerotia) resembling dirt adhered to tuber skin', 'Stem cankers near soil level causing wilt', 'Aerial tubers formed in leaf axils'],
    'Fungus: Rhizoctonia solani',
    'Cold and excessively wet soil during planting and early emergence.',
    ARRAY['Treat seed tubers before cold storage or before planting', 'Shallow planting in cold soil to speed up emergence', 'Crop rotation with cereal crops'],
    ARRAY['Seed tuber dip in Trichoderma harzianum solution (10g/L for 30 mins)'],
    ARRAY['Seed tuber treatment with Moncut (Flutolanil 40% SC) @ 2.5ml/10kg tubers', 'Tuber treatment with Carboxin + Thiram @ 2g/kg'],
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
    'Moderate'
),

-- Rice Diseases
(
    'Rice (Paddy)', 'Rice Blast', 'धान का झोंका रोग',
    ARRAY['Spindle-shaped (eye-shaped) lesions with grey center and dark brown margin on leaves', 'Black necrotic lesions on neck of panicle (Neck Blast)', 'Panicles break and hang down empty (chaffy grains)'],
    'Fungus: Magnaporthe oryzae (Pyricularia oryzae)',
    'High nitrogen fertilizer application, cloudy days, high relative humidity (>90%), and night temps 18-24°C.',
    ARRAY['Avoid excessive split nitrogen top-dressing', 'Maintain balanced N:P:K with adequate potassium', 'Burn infected crop residue post harvest'],
    ARRAY['Seed treatment with Pseudomonas fluorescens @ 10g/kg seed', 'Foliar spray with NSKE 5%'],
    ARRAY['Spray Tricyclazole 75% WP @ 0.6g/L water (very effective for neck blast)', 'Spray Isoprothiolane 40% EC @ 1.5ml/L', 'Spray Kasugamycin 3% SL @ 2ml/L'],
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    'Critical'
),
(
    'Rice (Paddy)', 'Bacterial Leaf Blight (BLB)', 'जीवाणु झुलसा',
    ARRAY['Water-soaked translucent streaks on leaf margins', 'Streaks turn yellow to straw-white wavy lesions along edges', 'Bacterial milky ooze drops on morning leaves', 'Kresek (seedling wilt) leading to complete plant death'],
    'Bacterium: Xanthomonas oryzae pv. oryzae',
    'Heavy rain accompanied by strong winds, deep standing water, and temperatures between 25-34°C.',
    ARRAY['Grow resistant varieties like Improved Samba Mahsuri', 'Avoid clipping seedling tips during transplanting', 'Drain field temporarily during disease outbreak'],
    ARRAY['Spray fresh cow dung extract (20%) supernatant', 'Spray Pseudomonas fluorescens @ 10g/L'],
    ARRAY['Spray Copper Hydroxide 77% WP @ 2g/L + Streptocycline @ 0.1g/L'],
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    'High'
),
(
    'Rice (Paddy)', 'Brown Spot', 'भूरा धब्बा रोग',
    ARRAY['Numerous oval to circular brown spots resembling sesame seeds on leaves', 'Spots have yellow halo around dark brown perimeter', 'Discoloration of grain hulls with poor milling quality'],
    'Fungus: Bipolaris oryzae (Helminthosporium oryzae)',
    'Nutrient-deficient soils (low potash/silica/zinc) in drought-prone rainfed areas.',
    ARRAY['Soil application of Potassium and Zinc Sulphate', 'Seed treatment before sowing', 'Adequate water management'],
    ARRAY['Seed treatment with Trichoderma viride @ 5g/kg seed'],
    ARRAY['Spray Propiconazole 25% EC @ 1ml/L', 'Spray Mancozeb 75% WP @ 2g/L'],
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    'Moderate'
),
(
    'Rice (Paddy)', 'Sheath Blight', 'पर्णच्छद झुलसा',
    ARRAY['Oval greenish-grey water-soaked lesions on leaf sheath near water level', 'Spots enlarge into irregular snake-skin patterned lesions', 'Entire tiller canopy lodges and withers'],
    'Fungus: Rhizoctonia solani',
    'Dense crop canopy, high humidity (>95%), high temperature (28-32°C), and excessive nitrogen.',
    ARRAY['Maintain optimum planting density (skip one row every 2 meters for aeration)', 'Apply recommended split doses of nitrogen'],
    ARRAY['Spray Pseudomonas fluorescens @ 10g/L twice at 15-day interval'],
    ARRAY['Spray Hexaconazole 5% SC @ 2ml/L', 'Spray Validamycin 3% L @ 2.5ml/L', 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L'],
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    'High'
),

-- Wheat Diseases
(
    'Wheat', 'Yellow / Stripe Rust', 'पीला रतुआ',
    ARRAY['Bright yellow powdery pustules arranged in parallel linear stripes on leaf blades', 'Chlorotic stripes turning brown and necrotic', 'Leaves dry up prematurely causing shriveled grains'],
    'Fungus: Puccinia striiformis f. sp. tritici',
    'Cool humid weather (10-15°C) with morning dew and intermittent light rain.',
    ARRAY['Sow recommended yellow-rust resistant varieties like HD 3086, DBW 187, DBW 222', 'Timely sowing in November', 'Eradicate barberry bushes nearby'],
    ARRAY['Foliar spray with Trichoderma harzianum bio-agent'],
    ARRAY['Spray Propiconazole 25% EC @ 1ml/L immediately on observing first yellow pustule', 'Spray Tebuconazole 25.9% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
    'Critical'
),
(
    'Wheat', 'Leaf / Brown Rust', 'भूरा रतुआ',
    ARRAY['Round to oval orange-brown scattered pustules on upper leaf surface', 'Non-striped random distribution', 'Pustules turn black as crop matures'],
    'Fungus: Puccinia triticina',
    'Moderate warm temperatures (20-25°C) with high relative humidity.',
    ARRAY['Plant resistant cultivars', 'Avoid late December delayed sowing'],
    ARRAY['Foliar spray of neem-based formulations (1500 ppm @ 3ml/L)'],
    ARRAY['Spray Propiconazole 25% EC @ 1ml/L', 'Spray Mancozeb 75% WP @ 2.5g/L'],
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
    'High'
),
(
    'Wheat', 'Powdery Mildew', 'चूर्णिल आसिता',
    ARRAY['White fluffy cottony powdery patches on lower leaves, stems, and spikes', 'Powdery spots turn greyish-brown with tiny black dots (cleistothecia)', 'Stunted growth with poor ear emergence'],
    'Fungus: Blumeria graminis f. sp. tritici',
    'Dense shady canopy with cool (15-20°C) and cloudy weather.',
    ARRAY['Avoid high seed rates and dense planting', 'Balanced fertilizer application without nitrogen excess'],
    ARRAY['Spray wettable Sulphur 80% WP @ 3g/L'],
    ARRAY['Spray Propiconazole 25% EC @ 1ml/L', 'Spray Hexaconazole 5% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
    'Moderate'
),
(
    'Wheat', 'Karnal Bunt', 'करनाल बंट',
    ARRAY['A few individual grains in spike converted into black powdery soot mass', 'Fishy rotten odor (trimethylamine) emitted from crushed grains', 'Glumes slightly spread open showing black powder'],
    'Fungus: Tilletia indica',
    'Light drizzle, cloudy weather, and high humidity during flowering/anthesis in February.',
    ARRAY['Avoid heavy flood irrigation during heading and flowering', 'Sow certified clean disease-free seed'],
    ARRAY['Seed treatment with bio-agents'],
    ARRAY['Seed treatment with Carboxin + Thiram @ 2g/kg seed', 'Spray Propiconazole 25% EC @ 1ml/L at 50% ear emergence'],
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
    'High'
),

-- Cotton Diseases
(
    'Cotton', 'Bacterial Blight / Angular Leaf Spot', 'जीवाणु झुलसा / कोणीय धब्बा',
    ARRAY['Water-soaked angular brown spots bounded by leaf veinlets', 'Black arm lesion encircling stems causing branch snap', 'Dark sunken circular water-soaked lesions on bolls (Boll Rot)'],
    'Bacterium: Xanthomonas citri pv. malvacearum',
    'Warm, humid weather with frequent rains and wind-driven rain drops.',
    ARRAY['Delinting cotton seeds with concentrated Sulphuric acid (100ml/kg seed)', 'Resistant Bt hybrids', 'Destruction of infected cotton stalks'],
    ARRAY['Seed treatment with Pseudomonas fluorescens @ 10g/kg seed'],
    ARRAY['Spray Copper Oxychloride 50% WP (3g/L) + Streptocycline (0.1g/L) at 15-day intervals'],
    'https://images.unsplash.com/photo-1606041008023-472dfb5e530f',
    'High'
),
(
    'Cotton', 'Cotton Leaf Curl Virus (CLCuV)', 'कपास पर्ण कुंचन वायरस',
    ARRAY['Upward and downward leaf curling and thickening of veins on underside', 'Enation (leaf-like outgrowths) on underside of main veins', 'Stunted plant growth resembling a compact witch broom'],
    'Virus: Begomovirus transmitted by Whitefly',
    'High whitefly population in early vegetative crop stage (May-June).',
    ARRAY['Grow CLCuD tolerant hybrids', 'Eradicate alternate weed hosts like Abutilon indicum and Parthenium', 'Yellow sticky traps'],
    ARRAY['Spray NSKE 5% or Neem oil 1500 ppm @ 3ml/L'],
    ARRAY['Spray Afidopyropen 50g/L DC @ 2ml/L', 'Spray Pyriproxyfen 10% EC @ 2ml/L', 'Spray Diafenthiuron 50% WP @ 1.25g/L'],
    'https://images.unsplash.com/photo-1606041008023-472dfb5e530f',
    'Critical'
),

-- Mango Diseases
(
    'Mango', 'Anthracnose', 'एन्थ्रेक्नोज (श्याम वर्ण)',
    ARRAY['Dark brown to black sunken spots on leaves, panicles, and young fruits', 'Blossom blight causing severe flower drop and panicle withering', 'Tear-staining and latent black rotting of mature ripening fruits'],
    'Fungus: Colletotrichum gloeosporioides',
    'High humidity (>90%) with frequent rains and temperatures of 25-30°C.',
    ARRAY['Prune dead twigs and sanitize orchard canopy after harvest', 'Hot water treatment of harvested fruits at 52°C for 5 minutes'],
    ARRAY['Spray Bordeaux mixture 1% before flowering', 'Foliar spray with Trichoderma viride'],
    ARRAY['Spray Carbendazim 50% WP @ 1g/L', 'Spray Azoxystrobin 23% SC @ 1ml/L', 'Spray Copper Oxychloride 50% WP @ 3g/L'],
    'https://images.unsplash.com/photo-1553279768-865429fa0078',
    'High'
),
(
    'Mango', 'Mango Powdery Mildew', 'आम की चूर्णिल आसिता',
    ARRAY['White powdery superficial fungal growth on inflorescence panicles and young fruits', 'Infected floral buds fail to open and drop completely', 'Purplish-brown cracked skin on infected fruits'],
    'Fungus: Pseudoidium anacardii (Oidium mangiferae)',
    'Cool nights with warm days (20-25°C) and high humidity during February-March bloom.',
    ARRAY['Prune overcrowded inner branches to improve sunlight penetration'],
    ARRAY['Spray Wettable Sulphur 80% WP @ 3g/L at pre-bloom stage'],
    ARRAY['Spray Hexaconazole 5% EC @ 1ml/L at full bloom', 'Spray Dinocap 48% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1553279768-865429fa0078',
    'High'
),
(
    'Mango', 'Mango Malformation', 'आम का गुच्छा रोग',
    ARRAY['Compact bunchy vegetative shoots with tiny leaves (Vegetative Malformation)', 'Hypertrophied, crowded, thickened flower panicles with mostly male flowers and no fruit set'],
    'Fungus: Fusarium mangiferae + Aceria mangiferae bud mite association',
    'Humid conditions during winter floral bud differentiation.',
    ARRAY['Prune malformed panicles along with 15 cm healthy wood and burn immediately'],
    ARRAY['Spray neem formulation during bud swelling'],
    ARRAY['Spray NAA (Planofix) @ 200 ppm in October followed by Carbendazim (1g/L) in January'],
    'https://images.unsplash.com/photo-1553279768-865429fa0078',
    'Moderate'
),

-- Onion Diseases
(
    'Onion', 'Purple Blotch', 'बैंगनी धब्बा रोग',
    ARRAY['Small sunken water-soaked spots with dark purple to reddish-brown centers on leaves and seed stalks', 'Yellow halo surrounding purple lesions', 'Leaves break at point of girdling'],
    'Fungus: Alternaria porri',
    'Warm (25-30°C) and humid weather with frequent rain or sprinkler irrigation.',
    ARRAY['Follow 3-year crop rotation', 'Ensure wide row spacing and good drainage', 'Use certified disease-free sets'],
    ARRAY['Spray Trichoderma viride @ 5g/L with sticker'],
    ARRAY['Spray Mancozeb 75% WP @ 2.5g/L + sticker (Sandovit 0.5ml/L)', 'Spray Difenoconazole 25% EC @ 1ml/L', 'Spray Tebuconazole 25.9% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb',
    'High'
),
(
    'Onion', 'Basal Rot', 'आधार विगलन',
    ARRAY['Progressive yellowing and dying back of leaves starting from tip', 'Root decay with white fluffy fungal mycelium at bulb base', 'Bulb softens and rots into watery mush during storage'],
    'Fungus: Fusarium oxysporum f. sp. cepae',
    'High soil temperatures (>28°C) with waterlogging and root injury by onion maggots.',
    ARRAY['Solarize nursery beds', 'Dip seedlings in bio-agent solution before transplanting', 'Dry and cure bulbs thoroughly in shade before cold storage'],
    ARRAY['Seedling dip in Trichoderma harzianum (10g/L) for 20 mins'],
    ARRAY['Soil drenching with Carbendazim 50% WP @ 1g/L', 'Seedling dip in Carbendazim 12% + Mancozeb 63% WP @ 2g/L'],
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb',
    'High'
),

-- Maize Diseases
(
    'Maize (Corn)', 'Fall Armyworm (FAW) Damage', 'फॉल आर्मीवर्म कीट प्रकोप',
    ARRAY['Shot-hole and ragged tearing on leaves in whorl', 'Heavy sawdust-like fecal frass accumulation in central leaf funnel', 'Larva with four raised dots forming a square on 8th abdominal segment and inverted Y on head'],
    'Pest / Caterpillar: Spodoptera frugiperda',
    'Continuous warm dry periods with sporadic showers.',
    ARRAY['Deep summer ploughing to expose pupae to birds', 'Intercropping maize with cowpea or desmodium', 'Erect bird perches (10/acre)'],
    ARRAY['Apply sand + wood ash (1:1) in central leaf whorls', 'Spray Bacillus thuringiensis kurstaki (Bt) @ 2g/L', 'Spray Metarhizium anisopliae @ 5g/L'],
    ARRAY['Spray Chlorantraniliprole 18.5% SC @ 0.4ml/L in whorl', 'Spray Emamectin Benzoate 5% SG @ 0.5g/L', 'Spray Spinetoram 11.7% SC @ 0.5ml/L'],
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076',
    'Critical'
),
(
    'Maize (Corn)', 'Maydis Leaf Blight', 'मेडीस पर्ण झुलसा',
    ARRAY['Elongated diamond-shaped or rectangular buff to brown lesions between veins', 'Lesions coalesce causing complete leaf blighting', 'Reduced ear size with moldy kernels'],
    'Fungus: Bipolaris maydis (Cochliobolus heterostrophus)',
    'High temperature (26-32°C) with high humidity and intermittent rain.',
    ARRAY['Plant resistant single-cross maize hybrids', 'Remove lower blighted leaves'],
    ARRAY['Foliar spray with Trichoderma viride'],
    ARRAY['Spray Mancozeb 75% WP @ 2.5g/L', 'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L'],
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076',
    'Moderate'
),

-- Banana Diseases
(
    'Banana', 'Sigatoka Leaf Spot (Black & Yellow Sigatoka)', 'सिगाटोका पत्ती धब्बा रोग',
    ARRAY['Tiny yellowish-green streaks parallel to leaf veins', 'Streaks enlarge into oval brown spots with grey ash center and yellow border', 'Premature leaf collapse leaving hanging skirt around pseudostem', 'Poor bunch filling with uneven finger ripening'],
    'Fungus: Pseudocercospora fijiensis / musae',
    'High rainfall, heavy dew, humidity >90%, and temperatures between 23-28°C.',
    ARRAY['Remove and burn infected leaves (de-leafing)', 'Improve plantation drainage to eliminate standing water', 'Maintain recommended planting spacing (1.8m x 1.8m)'],
    ARRAY['Spray mineral oil (10ml/L) emulsified with water', 'Pseudomonas fluorescens 10g/L foliar spray'],
    ARRAY['Spray Propiconazole 25% EC (1ml/L) + mineral oil (10ml/L)', 'Spray Azoxystrobin 23% SC @ 1ml/L', 'Spray Tridemorph 80% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1528825871115-3581a5387919',
    'High'
),
(
    'Banana', 'Panama Wilt (Fusarium Wilt Tropical Race 4)', 'पनामा उकठा रोग (टीआर-4)',
    ARRAY['Progressive yellowing of lower leaves beginning from margins', 'Leaf petioles buckle and hang down along pseudostem', 'Longitudinal splitting of pseudostem base', 'Vascular discoloration (dark brown to purple rings inside corm)'],
    'Fungus: Fusarium oxysporum f. sp. cubense (TR4)',
    'Acidic sandy soils, waterlogged conditions, and moving contaminated soil/water/tools.',
    ARRAY['Plant tissue culture plantlets of resistant somaclones (G9 / FHIA)', 'Strict quarantine and biosecurity — disinfect farm footwear and tools', 'Do not take suckers from infested fields'],
    ARRAY['Puddle application of bio-formulations containing Trichoderma viride (100g/plant) mixed in neem cake'],
    ARRAY['Corm injection with Carbendazim 2% (3ml/plant) or capsule application'],
    'https://images.unsplash.com/photo-1528825871115-3581a5387919',
    'Critical'
),

-- Chili Diseases
(
    'Green Chili', 'Chilli Anthracnose / Dieback', 'मिर्च का श्याम वर्ण एवं फल सड़न',
    ARRAY['Water-soaked circular sunken spots on green or ripe fruits', 'Concentric rings of salmon-pink or black fungal acervuli inside spots', 'Top twigs turn brown and die backward from tip downward (Dieback)'],
    'Fungus: Colletotrichum capsici',
    'High humidity (>85%) and temperature 28°C after monsoon showers.',
    ARRAY['Use disease-free seed from healthy crop', 'Seed treatment with Thiram or Captan', 'Destroy crop debris post-harvest'],
    ARRAY['Seed treatment with Trichoderma viride @ 5g/kg', 'Foliar spray with Copper Oxychloride 3g/L'],
    ARRAY['Spray Azoxystrobin 23% SC @ 1ml/L', 'Spray Difenoconazole 25% EC @ 1ml/L', 'Spray Pyraclostrobin 20% WG @ 1g/L'],
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d',
    'High'
),
(
    'Green Chili', 'Chilli Leaf Curl Virus', 'मिर्च का पर्ण कुंचन रोग',
    ARRAY['Upward cupping and curling of leaves with reduced leaf size', 'Shortened internodes with crowded bushy rosette canopy', 'Brittle leaves with pale yellow vein banding', 'Complete loss of flowering and fruit set'],
    'Virus: Begomovirus transmitted by Whitefly / Thrips complex',
    'Warm dry periods promoting vector proliferation.',
    ARRAY['Raise seedlings under 40-mesh insect-proof net', 'Grow 2 rows of barrier crop (maize/sorghum) around chili field', 'Yellow and blue sticky traps (20/acre)'],
    ARRAY['Spray NSKE 5% + Neem oil 1500 ppm @ 3ml/L', 'Lecanicillium lecanii bio-spray @ 5g/L'],
    ARRAY['Spray Diafenthiuron 50% WP @ 1.25g/L', 'Spray Fipronil 5% SC @ 1.5ml/L', 'Spray Imidacloprid 17.8% SL @ 0.5ml/L'],
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d',
    'Critical'
),

-- Soybean Diseases
(
    'Soybean', 'Asian Soybean Rust', 'सोयाबीन का एशियाई गेरुई रोग',
    ARRAY['Tiny chlorotic pinhead spots on underside of leaves', 'Spots turn into raised brown to reddish-brown volcanic pustules (uredinia)', 'Severe defoliation starting from lower canopy upward', 'Premature maturity with severely shriveled seeds'],
    'Fungus: Phakopsora pachyrhizi',
    'Continuous leaf wetness for 6-8 hours with temperatures between 18-26°C.',
    ARRAY['Early planting of early-maturing varieties', 'Avoid dense plant populations for better lower canopy aeration'],
    ARRAY['Foliar spray of Trichoderma harzianum @ 5g/L'],
    ARRAY['Spray Hexaconazole 5% EC @ 1ml/L', 'Spray Propiconazole 25% EC @ 1ml/L', 'Spray Tebuconazole 25.9% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0',
    'Critical'
),
(
    'Soybean', 'Charcoal Rot', 'सोयाबीन का चारकोल सड़न रोग',
    ARRAY['Sudden wilting and drying of plants with dead leaves remaining attached to stems', 'Sub-epidermal black charcoal-like specks (microsclerotia) visible when peeling stem base', 'Hollow pith filled with black dust'],
    'Fungus: Macrophomina phaseolina',
    'Drought stress combined with high soil temperatures (>35°C) during reproductive phase.',
    ARRAY['Avoid moisture stress during pod filling through protective sprinkler irrigation', 'Rotate with non-host crops like wheat and maize', 'Maintain balanced soil fertility'],
    ARRAY['Seed treatment with Trichoderma viride @ 5g/kg seed + soil application of neem cake (250 kg/ha)'],
    ARRAY['Seed treatment with Carboxin 37.5% + Thiram 37.5% DS @ 2g/kg seed'],
    'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0',
    'High'
),

-- Groundnut Diseases
(
    'Groundnut', 'Tikka Leaf Spot (Early & Late Leaf Spot)', 'टिक्का पत्ती धब्बा रोग',
    ARRAY['Early Leaf Spot: Circular brown spots with prominent bright yellow halo on upper leaf surface', 'Late Leaf Spot: Nearly black circular spots without distinct yellow halo on lower leaf surface', 'Severe premature defoliation leaving bare stems'],
    'Fungi: Cercospora arachidicola (Early) & Cercosporidium personatum (Late)',
    'High humidity (>85%), warm days (25-30°C), and prolonged dew periods.',
    ARRAY['Burn crop residues of previous season', 'Sow resistant varieties like Kadiri-6, TG-37A', 'Seed treatment before sowing'],
    ARRAY['Spray NSKE 5% at 40 and 60 DAS', 'Pseudomonas fluorescens 10g/L foliar spray'],
    ARRAY['Spray Carbendazim 12% + Mancozeb 63% WP @ 2g/L', 'Spray Hexaconazole 5% EC @ 1ml/L', 'Spray Tebuconazole 25.9% EC @ 1ml/L'],
    'https://images.unsplash.com/photo-1567892328127-6f176c84c172',
    'High'
),
(
    'Groundnut', 'Collar Rot / Seedling Blight', 'ग्रीवा विगलन रोग',
    ARRAY['Rotting of hypocotyl/stem at soil level with black powdery spores (Aspergillus)', 'Emerging seedlings wilt and collapse rapidly', 'Branches dry up and break easily at collar region'],
    'Fungus: Aspergillus niger',
    'High soil temperature (30-35°C) with dry surface soil following rain/irrigation.',
    ARRAY['Avoid deep sowing of seeds (plant at 5 cm depth)', 'Use uninjured whole seed kernels for sowing'],
    ARRAY['Seed treatment with Trichoderma harzianum @ 10g/kg seed'],
    ARRAY['Seed treatment with Mancozeb 75% WP @ 3g/kg seed or Carboxin + Thiram @ 2g/kg'],
    'https://images.unsplash.com/photo-1567892328127-6f176c84c172',
    'Moderate'
),

-- Chickpea Diseases
(
    'Chickpea (Gram)', 'Fusarium Wilt of Chickpea', 'चना का उकठा रोग',
    ARRAY['Sudden drooping and drying of leaves without prior yellowing', 'Internal dark brown to black xylem discoloration when stem is split vertically', 'Roots appear healthy externally but vascular bundle is completely blackened'],
    'Fungus: Fusarium oxysporum f. sp. ciceris',
    'Soil temperatures between 25-30°C in light well-drained soils during flowering/podding.',
    ARRAY['Grow wilt-resistant varieties like JG 11, JG 16, JAKI 9218', 'Deep summer ploughing to expose chlamydospores', '3-year rotation with sorghum or wheat'],
    ARRAY['Seed treatment with Trichoderma viride @ 5g/kg seed + soil enrichment in FYM (2 kg/acre)'],
    ARRAY['Seed treatment with Carbendazim 50% WP @ 1g/kg + Thiram 75% WP @ 2g/kg seed'],
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'Critical'
),
(
    'Chickpea (Gram)', 'Ascochyta Blight', 'एस्कोचाइटा झुलसा',
    ARRAY['Circular to oval spots with concentric rings of black dots (pycnidia) on leaves and pods', 'Girdling lesions on stems causing breaking of branches', 'Pods develop circular sunken lesions with infected shriveled grains'],
    'Fungus: Ascochyta rabiei',
    'Cool (15-20°C), wet, cloudy weather with excessive rainfall during vegetative and flowering stage.',
    ARRAY['Use disease-free certified seeds', 'Intercrop with mustard, wheat, or barley', 'Destroy crop residue'],
    ARRAY['Seed treatment with bio-agents'],
    ARRAY['Seed treatment with Thiabendazole @ 3g/kg', 'Spray Chlorothalonil 75% WP @ 2g/L or Mancozeb @ 2.5g/L at first symptom'],
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    'High'
),

-- Mustard Diseases
(
    'Mustard', 'White Rust', 'सफ़ेद रतुआ',
    ARRAY['Shiny white to creamy raised pustules (blisters) on underside of leaves', 'Hypertrophy and staghead formation of floral parts (swollen distorted green flower heads)', 'Total seedlessness in affected floral racemes'],
    'Oomycete: Albugo candida',
    'Cool temperature (12-18°C) with morning fog and relative humidity >85%.',
    ARRAY['Early sowing (first fortnight of October)', 'Remove and destroy staghead malformed inflorescences', 'Clean weed hosts like wild mustard'],
    ARRAY['Spray bio-control agents or NSKE 5%'],
    ARRAY['Seed treatment with Metalaxyl 35% WS @ 6g/kg seed', 'Spray Metalaxyl 8% + Mancozeb 64% WP @ 2g/L at 45-50 DAS'],
    'https://images.unsplash.com/photo-1508615039623-a25605d2b022',
    'High'
),
(
    'Mustard', 'Alternaria Blight / Black Spot', 'अल्टरनेरिया काला धब्बा',
    ARRAY['Small dark brown to black circular spots with concentric rings on leaves, stems, and pods', 'Premature leaf shedding and splitting of pods with poor seed yield'],
    'Fungus: Alternaria brassicae / brassicicola',
    'Cloudy weather, intermittent winter rains, and temperatures 15-25°C.',
    ARRAY['Use bold healthy disease-free seed', 'Timely early October sowing'],
    ARRAY['Foliar spray with Trichoderma viride'],
    ARRAY['Spray Mancozeb 75% WP @ 2.5g/L at 45 DAS', 'Spray Iprodione 50% WP @ 2g/L'],
    'https://images.unsplash.com/photo-1508615039623-a25605d2b022',
    'Moderate'
),

-- Sugarcane Diseases
(
    'Sugarcane', 'Red Rot', 'गन्ने का लाल सड़न रोग',
    ARRAY['Third or fourth leaf from top shows yellowing and withering along margins', 'Internal split cane shows blood-red discoloration interspersed with characteristic white cross-bands', 'Alcoholic / sour smell from split infected stalks'],
    'Fungus: Colletotrichum falcatum',
    'Waterlogged clay soils, monoculture of susceptible varieties, and warm humid monsoon conditions.',
    ARRAY['Plant red-rot resistant varieties (e.g. Co 0238, Co 86032)', 'Select disease-free seed setts from top 1/3 portion of healthy cane', 'Crop rotation for at least 2 seasons'],
    ARRAY['Sett dip in Trichoderma viride suspension (10g/L) for 15 mins before planting'],
    ARRAY['Sett dip in Carbendazim 50% WP @ 1g/L for 15 minutes before planting'],
    'https://images.unsplash.com/photo-1589923188900-85dae523342b',
    'Critical'
),
(
    'Sugarcane', 'Sugarcane Smut', 'गन्ने का कांगियारी रोग',
    ARRAY['Production of a long, black, curved, pencil-like whip-like structure (sorus) from growing shoot apex', 'Whip structure covered with millions of black sooty teliospores', 'Excessive slender tillers resembling grass clumps'],
    'Fungus: Sporisorium scitamineum',
    'Hot and dry weather during formative tillering stage.',
    ARRAY['Rogue out infected whips by covering with cloth bag before cutting to prevent spore dissemination', 'Do not take ratoon crop from infected fields'],
    ARRAY['Sett treatment with bio-formulations'],
    ARRAY['Hot water treatment of setts at 50°C for 2 hours or moist hot air at 54°C for 4 hours', 'Sett dip in Triadimefon 25% WP @ 1g/L'],
    'https://images.unsplash.com/photo-1589923188900-85dae523342b',
    'High'
);

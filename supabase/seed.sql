-- ==============================================================================
-- AgriSmart AI - Initial Agricultural Seed Data
-- ==============================================================================

INSERT INTO public.crops (
    name, scientific_name, category, suitable_soils, suitable_seasons,
    water_requirement, climate_requirements, cultivation_duration_days,
    description, region_tags, is_active
) VALUES
(
    'Rice (Paddy)', 'Oryza sativa', 'Cereals',
    ARRAY['Clay loam', 'Alluvial soil', 'Clay soil'],
    ARRAY['kharif'],
    'high',
    '{"temperature_min": 20, "temperature_max": 38, "rainfall_min_mm": 1000, "rainfall_max_mm": 2500}'::jsonb,
    130,
    'Staple food grain requiring standing water and warm, humid climate. Thrives in submerged conditions.',
    ARRAY['Punjab', 'Haryana', 'West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Uttar Pradesh'],
    TRUE
),
(
    'Wheat', 'Triticum aestivum', 'Cereals',
    ARRAY['Loamy soil', 'Alluvial soil', 'Clay loam'],
    ARRAY['rabi'],
    'moderate',
    '{"temperature_min": 10, "temperature_max": 25, "rainfall_min_mm": 400, "rainfall_max_mm": 750}'::jsonb,
    120,
    'Cool-season cereal requiring bright sunshine during ripening and moderate moisture.',
    ARRAY['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Bihar'],
    TRUE
),
(
    'Maize (Corn)', 'Zea mays', 'Cereals',
    ARRAY['Sandy loam', 'Loamy soil', 'Alluvial soil'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 18, "temperature_max": 35, "rainfall_min_mm": 500, "rainfall_max_mm": 800}'::jsonb,
    95,
    'Versatile grain and fodder crop adaptable to various seasons with well-drained fertile soils.',
    ARRAY['Karnataka', 'Madhya Pradesh', 'Bihar', 'Tamil Nadu', 'Telangana', 'Maharashtra'],
    TRUE
),
(
    'Chickpea (Gram)', 'Cicer arietinum', 'Pulses',
    ARRAY['Sandy loam', 'Black soil', 'Loamy soil'],
    ARRAY['rabi'],
    'low',
    '{"temperature_min": 15, "temperature_max": 30, "rainfall_min_mm": 300, "rainfall_max_mm": 500}'::jsonb,
    110,
    'Major winter legume that enriches soil through atmospheric nitrogen fixation.',
    ARRAY['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'Karnataka'],
    TRUE
),
(
    'Pigeon Pea (Arhar/Tur)', 'Cajanus cajan', 'Pulses',
    ARRAY['Alluvial soil', 'Black soil', 'Loamy soil'],
    ARRAY['kharif'],
    'low',
    '{"temperature_min": 20, "temperature_max": 35, "rainfall_min_mm": 600, "rainfall_max_mm": 900}'::jsonb,
    180,
    'Deep-rooted drought-resistant pulse crop crucial for protein and soil structure regeneration.',
    ARRAY['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Uttar Pradesh'],
    TRUE
),
(
    'Groundnut (Peanut)', 'Arachis hypogaea', 'Oilseeds',
    ARRAY['Sandy loam', 'Red soil', 'Loamy soil'],
    ARRAY['kharif', 'zaid'],
    'moderate',
    '{"temperature_min": 22, "temperature_max": 32, "rainfall_min_mm": 500, "rainfall_max_mm": 750}'::jsonb,
    115,
    'Subterranean pod oilseed preferring well-drained, loose, sandy loams with good calcium availability.',
    ARRAY['Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Rajasthan', 'Karnataka'],
    TRUE
),
(
    'Soybean', 'Glycine max', 'Oilseeds',
    ARRAY['Black soil', 'Loamy soil', 'Clay loam'],
    ARRAY['kharif'],
    'moderate',
    '{"temperature_min": 20, "temperature_max": 32, "rainfall_min_mm": 600, "rainfall_max_mm": 850}'::jsonb,
    100,
    'High protein and oilseed crop requiring warm, moist conditions and moisture retention.',
    ARRAY['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Telangana'],
    TRUE
),
(
    'Cotton', 'Gossypium hirsutum', 'Commercial',
    ARRAY['Black soil', 'Alluvial soil', 'Clay loam'],
    ARRAY['kharif'],
    'moderate',
    '{"temperature_min": 21, "temperature_max": 35, "rainfall_min_mm": 500, "rainfall_max_mm": 1000}'::jsonb,
    165,
    'White gold cash crop best grown in moisture-retentive black basaltic soils (regur) with frost-free days.',
    ARRAY['Gujarat', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Haryana', 'Punjab'],
    TRUE
),
(
    'Sugarcane', 'Saccharum officinarum', 'Commercial',
    ARRAY['Alluvial soil', 'Clay loam', 'Black soil'],
    ARRAY['kharif', 'rabi'],
    'high',
    '{"temperature_min": 20, "temperature_max": 38, "rainfall_min_mm": 1200, "rainfall_max_mm": 2000}'::jsonb,
    360,
    'Perennial tropical grass requiring high warmth, heavy water, and deep fertile loams.',
    ARRAY['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar'],
    TRUE
),
(
    'Tomato', 'Solanum lycopersicum', 'Vegetables',
    ARRAY['Sandy loam', 'Loamy soil', 'Red soil', 'Clay loam'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 18, "temperature_max": 30, "rainfall_min_mm": 400, "rainfall_max_mm": 600}'::jsonb,
    90,
    'High-value vegetable crop requiring well-drained soils, consistent drip moisture, and balanced nutrients.',
    ARRAY['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha', 'Maharashtra'],
    TRUE
),
(
    'Onion', 'Allium cepa', 'Vegetables',
    ARRAY['Sandy loam', 'Clay loam', 'Alluvial soil'],
    ARRAY['kharif', 'rabi'],
    'moderate',
    '{"temperature_min": 15, "temperature_max": 30, "rainfall_min_mm": 350, "rainfall_max_mm": 600}'::jsonb,
    120,
    'Cool-season vegetable requiring friable, organic-rich soil with optimal phosphorus and potash.',
    ARRAY['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Rajasthan'],
    TRUE
),
(
    'Mango', 'Mangifera indica', 'Fruits',
    ARRAY['Alluvial soil', 'Loamy soil', 'Red soil', 'Laterite soil'],
    ARRAY['kharif', 'rabi', 'zaid'],
    'moderate',
    '{"temperature_min": 24, "temperature_max": 36, "rainfall_min_mm": 750, "rainfall_max_mm": 1500}'::jsonb,
    365,
    'King of fruits thriving in warm tropical and subtropical climates with distinct dry resting periods.',
    ARRAY['Uttar Pradesh', 'Andhra Pradesh', 'Karnataka', 'Bihar', 'Gujarat', 'Maharashtra'],
    TRUE
)
ON CONFLICT DO NOTHING;

-- Initial Agricultural Articles
INSERT INTO public.agricultural_articles (
    title, category, content, language, source_name, source_url, is_published
) VALUES
(
    'Understanding Soil pH and Nutrient Bioavailability',
    'Soil Management',
    'Soil pH is a master variable in agriculture. Between pH 6.0 and 7.5, most essential macro and micronutrients exist in forms readily absorbable by plant roots. In alkaline soils (pH > 7.8), phosphorus and zinc become immobilized into insoluble calcium compounds. Amending alkaline soils with farmyard manure or gypsum helps buffer pH and mobilize nutrients.',
    'en',
    'Indian Council of Agricultural Research (ICAR)',
    'https://icar.org.in',
    TRUE
),
(
    'Principles of Integrated Pest Management (IPM)',
    'Pest & Disease Management',
    'Integrated Pest Management is an eco-friendly approach focusing on long-term prevention through a combination of techniques: cultural controls (crop rotation, clean cultivation), biological controls (beneficial predators like Trichogramma, bio-agents like Trichoderma), physical barriers, and targeted rational chemical usage as a last resort.',
    'en',
    'Department of Agriculture & Farmers Welfare',
    'https://agricoop.gov.in',
    TRUE
),
(
    'Precision Drip Irrigation in Drought-Prone Regions',
    'Water Management',
    'Drip irrigation delivers water directly to the crop root zone at low pressures, cutting water loss from evaporation and weed transpiration by up to 50% compared to traditional flood irrigation. Pair drip lines with tensiometers or soil moisture probes to irrigate on demand.',
    'en',
    'National Mission on Micro Irrigation',
    'https://pmksy.gov.in',
    TRUE
)
ON CONFLICT DO NOTHING;


/**
 * Indian Agricultural Domain Reference Data
 * Standards aligned with ICAR (Indian Council of Agricultural Research) & Ministry of Agriculture
 */

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Jammu & Kashmir', 'Ladakh'
];

export const SOIL_TYPES = [
  'Alluvial soil',
  'Black soil',
  'Red soil',
  'Laterite soil',
  'Sandy loam',
  'Clay loam',
  'Clay soil',
  'Loamy soil',
  'Silty soil',
  'Saline / Alkaline soil',
  'Unknown / Unclassified'
];

export const SEASONS = [
  { id: 'kharif', name: 'Kharif (Monsoon)', months: 'June to October', sowing: 'June-July', harvesting: 'Sept-Oct' },
  { id: 'rabi', name: 'Rabi (Winter)', months: 'October to March', sowing: 'Oct-Nov', harvesting: 'Feb-April' },
  { id: 'zaid', name: 'Zaid (Summer)', months: 'March to June', sowing: 'Feb-March', harvesting: 'April-June' }
];

export const CROP_CATEGORIES = [
  'Cereals',
  'Pulses',
  'Oilseeds',
  'Vegetables',
  'Fruits',
  'Commercial',
  'Plantation',
  'Fodder'
];

export const IRRIGATION_METHODS = [
  'Drip irrigation',
  'Sprinkler system',
  'Furrow / Flood irrigation',
  'Basin / Manual flood',
  'Rainfed only'
];

export const WATER_AVAILABILITY_LEVELS = [
  { id: 'low', label: 'Low (Deep groundwater / Scanty rainfall)' },
  { id: 'moderate', label: 'Moderate (Borewell / Seasonal canal)' },
  { id: 'high', label: 'High (Perennial canal / Abundant water table)' }
];

export const STATE_COORDINATES = {
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Default': { lat: 20.5937, lon: 78.9629 } // Central India
};


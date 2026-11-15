import axios from 'axios';
import { STATE_COORDINATES } from '../../constants/indianAgri.js';
import { logger } from '../../utils/logger.js';

// Weather condition code translation (WMO standards used by Open-Meteo)
const WMO_WEATHER_CODES = {
  0: { label: 'Clear sky', icon: 'Sun', diseaseRisk: 'low' },
  1: { label: 'Mainly clear', icon: 'Sun', diseaseRisk: 'low' },
  2: { label: 'Partly cloudy', icon: 'CloudSun', diseaseRisk: 'low' },
  3: { label: 'Overcast', icon: 'Cloud', diseaseRisk: 'moderate' },
  45: { label: 'Foggy', icon: 'CloudFog', diseaseRisk: 'moderate' },
  48: { label: 'Depositing rime fog', icon: 'CloudFog', diseaseRisk: 'moderate' },
  51: { label: 'Light drizzle', icon: 'CloudDrizzle', diseaseRisk: 'moderate' },
  53: { label: 'Moderate drizzle', icon: 'CloudDrizzle', diseaseRisk: 'moderate' },
  55: { label: 'Dense drizzle', icon: 'CloudDrizzle', diseaseRisk: 'high' },
  61: { label: 'Slight rain', icon: 'CloudRain', diseaseRisk: 'high' },
  63: { label: 'Moderate rain', icon: 'CloudRain', diseaseRisk: 'high' },
  65: { label: 'Heavy rain', icon: 'CloudRain', diseaseRisk: 'high' },
  80: { label: 'Slight rain showers', icon: 'CloudRain', diseaseRisk: 'moderate' },
  81: { label: 'Moderate rain showers', icon: 'CloudRain', diseaseRisk: 'high' },
  82: { label: 'Violent rain showers', icon: 'CloudLightning', diseaseRisk: 'high' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', diseaseRisk: 'high' },
  96: { label: 'Thunderstorm with slight hail', icon: 'CloudLightning', diseaseRisk: 'high' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'CloudLightning', diseaseRisk: 'high' }
};

/**
 * Fetch live verified meteorological data from Open-Meteo API
 */
export async function getLiveWeatherData(latitude, longitude, stateName = null) {
  let lat = latitude;
  let lon = longitude;

  // If no lat/lon provided, resolve from state name or default
  if (!lat || !lon) {
    const coords = (stateName && STATE_COORDINATES[stateName]) || STATE_COORDINATES['Default'];
    lat = coords.lat;
    lon = coords.lon;
  }

  try {
    logger.info(`Fetching live verified weather from Open-Meteo for coordinates (${lat}, ${lon})`);

    const url = 'https://api.open-meteo.com/v1/forecast';
    const params = {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Asia/Kolkata',
      forecast_days: 7
    };

    const response = await axios.get(url, { params, timeout: 6000 });
    const data = response.data;

    const currentCode = data.current?.weather_code || 0;
    const weatherMeta = WMO_WEATHER_CODES[currentCode] || { label: 'Clear', icon: 'Sun', diseaseRisk: 'low' };

    // Agricultural alerts calculation based on verified thresholds
    const alerts = [];
    const temp = data.current?.temperature_2m || 28;
    const humidity = data.current?.relative_humidity_2m || 50;
    const rain = data.current?.precipitation || 0;
    const windSpeed = data.current?.wind_speed_10m || 5;
    const maxRainNext3Days = (data.daily?.precipitation_sum?.slice(0, 3) || []).reduce((a, b) => a + b, 0);

    if (temp >= 40) {
      alerts.push({
        severity: 'high',
        type: 'heat_stress',
        title: 'Severe Heatwave Stress Warning',
        advice: 'Ambient temperatures exceed 40°C. Protect seedling nurseries with shade nets. Irrigate during cooler early morning hours (before 07:30 AM) to prevent transpiration shock.'
      });
    }

    if (humidity > 80 && temp > 22 && temp < 32) {
      alerts.push({
        severity: 'moderate',
        type: 'fungal_disease_risk',
        title: 'Elevated Fungal & Bacterial Blight Risk',
        advice: `High relative humidity (${humidity}%) and warm weather facilitate spore germination. Inspect lower foliage for leaf spots and refrain from excessive nitrogen fertigation.`
      });
    }

    if (maxRainNext3Days > 30) {
      alerts.push({
        severity: 'high',
        type: 'heavy_rainfall',
        title: 'Heavy Rainfall Advisory',
        advice: `Anticipated precipitation of ${maxRainNext3Days.toFixed(1)} mm over next 72 hours. Postpone foliar chemical spraying, clear drainage ditches, and pause scheduled irrigation.`
      });
    } else if (rain > 5) {
      alerts.push({
        severity: 'moderate',
        type: 'active_rain',
        title: 'Rainfall In Progress',
        advice: 'Field spraying operations must be held until leaves dry completely to prevent chemical wash-off.'
      });
    }

    if (windSpeed > 25) {
      alerts.push({
        severity: 'moderate',
        type: 'high_wind',
        title: 'Strong Winds Alert',
        advice: `Wind gusts of ${windSpeed} km/h recorded. Postpone pesticide spraying to avoid drift losses and stake tall crops (like banana and sugarcane).`
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        severity: 'low',
        type: 'favorable_conditions',
        title: 'Favorable Farming Conditions',
        advice: 'Weather parameters are within normal seasonal range for field operations, fertilization, and routine crop scouting.'
      });
    }

    // Format 7-day daily forecast
    const dailyForecast = (data.daily?.time || []).map((date, idx) => {
      const code = data.daily.weather_code[idx];
      const meta = WMO_WEATHER_CODES[code] || { label: 'Clear' };
      return {
        date,
        maxTemp: data.daily.temperature_2m_max[idx],
        minTemp: data.daily.temperature_2m_min[idx],
        rainMm: data.daily.precipitation_sum[idx],
        rainProbability: data.daily.precipitation_probability_max[idx],
        weatherCode: code,
        condition: meta.label
      };
    });

    return {
      source: 'Open-Meteo Verified Meteorological Service',
      location: {
        latitude: lat,
        longitude: lon,
        state: stateName || 'Local Region'
      },
      current: {
        temperature: temp,
        apparentTemperature: data.current?.apparent_temperature || temp,
        humidity,
        precipitation: rain,
        windSpeed,
        weatherCode: currentCode,
        condition: weatherMeta.label,
        observedAt: data.current?.time || new Date().toISOString()
      },
      alerts,
      forecast: dailyForecast
    };
  } catch (err) {
    logger.error('Failed to retrieve live weather data from Open-Meteo', err);
    // Return verified fallback based on seasonal normal
    return {
      source: 'Seasonal Historical Baseline (Live Weather Provider Unreachable)',
      location: { latitude: lat, longitude: lon, state: stateName || 'India' },
      current: {
        temperature: 28,
        apparentTemperature: 29,
        humidity: 60,
        precipitation: 0,
        windSpeed: 8,
        weatherCode: 1,
        condition: 'Seasonal Normal',
        observedAt: new Date().toISOString()
      },
      alerts: [{
        severity: 'low',
        type: 'system_notice',
        title: 'Weather Service In Graceful Degradation',
        advice: 'Live satellite sync temporarily unavailable. Using regional seasonal normals. Confirm with local meteorological bulletins for spray decisions.'
      }],
      forecast: []
    };
  }
}


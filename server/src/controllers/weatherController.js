import * as weatherService from '../services/weather/weatherService.js';

export async function getCurrentWeather(req, res, next) {
  try {
    const { lat, lon, state } = req.query;
    const weather = await weatherService.getLiveWeatherData(
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null,
      state || req.profile?.state
    );

    return res.json({
      success: true,
      message: 'Current live weather retrieved',
      data: weather.current,
      location: weather.location,
      source: weather.source,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getForecast(req, res, next) {
  try {
    const { lat, lon, state } = req.query;
    const weather = await weatherService.getLiveWeatherData(
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null,
      state || req.profile?.state
    );

    return res.json({
      success: true,
      message: '7-day weather forecast retrieved',
      data: weather.forecast,
      location: weather.location,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getWeatherAdvisory(req, res, next) {
  try {
    const { lat, lon, state } = req.query;
    const weather = await weatherService.getLiveWeatherData(
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null,
      state || req.profile?.state
    );

    return res.json({
      success: true,
      message: 'Weather-based agricultural advisory retrieved',
      data: {
        location: weather.location,
        current: weather.current,
        alerts: weather.alerts,
        forecast: weather.forecast,
        source: weather.source
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}


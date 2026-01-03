// ===================================================================
// FILE: backend/services/weather.service.js
// ===================================================================

const axios = require('axios');

class WeatherService {
  // Fetch weather data (using OpenWeatherMap or similar)
  static async getWeatherData(location) {
    try {
      // Mock weather data for development
      // In production, integrate with real weather API
      
      return {
        temperature: 28.5,
        humidity: 65,
        rainfall: 15.2,
        condition: 'Partly cloudy',
        windSpeed: 12.5,
        date: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Weather fetch failed:', error);
      return null;
    }
  }

  // Get historical weather (for ML models)
  static async getHistoricalWeather(location, days = 30) {
    try {
      // Mock historical data
      const data = [];
      for (let i = 0; i < days; i++) {
        data.push({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          temperature: 25 + Math.random() * 10,
          rainfall: Math.random() * 20,
          humidity: 60 + Math.random() * 20,
        });
      }
      return data;
    } catch (error) {
      console.error('Historical weather fetch failed:', error);
      return [];
    }
  }
}

module.exports = WeatherService;
'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState({ lat: null, lon: null, city: 'Loading...' });

    useEffect(() => {
        getCurrentLocationWeather();
    }, []);

    const getCurrentLocationWeather = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude, city: 'Your Location' });
                fetchWeather(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Fallback to default location (Delhi, India)
                setLocation({ lat: 28.6139, lon: 77.2090, city: 'Delhi' });
                fetchWeather(28.6139, 77.2090);
            }
        );
    };

    const fetchWeather = async (lat, lon) => {
        try {
            // Using Open-Meteo API (free, no API key required)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
            );

            if (!response.ok) throw new Error('Weather data unavailable');

            const data = await response.json();

            // Get city name using reverse geocoding
            try {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                );
                const geoData = await geoResponse.json();
                setLocation(prev => ({
                    ...prev,
                    city: geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Your Location'
                }));
            } catch (e) {
                console.error('Geocoding error:', e);
            }

            setWeather(data);
            setLoading(false);
            setError('');
        } catch (err) {
            setError('Failed to fetch weather data');
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        // Weather code mapping for Open-Meteo
        if (code === 0) return 'SunIcon';
        if (code <= 3) return 'CloudIcon';
        if (code <= 67) return 'CloudIcon'; // Rain
        if (code <= 77) return 'CloudIcon'; // Snow
        if (code <= 99) return 'BoltIcon'; // Thunderstorm
        return 'CloudIcon';
    };

    const getWeatherDescription = (code) => {
        if (code === 0) return 'Clear';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 99) return 'Thunderstorm';
        return 'Cloudy';
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-lg p-6 shadow-card text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Icon name="CloudIcon" size={24} className="text-white animate-pulse" />
                    <h2 className="text-xl font-heading font-bold">Weather</h2>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-white/20 rounded-lg"></div>
                    <div className="h-12 bg-white/20 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-lg p-6 shadow-card text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Icon name="CloudIcon" size={24} className="text-white" />
                    <h2 className="text-xl font-heading font-bold">Weather</h2>
                </div>
                <p className="text-white/80 text-sm">{error}</p>
                <button
                    onClick={getCurrentLocationWeather}
                    className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-body transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-lg p-6 shadow-lg text-white backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Icon name={getWeatherIcon(weather?.current?.weather_code)} size={24} className="text-white" />
                    <h2 className="text-xl font-heading font-bold">Weather</h2>
                </div>
                <button
                    onClick={getCurrentLocationWeather}
                    className="p-2 hover:bg-white/20 rounded-md transition-colors"
                    title="Refresh weather"
                >
                    <Icon name="ArrowPathIcon" size={16} className="text-white" />
                </button>
            </div>

            <div className="space-y-4">
                {/* Current Weather */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white/80 font-body">{location.city}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-heading font-bold">
                                {Math.round(weather?.current?.temperature_2m || 0)}°
                            </span>
                            <span className="text-xl text-white/80">C</span>
                        </div>
                        <p className="text-sm text-white/90 font-body mt-1">
                            {getWeatherDescription(weather?.current?.weather_code)}
                        </p>
                    </div>
                    <Icon
                        name={getWeatherIcon(weather?.current?.weather_code)}
                        size={64}
                        className="text-white/90"
                    />
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="BeakerIcon" size={16} className="text-white/80" />
                            <span className="text-xs text-white/80 font-body">Humidity</span>
                        </div>
                        <p className="text-lg font-heading font-bold">
                            {weather?.current?.relative_humidity_2m || 0}%
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="CloudIcon" size={16} className="text-white/80" />
                            <span className="text-xs text-white/80 font-body">Wind Speed</span>
                        </div>
                        <p className="text-lg font-heading font-bold">
                            {Math.round(weather?.current?.wind_speed_10m || 0)} km/h
                        </p>
                    </div>
                </div>

                {/* 3-Day Forecast */}
                <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-white/80 font-body mb-3">3-Day Forecast</p>
                    <div className="grid grid-cols-3 gap-2">
                        {weather?.daily?.time?.slice(1, 4).map((date, index) => (
                            <div key={date} className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                                <p className="text-xs text-white/80 font-body mb-1">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <Icon
                                    name={getWeatherIcon(weather.daily.weather_code[index + 1])}
                                    size={24}
                                    className="text-white/90 mx-auto mb-1"
                                />
                                <p className="text-sm font-heading font-bold">
                                    {Math.round(weather.daily.temperature_2m_max[index + 1])}°
                                </p>
                                <p className="text-xs text-white/70">
                                    {Math.round(weather.daily.temperature_2m_min[index + 1])}°
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
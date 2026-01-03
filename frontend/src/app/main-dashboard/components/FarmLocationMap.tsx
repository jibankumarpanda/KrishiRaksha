'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FarmLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: number;
  crop: string;
}

interface FarmLocationMapProps {
  locations: FarmLocation[];
}

const FarmLocationMap = ({ locations }: FarmLocationMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<FarmLocation | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [userLocation, setUserLocation] = useState<FarmLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentUserLocation: FarmLocation = {
          id: 'current-location',
          name: 'Your Current Location',
          lat: latitude,
          lng: longitude,
          area: 0,
          crop: 'Current Position',
        };
        setUserLocation(currentUserLocation);
        setSelectedLocation(currentUserLocation);
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
        }
      }
    );
  };

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="MapPinIcon" size={24} className="text-accent" />
          <h2 className="text-xl font-heading font-bold text-foreground">Farm Locations</h2>
        </div>
        <div className="w-full h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  const allLocations = userLocation ? [...locations, userLocation] : locations;
  const defaultLocation = userLocation || locations[0] || { lat: 20.5937, lng: 78.9629 };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MapPinIcon" size={24} className="text-accent" />
          <h2 className="text-xl font-heading font-bold text-foreground">Farm Locations</h2>
        </div>
        <button
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-body transition-colors ${isLoadingLocation
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
        >
          <Icon
            name={isLoadingLocation ? 'ArrowPathIcon' : 'LocationMarkerIcon'}
            size={16}
            className={isLoadingLocation ? 'animate-spin' : ''}
          />
          <span>{isLoadingLocation ? 'Getting Location...' : 'Get My Location'}</span>
        </button>
      </div>

      {locationError && (
        <div className="mb-4 p-3 bg-error/10 border border-error rounded-md text-error text-sm font-body">
          {locationError}
        </div>
      )}

      <div className="relative w-full h-96 rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Farm Locations Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${defaultLocation.lat},${defaultLocation.lng}&z=10&output=embed`}
          className="border-0"
        />
      </div>

      {/* Location List */}
      <div className="mt-4 space-y-2">
        {allLocations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`w-full flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${selectedLocation?.id === location.id
                ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
          >
            <div className="flex items-center space-x-3">
              <Icon
                name={location.id === 'current-location' ? 'LocationMarkerIcon' : 'MapPinIcon'}
                size={20}
                className={location.id === 'current-location' ? 'text-success' : 'text-primary'}
              />
              <div className="text-left">
                <p className="text-sm font-body font-medium text-foreground">{location.name}</p>
                <p className="text-xs text-text-secondary font-body">
                  {location.area > 0 ? `${location.area} acres • ${location.crop}` : location.crop}
                  {location.id === 'current-location' && (
                    <span className="ml-2 text-success font-medium">• Live</span>
                  )}
                </p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FarmLocationMap;

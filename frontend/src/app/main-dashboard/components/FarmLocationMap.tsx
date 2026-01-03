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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  const defaultLocation = locations[0] || { lat: 20.5937, lng: 78.9629 };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="MapPinIcon" size={24} className="text-accent" />
        <h2 className="text-xl font-heading font-bold text-foreground">Farm Locations</h2>
      </div>

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
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`w-full flex items-center justify-between p-3 rounded-md border transition-all duration-200 ${
              selectedLocation?.id === location.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon name="MapPinIcon" size={20} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-body font-medium text-foreground">{location.name}</p>
                <p className="text-xs text-text-secondary font-body">
                  {location.area} acres • {location.crop}
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

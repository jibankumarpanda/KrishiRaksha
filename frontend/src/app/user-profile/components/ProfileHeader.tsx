'use client';

import { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    avatarAlt: string;
    joinedDate: string;
  };
  onAvatarUpload: (file: File) => void;
}

const ProfileHeader = ({ user, onAvatarUpload }: ProfileHeaderProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isHydrated) return;
    const file = e.target.files?.[0];
    if (file) onAvatarUpload(file);
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <div className="flex gap-6">
          <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
            <AppImage
              src={user.avatar}
              alt={user.avatarAlt}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer">
            <Icon name="CameraIcon" size={30} className="text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* User Info */}
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <h1 className="text-3xl font-bold text-foreground">{user.name || 'Farmer'}</h1>
            {user.email && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-body font-medium">
                Verified
              </span>
            )}
          </div>

          <div className="mt-2 space-y-2 text-text-secondary">
            {user.email && (
              <div className="flex gap-2 items-center justify-center md:justify-start">
                <Icon name="EnvelopeIcon" size={16} />
                <span className="font-body">{user.email}</span>
              </div>
            )}

            {user.phone && (
              <div className="flex gap-2 items-center justify-center md:justify-start">
                <Icon name="PhoneIcon" size={16} />
                <span className="font-body">{user.phone.replace('+91', '')}</span>
              </div>
            )}

            {user.joinedDate && (
              <div className="flex gap-2 items-center justify-center md:justify-start">
                <Icon name="CalendarIcon" size={16} />
                <span className="font-body">Member since {user.joinedDate}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileHeader;

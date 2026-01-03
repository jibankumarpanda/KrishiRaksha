'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Activity {
  id: string;
  type: 'claim' | 'prediction' | 'profile' | 'document' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter((activity) => activity.type === filter));
    }
  }, [filter, activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return 'DocumentTextIcon';
      case 'prediction':
        return 'ChartBarIcon';
      case 'profile':
        return 'UserIcon';
      case 'document':
        return 'DocumentIcon';
      case 'payment':
        return 'CurrencyRupeeIcon';
      default:
        return 'BellIcon';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'claim':
        return 'bg-secondary text-secondary-foreground';
      case 'prediction':
        return 'bg-primary text-primary-foreground';
      case 'profile':
        return 'bg-accent text-accent-foreground';
      case 'document':
        return 'bg-warning text-warning-foreground';
      case 'payment':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      success: { color: 'bg-success/10 text-success border-success/20', label: 'Success' },
      pending: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
      failed: { color: 'bg-error/10 text-error border-error/20', label: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-body font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Icon name="ClockIcon" size={28} className="text-primary" />
          Activity Timeline
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
              filter === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('claim')}
            className={`px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
              filter === 'claim' ?'bg-secondary text-secondary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Claims
          </button>
          <button
            onClick={() => setFilter('prediction')}
            className={`px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
              filter === 'prediction' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setFilter('payment')}
            className={`px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
              filter === 'payment' ?'bg-success text-success-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Payments
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Icon name="ClockIcon" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-body">No activities found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index !== filteredActivities.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}

                {/* Activity Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} shadow-card z-10`}>
                  <Icon name={getActivityIcon(activity.type) as any} size={20} />
                </div>

                {/* Activity Content */}
                <div className="flex-1 bg-background border border-border rounded-lg p-4 hover:shadow-card transition-shadow duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="font-body font-semibold text-foreground">{activity.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs font-body text-text-secondary whitespace-nowrap">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-body text-text-secondary">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;

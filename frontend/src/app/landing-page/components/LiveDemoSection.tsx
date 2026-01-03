'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DemoStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

const LiveDemoSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const demoStats: DemoStat[] = [
    { label: 'Active Farms', value: '12,450', change: '+8.2%', icon: 'HomeModernIcon' },
    { label: 'Claims Processed', value: '₹45.2Cr', change: '+15.3%', icon: 'DocumentCheckIcon' },
    { label: 'Avg. Payout Time', value: '36 hrs', change: '-12.5%', icon: 'ClockIcon' },
    { label: 'Satisfaction Rate', value: '96.8%', change: '+2.1%', icon: 'StarIcon' },
  ];

  if (!isHydrated) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded-lg animate-pulse mb-4 max-w-md mx-auto" />
            <div className="h-12 bg-muted rounded-lg animate-pulse max-w-2xl mx-auto" />
          </div>
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-4">
            <Icon name="PlayIcon" size={16} className="text-accent" />
            <span className="text-sm font-body font-medium text-accent">Interactive Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            See{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              KRISHI RAKSHA
            </span>
            {' '}in Action
          </h2>
          <p className="text-lg text-text-secondary font-body max-w-3xl mx-auto">
            Explore our live dashboard with real-time data from farms across India
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          

          <div className="bg-card rounded-2xl border border-border shadow-card-hover overflow-hidden">
            <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <span className="text-sm font-body font-medium text-foreground">Live Dashboard Preview</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs font-body text-text-secondary">Live Data</span>
              </div>
            </div>

            <div className="aspect-video bg-gradient-to-br from-muted to-background relative">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title="Sample Farm Location - Maharashtra"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=19.0760,72.8777&z=10&output=embed"
                className="absolute inset-0"
              />
              
              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card flex items-center space-x-2">
                  <Icon name="MapPinIcon" size={16} className="text-primary" />
                  <span className="text-sm font-body font-medium text-foreground">Maharashtra Region</span>
                </div>
                <div className="px-4 py-2 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card flex items-center space-x-2">
                  <Icon name="UserGroupIcon" size={16} className="text-secondary" />
                  <span className="text-sm font-body font-medium text-foreground">2,450 Active Farms</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 grid sm:grid-cols-3 gap-3">
                <div className="p-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="SunIcon" size={14} className="text-accent" />
                    <span className="text-xs font-body text-text-secondary">Weather</span>
                  </div>
                  <p className="text-sm font-heading font-bold text-foreground">28°C Sunny</p>
                </div>
                <div className="p-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="ChartBarIcon" size={14} className="text-primary" />
                    <span className="text-xs font-body text-text-secondary">Avg. Yield</span>
                  </div>
                  <p className="text-sm font-heading font-bold text-foreground">2,340 kg/acre</p>
                </div>
                <div className="p-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon name="ShieldCheckIcon" size={14} className="text-success" />
                    <span className="text-xs font-body text-text-secondary">Risk Level</span>
                  </div>
                  <p className="text-sm font-heading font-bold text-success">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;

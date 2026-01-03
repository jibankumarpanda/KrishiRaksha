'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import MissionSection from './MissionSection';
import FeaturesSection from './FeaturesSection';



import TechnologySection from './TechnologySection';
import FAQSection from './FAQSection';
import ContactSection from './ContactSection';

export default function AboutContent() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-muted" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-8 bg-muted rounded w-1/3 mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header isAuthenticated={true} />
      <NavigationBreadcrumb />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <MissionSection />
        <FeaturesSection />
        
        
        <TechnologySection />
        <FAQSection />
        <ContactSection />
      </div>
    </>
  );
}

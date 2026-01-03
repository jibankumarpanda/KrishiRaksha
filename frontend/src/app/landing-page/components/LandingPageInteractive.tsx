'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import HowItWorksTimeline from './HowitWorksTimeline';
import LiveDemoSection from './LiveDemoSection';


import CTASection from './CTASection';
import Footer from './Footer';

const LandingPageInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleGetStarted = () => {
    if (!isHydrated) return;
    router?.push('/authentication');
  };

  const handleViewDemo = () => {
    if (!isHydrated) return;
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-8 p-8">
          <div className="h-96 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />
      <FeaturesGrid />
      <HowItWorksTimeline />
      <div id="demo-section">
        <LiveDemoSection />
      </div>
     
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};

export default LandingPageInteractive;

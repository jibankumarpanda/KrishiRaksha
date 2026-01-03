'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

const HeroSection = ({ onGetStarted, onViewDemo }: HeroSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Loading placeholder while hydration
  if (!isHydrated) {
    return (
      <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(14,165,233,0.1),transparent_50%)]" />

        <div className="relative flex flex-col items-center space-y-6">
          <div className="h-16 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-32 w-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-12 w-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  // Main hero content
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 overflow-hidden flex items-center justify-center">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(14,165,233,0.1),transparent_50%)]" />

      {/* Hero content */}
      <div className="relative max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6 lg:space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 justify-center mx-auto">
          <Icon name="SparklesIcon" size={20} className="text-primary" />
          <span className="text-sm font-body font-medium text-primary">
            AI-Powered Insurance Platform
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
          Secure Your Harvest with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Smart Insurance
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-text-secondary font-body max-w-2xl mx-auto">
          Empowering Indian farmers with AI-driven crop yield predictions, fraud detection,
          and blockchain-backed transparent claims processing. Protect your livelihood with
          technology you can trust.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-body font-semibold text-lg shadow-primary hover:shadow-primary-hover hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={onViewDemo}
            className="px-8 py-4 bg-card border-2 border-primary text-primary rounded-lg font-body font-semibold text-lg hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Icon name="PlayIcon" size={20} />
            <span>View Live Demo</span>
          </button>
        </div>

        {/* Features / Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <span className="text-sm font-body text-text-secondary">No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <span className="text-sm font-body text-text-secondary">24/7 Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <span className="text-sm font-body text-text-secondary">Future Goal For Regional Languages</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

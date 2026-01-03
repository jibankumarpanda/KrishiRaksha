'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ArrowRight } from "lucide-react";


interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-secondary">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-12 bg-white/20 rounded-lg animate-pulse mb-6" />
            <div className="h-24 bg-white/20 rounded-lg animate-pulse mb-8" />
            <div className="h-14 bg-white/20 rounded-lg animate-pulse max-w-xs mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
            <Icon name="SparklesIcon" size={16} className="text-white" />
            <span className="text-sm font-body font-medium text-white">Limited Time Offer</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Start Protecting Your Harvest Today
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 font-body mb-8 max-w-2xl mx-auto">
            Join 12,000+ farmers who trust KRISHI RAKSHA for smart, transparent, and instant agricultural insurance
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-white text-primary rounded-lg font-body font-semibold text-lg shadow-card-hover hover:shadow-primary hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-body font-semibold text-lg hover:bg-white hover:text-primary hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Icon name="PhoneIcon" size={20} />
              <span>Talk to Expert</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} />
              <span className="text-sm font-body">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} />
              <span className="text-sm font-body">Free Trial Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircleIcon" size={20} />
              <span className="text-sm font-body">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

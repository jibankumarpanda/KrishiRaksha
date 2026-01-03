'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TimelineStep {
  number: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const HowItWorksTimeline = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const steps: TimelineStep[] = [
    {
      number: '01',
      title: 'Register & Verify',
      description: 'Create your account and verify your farm details with Aadhaar integration',
      icon: 'UserPlusIcon',
      details: [
        'Quick mobile or email registration',
        'Aadhaar-based farm verification',
        'Upload land ownership documents',
        'Complete profile in under 5 minutes',
      ],
    },
    {
      number: '02',
      title: 'Get AI Prediction',
      description: 'Our AI analyzes your farm data to predict yield and assess risks',
      icon: 'CpuChipIcon',
      details: [
        'Enter crop type and sowing details',
        'AI analyzes weather and soil data',
        'Receive yield prediction with 94% accuracy',
        'Get personalized risk assessment',
      ],
    },
    {
      number: '03',
      title: 'Choose Coverage',
      description: 'Select insurance plan based on predicted yield and coverage needs',
      icon: 'ShieldCheckIcon',
      details: [
        'View recommended insurance plans',
        'Compare coverage options',
        'Customize premium and coverage',
        'Instant policy activation',
      ],
    },
    {
      number: '04',
      title: 'Track & Claim',
      description: 'Monitor your farm in real-time and file claims instantly when needed',
      icon: 'ChartBarIcon',
      details: [
        'Real-time satellite monitoring',
        'Automated weather alerts',
        'One-click claim submission',
        'Receive payout within 48 hours',
      ],
    },
  ];

  const handleStepClick = (index: number) => {
    if (!isHydrated) return;
    setExpandedStep(expandedStep === index ? null : index);
  };

  if (!isHydrated) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/50 to-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded-lg animate-pulse mb-4 max-w-md mx-auto" />
            <div className="h-12 bg-muted rounded-lg animate-pulse max-w-2xl mx-auto" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/50 to-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mb-4">
            <Icon name="LightBulbIcon" size={16} className="text-secondary" />
            <span className="text-sm font-body font-medium text-secondary">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              KRISHI RAKSHA
            </span>
            {' '}Works
          </h2>
          <p className="text-lg text-text-secondary font-body max-w-3xl mx-auto">
            Get started with smart agricultural insurance in four simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="hidden lg:block relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform -translate-y-1/2" />
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-card border-4 border-primary rounded-full flex items-center justify-center shadow-card-hover">
                      <Icon name={step.icon as any} size={32} className="text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-heading font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary font-body">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
              >
                <button
                  onClick={() => handleStepClick(index)}
                  className="w-full p-6 flex items-center space-x-4 text-left hover:bg-muted transition-colors duration-200"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                      <Icon name={step.icon as any} size={24} className="text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-heading font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary font-body">
                      {step.description}
                    </p>
                  </div>
                  <Icon
                    name="ChevronDownIcon"
                    size={20}
                    className={`text-text-secondary transition-transform duration-200 ${
                      expandedStep === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedStep === index && (
                  <div className="px-6 pb-6 pt-2 border-t border-border">
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-2">
                          <Icon name="CheckCircleIcon" size={16} className="text-success mt-1 flex-shrink-0" />
                          <span className="text-sm text-text-secondary font-body">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;

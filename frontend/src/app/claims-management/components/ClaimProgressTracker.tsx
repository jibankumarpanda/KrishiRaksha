import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ClaimProgressTrackerProps {
  currentStep: number;
}

const ClaimProgressTracker = ({ currentStep }: ClaimProgressTrackerProps) => {
  const steps = [
    { id: 1, label: 'Submitted', icon: 'DocumentTextIcon' },
    { id: 2, label: 'Under Review', icon: 'MagnifyingGlassIcon' },
    { id: 3, label: 'Approved', icon: 'CheckCircleIcon' },
    { id: 4, label: 'Payment', icon: 'BanknotesIcon' },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground shadow-primary'
                    : isCurrent
                    ? 'bg-secondary text-secondary-foreground shadow-card-hover'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon name={step.icon as any} size={20} />
              </div>
              <span
                className={`mt-2 text-xs font-body font-medium text-center ${
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimProgressTracker;

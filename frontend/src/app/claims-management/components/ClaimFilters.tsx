'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ClaimFiltersProps {
  selectedStatus: string;
  selectedCrop: string;
  dateRange: { start: string; end: string };
  onStatusChange: (status: string) => void;
  onCropChange: (crop: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onReset: () => void;
}

const ClaimFilters = ({
  selectedStatus,
  selectedCrop,
  dateRange,
  onStatusChange,
  onCropChange,
  onDateRangeChange,
  onReset,
}: ClaimFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];

  const cropOptions = [
    { value: 'all', label: 'All Crops' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'maize', label: 'Maize' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-card">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-body font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Type Filter */}
        <div>
          <label className="block text-sm font-body font-medium text-foreground mb-2">
            Crop Type
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          >
            {cropOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-sm font-body font-medium text-foreground mb-2">
            From Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, start: e.target.value })
            }
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="block text-sm font-body font-medium text-foreground mb-2">
            To Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, end: e.target.value })
            }
            className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-body font-medium text-text-secondary hover:text-foreground transition-colors duration-200"
        >
          <Icon name="ArrowPathIcon" size={16} />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};

export default ClaimFilters;

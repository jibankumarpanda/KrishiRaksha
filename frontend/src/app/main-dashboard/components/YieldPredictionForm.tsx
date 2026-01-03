'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

// CSS for green slider styling
const sliderStyles = `
  .green-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: #e5e7eb;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
  }

  .green-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .green-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  /* Green fill for the selected portion */
  .green-slider::-webkit-slider-track {
    background: linear-gradient(to right, #10b981 0%, #10b981 var(--value), #e5e7eb var(--value), #e5e7eb 100%);
    border-radius: 5px;
  }

  .green-slider::-moz-range-track {
    background: linear-gradient(to right, #10b981 0%, #10b981 var(--value), #e5e7eb var(--value), #e5e7eb 100%);
    border-radius: 5px;
  }
`;

interface FormData {
  cropType: string;
  landAreaValue: number;
  landAreaUnit: string;
  sowingDate: string;
  soilType: string;
  irrigationType: string;
  fertilizerUsage: number;
}

interface YieldPredictionFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const YieldPredictionForm = ({ onSubmit, isLoading }: YieldPredictionFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    cropType: '',
    landAreaValue: 0,
    landAreaUnit: 'acre',
    sowingDate: '',
    soilType: '',
    irrigationType: '',
    fertilizerUsage: 50,
  });

  const cropTypes = [
    { value: 'rice', label: 'Rice (धान)' },
    { value: 'wheat', label: 'Wheat (गेहूं)' },
    { value: 'cotton', label: 'Cotton (कपास)' },
    { value: 'sugarcane', label: 'Sugarcane (गन्ना)' },
    { value: 'maize', label: 'Maize (मक्का)' },
  ];

  const soilTypes = [
    { value: 'alluvial', label: 'Alluvial Soil' },
    { value: 'black', label: 'Black Soil' },
    { value: 'red', label: 'Red Soil' },
    { value: 'laterite', label: 'Laterite Soil' },
    { value: 'desert', label: 'Desert Soil' },
  ];

  const irrigationTypes = [
    { value: 'drip', label: 'Drip Irrigation', icon: 'BeakerIcon' },
    { value: 'sprinkler', label: 'Sprinkler', icon: 'CloudIcon' },
    { value: 'flood', label: 'Flood Irrigation', icon: 'WaterIcon' },
    { value: 'rainfed', label: 'Rainfed', icon: 'CloudRainIcon' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      landAreaValue: Number(formData.landAreaValue),
    };
    onSubmit(payload);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
  <style jsx>{sliderStyles}</style>
  <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="ChartBarIcon" size={24} className="text-emerald-700" />
        <h2 className="text-xl font-heading font-bold text-foreground">Yield Prediction</h2>
      </div>

      <div className="space-y-4">
        {/* Crop Type */}
        <div>
          <label htmlFor="cropType" className="block text-sm font-body font-medium text-foreground mb-2">
            Crop Type <span className="text-error">*</span>
          </label>
          <select
            id="cropType"
            value={formData.cropType}
            onChange={(e) => handleInputChange('cropType', e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          >
            <option value="">Select crop type</option>
            {cropTypes.map((crop) => (
              <option key={crop.value} value={crop.value}>
                {crop.label}
              </option>
            ))}
          </select>
        </div>

        {/* Land Area */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="landAreaValue" className="block text-sm font-body font-medium text-foreground mb-2">
              Land Area <span className="text-error">*</span>
            </label>
            <input
              type="number"
              id="landAreaValue"
              value={formData.landAreaValue || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, landAreaValue: Number(e.target.value) }))}
              placeholder="e.g., 5"
              min="0.1"
              step="0.1"
              required
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="landAreaUnit" className="block text-sm font-body font-medium text-foreground mb-2 opacity-0">Unit</label>
            <select
              id="landAreaUnit"
              value={formData.landAreaUnit}
              onChange={(e) => setFormData((prev) => ({ ...prev, landAreaUnit: e.target.value }))}
              required
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            >
              <option value="acre">Acre</option>
              <option value="hectare">Hectare</option>
              <option value="bigha">Bigha</option>
              <option value="katha">Katha</option>
              <option value="kanal">Kanal</option>
              <option value="marla">Marla</option>
              <option value="guntha">Guntha</option>
              <option value="cent">Cent</option>
            </select>
          </div>
        </div>

        {/* Sowing Date */}
        <div>
          <label htmlFor="sowingDate" className="block text-sm font-body font-medium text-foreground mb-2">
            Sowing Date <span className="text-error">*</span>
          </label>
          <input
            type="date"
            id="sowingDate"
            value={formData.sowingDate}
            onChange={(e) => handleInputChange('sowingDate', e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          />
        </div>

        {/* Soil Type */}
        <div>
          <label htmlFor="soilType" className="block text-sm font-body font-medium text-foreground mb-2">
            Soil Type <span className="text-error">*</span>
          </label>
          <select
            id="soilType"
            value={formData.soilType}
            onChange={(e) => handleInputChange('soilType', e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
          >
            <option value="">Select soil type</option>
            {soilTypes.map((soil) => (
              <option key={soil.value} value={soil.value}>
                {soil.label}
              </option>
            ))}
          </select>
        </div>

        {/* Irrigation Type */}
        <div>
          <label className="block text-sm font-body font-medium text-foreground mb-3">
            Irrigation Method <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {irrigationTypes.map((type) => (
              <label
                key={type.value}
                className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all duration-200 ${formData.irrigationType === type.value
                    ? 'border-emerald-700 bg-emerald-700/10' : 'border-input hover:border-emerald-700/50'
                  }`}
              >
                <input
                  type="radio"
                  name="irrigationType"
                  value={type.value}
                  checked={formData.irrigationType === type.value}
                  onChange={(e) => handleInputChange('irrigationType', e.target.value)}
                  className="w-4 h-4 text-emerald-700 focus:ring-emerald-700"
                  required
                />
                <Icon name={type.icon as any} size={20} className="text-emerald-700" />
                <span className="text-sm font-body text-foreground">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fertilizer Usage */}
        <div>
          <label htmlFor="fertilizerUsage" className="block text-sm font-body font-medium text-foreground mb-2">
            Fertilizer Usage: {formData.fertilizerUsage} kg/acre
          </label>
          <input
            type="range"
            id="fertilizerUsage"
            min="0"
            max="200"
            step="5"
            value={formData.fertilizerUsage}
            onChange={(e) => handleInputChange('fertilizerUsage', parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-700"
            style={{ '--value': `${(formData.fertilizerUsage / 200) * 100}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>0 kg</span>
            <span>100 kg</span>
            <span>200 kg</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-700 text-white py-3 rounded-md font-body font-medium hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <Icon name="SparklesIcon" size={20} />
              <span>Predict Yield</span>
            </>
          )}
        </button>
      </div>
    </form>
    </>
  );
};

export default YieldPredictionForm;

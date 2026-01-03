'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface NewClaimModalProps {
  onClose: () => void;
  onSubmit: (claimData: any) => void;
}

const NewClaimModal = ({ onClose, onSubmit }: NewClaimModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cropType: '',
    affectedArea: '',
    incidentDate: '',
    incidentDescription: '',
    damageType: '',
    estimatedLoss: '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const cropOptions = [
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'maize', label: 'Maize' },
  ];

  const damageTypes = [
    { value: 'flood', label: 'Flood' },
    { value: 'drought', label: 'Drought' },
    { value: 'pest', label: 'Pest Attack' },
    { value: 'disease', label: 'Crop Disease' },
    { value: 'hail', label: 'Hailstorm' },
    { value: 'fire', label: 'Fire' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedPhotos([...uploadedPhotos, ...Array.from(e.target.files)]);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedDocuments([...uploadedDocuments, ...Array.from(e.target.files)]);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      photos: uploadedPhotos,
      documents: uploadedDocuments,
    });
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.cropType &&
        formData.affectedArea &&
        formData.incidentDate &&
        formData.damageType
      );
    }
    if (currentStep === 2) {
      return formData.incidentDescription && formData.estimatedLoss;
    }
    if (currentStep === 3) {
      return uploadedPhotos.length > 0;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-foreground/50">
      <div className="bg-card rounded-lg shadow-card-hover max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Submit New Claim
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Step {currentStep} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full mx-1 transition-all duration-300 ${
                  step <= currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Crop Type <span className="text-error">*</span>
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                >
                  <option value="">Select crop type</option>
                  {cropOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Affected Area (acres) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="affectedArea"
                  value={formData.affectedArea}
                  onChange={handleInputChange}
                  placeholder="Enter affected area"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Incident Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Damage Type <span className="text-error">*</span>
                </label>
                <select
                  name="damageType"
                  value={formData.damageType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                >
                  <option value="">Select damage type</option>
                  {damageTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Incident Details
              </h3>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Incident Description <span className="text-error">*</span>
                </label>
                <textarea
                  name="incidentDescription"
                  value={formData.incidentDescription}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe the incident in detail..."
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Estimated Loss (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="estimatedLoss"
                  value={formData.estimatedLoss}
                  onChange={handleInputChange}
                  placeholder="Enter estimated loss amount"
                  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 3: Upload Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Upload Evidence
              </h3>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Damage Photos <span className="text-error">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Icon name="PhotoIcon" size={40} className="text-muted-foreground mb-2" />
                    <span className="text-sm font-body text-foreground">
                      Click to upload photos
                    </span>
                    <span className="text-xs text-text-secondary mt-1">
                      PNG, JPG up to 10MB each
                    </span>
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                          <Icon name="PhotoIcon" size={24} className="text-muted-foreground" />
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-error text-error-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Icon name="XMarkIcon" size={16} />
                        </button>
                        <p className="text-xs text-text-secondary mt-1 truncate">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Supporting Documents (Optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors duration-200">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Icon
                      name="DocumentTextIcon"
                      size={40}
                      className="text-muted-foreground mb-2"
                    />
                    <span className="text-sm font-body text-foreground">
                      Click to upload documents
                    </span>
                    <span className="text-xs text-text-secondary mt-1">
                      PDF, DOC up to 10MB each
                    </span>
                  </label>
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            name="DocumentTextIcon"
                            size={20}
                            className="text-primary"
                          />
                          <span className="text-sm text-foreground truncate">
                            {doc.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="p-1 hover:bg-error/10 rounded transition-colors duration-200"
                        >
                          <Icon name="XMarkIcon" size={16} className="text-error" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="px-6 py-2 border border-border rounded-md text-sm font-body font-medium text-foreground hover:bg-muted transition-colors duration-200"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          <button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={!isStepValid()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-body font-medium hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? 'Submit Claim' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewClaimModal;

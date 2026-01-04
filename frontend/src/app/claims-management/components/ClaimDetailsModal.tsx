'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import ClaimStatusBadge from './ClaimStatusBadge';
import ClaimProgressTracker from './ClaimProgressTracker';

interface ClaimDetailsModalProps {
  claim: {
    id: string;
    submissionDate: string;
    cropType: string;
    claimedAmount: number;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'ml_verification';
    affectedArea: number;
    incidentDate: string;
    incidentDescription: string;
    assessorNotes?: string;
    documents: Array<{ name: string; url: string; type: string }>;
    photos: Array<{ url: string; alt: string }>;
    paymentTimeline?: Array<{ date: string; event: string }>;
    blockchainTxHash?: string;
  };
  onClose: () => void;
}

const ClaimDetailsModal = ({ claim, onClose }: ClaimDetailsModalProps) => {
  const getProgressStep = () => {
    switch (claim.status) {
      case 'pending':
        return 1;
      case 'under_review':
        return 2;
      case 'approved':
        return 3;
      case 'paid':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-foreground/50">
      <div className="bg-card rounded-lg shadow-card-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Claim Details
            </h2>
            <p className="text-sm text-text-secondary mt-1">Claim ID: {claim.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Tracker */}
          <div className="bg-muted/50 rounded-lg p-4">
            <ClaimProgressTracker currentStep={getProgressStep()} />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Claim Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Status:</span>
                  <ClaimStatusBadge status={claim.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Submission Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {claim.submissionDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Crop Type:</span>
                  <span className="text-sm font-medium text-foreground">
                    {claim.cropType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Claimed Amount:</span>
                  <span className="text-sm font-medium text-primary">
                    ₹{claim.claimedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Affected Area:</span>
                  <span className="text-sm font-medium text-foreground">
                    {claim.affectedArea} acres
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Incident Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Incident Date:</span>
                  <span className="text-sm font-medium text-foreground">
                    {claim.incidentDate}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-text-secondary block mb-2">
                    Description:
                  </span>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                    {claim.incidentDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessor Notes */}
          {claim.assessorNotes && (
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                Assessor Notes
              </h3>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">{claim.assessorNotes}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {claim.photos.length > 0 && (
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                Damage Photos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {claim.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-border"
                  >
                    <AppImage
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {claim.documents.length > 0 && (
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                Supporting Documents
              </h3>
              <div className="space-y-2">
                {claim.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name="DocumentTextIcon" size={20} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {doc.name}
                      </span>
                    </div>
                    <button className="text-sm text-primary hover:text-primary/80 font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Timeline */}
          {claim.paymentTimeline && claim.paymentTimeline.length > 0 && (
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                Payment Timeline
              </h3>
              <div className="space-y-3">
                {claim.paymentTimeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{event.event}</p>
                      <p className="text-xs text-text-secondary mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockchain Transaction */}
          {claim.blockchainTxHash && (
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                Blockchain Verification
              </h3>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="ShieldCheckIcon" size={20} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Transaction Hash
                  </span>
                </div>
                <p className="text-xs font-mono text-text-secondary break-all">
                  {claim.blockchainTxHash}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-md text-sm font-body font-medium text-foreground hover:bg-muted transition-colors duration-200"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-body font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-2">
            <Icon name="ArrowDownTrayIcon" size={16} />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsModal;

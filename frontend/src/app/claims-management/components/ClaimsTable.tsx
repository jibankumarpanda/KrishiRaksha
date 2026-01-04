'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import ClaimStatusBadge from './ClaimStatusBadge';

interface Claim {
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
}

interface ClaimsTableProps {
  claims: Claim[];
  onViewDetails: (claim: Claim) => void;
}

const ClaimsTable = ({ claims, onViewDetails }: ClaimsTableProps) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Claim ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Submission Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Crop Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Claimed Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-body font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {claims.map((claim) => (
              <tr
                key={claim.id}
                className="hover:bg-muted/30 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-body font-medium text-foreground">
                    {claim.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-text-secondary">
                    {claim.submissionDate}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground capitalize">
                    {claim.cropType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-primary">
                    ₹{claim.claimedAmount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ClaimStatusBadge status={claim.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onViewDetails(claim)}
                    className="flex items-center space-x-1 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors duration-150"
                  >
                    <Icon name="EyeIcon" size={16} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {claims.map((claim) => (
          <div key={claim.id} className="p-4 hover:bg-muted/30 transition-colors duration-150">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-body font-medium text-foreground">
                  {claim.id}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {claim.submissionDate}
                </p>
              </div>
              <ClaimStatusBadge status={claim.status} />
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Crop Type:</span>
                <span className="text-xs font-medium text-foreground capitalize">
                  {claim.cropType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary">Amount:</span>
                <span className="text-xs font-medium text-primary">
                  ₹{claim.claimedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onViewDetails(claim)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-md text-sm font-body font-medium hover:bg-primary/20 transition-colors duration-150"
            >
              <Icon name="EyeIcon" size={16} />
              <span>View Details</span>
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {claims.length === 0 && (
        <div className="py-12 text-center">
          <Icon name="DocumentTextIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-body text-foreground mb-2">No claims found</p>
          <p className="text-sm text-text-secondary">
            Try adjusting your filters or submit a new claim
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaimsTable;

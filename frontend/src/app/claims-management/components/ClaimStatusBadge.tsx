import React from 'react';

interface ClaimStatusBadgeProps {
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';
}

const ClaimStatusBadge = ({ status }: ClaimStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
    },
    under_review: {
      label: 'Under Review',
      bgColor: 'bg-secondary/10',
      textColor: 'text-secondary',
      borderColor: 'border-secondary/20',
    },
    approved: {
      label: 'Approved',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/20',
    },
    rejected: {
      label: 'Rejected',
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error/20',
    },
    paid: {
      label: 'Paid',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      borderColor: 'border-primary/20',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
};

export default ClaimStatusBadge;

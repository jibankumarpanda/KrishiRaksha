'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHeader from './ProfileHeader';
import FarmInformation from './FarmInformation';
import ActivityTimeline from './ActivityTimeline';
import { apiClient } from '@/lib/api';

interface LandParcel {
  id: string;
  area: number;
  unit: string;
  cropType: string;
  soilType: string;
  irrigationType: string;
  location: string;
}

interface Activity {
  id: string;
  type: 'claim' | 'prediction' | 'profile' | 'document' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
  date?: Date; // Store actual date for sorting
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
  preview?: string;
  previewAlt?: string;
}

interface FarmerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  village?: string;
  district?: string;
  state?: string;
  landSizeAcres?: number;
  cropType?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

const UserProfileInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://ui-avatars.com/api/?name=Farmer&background=10b981&color=fff&size=128',
    avatarAlt: 'Farmer profile picture',
    language: 'en',
    joinedDate: ''
  });

  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    setIsHydrated(true);
    fetchFarmerData();
    fetchActivities();
  }, []);

  // Helper function to parse date from various formats
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      // Try ISO format first
      let date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
      
      // Try DD/MM/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(date.getTime())) return date;
      }
      
      // Try DD-MM-YYYY format
      const parts2 = dateString.split('-');
      if (parts2.length === 3) {
        date = new Date(`${parts2[2]}-${parts2[1]}-${parts2[0]}`);
        if (!isNaN(date.getTime())) return date;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string | Date): string => {
    if (!dateString) return 'Recently';
    
    try {
      const date = dateString instanceof Date ? dateString : parseDate(dateString);
      if (!date) return 'Recently';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
      if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Fetch and transform activities from backend data
  const fetchActivities = async () => {
    try {
      const activitiesList: Activity[] = [];

      // Check authentication
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch claims
      try {
        const claimsResponse = await apiClient.getClaims();
        if (claimsResponse.success && claimsResponse.claims) {
          claimsResponse.claims.forEach((claim: any) => {
            // Parse submission date - handle multiple formats
            let submissionDate = parseDate(claim.submissionDate || claim.incidentDate);
            if (!submissionDate) {
              // Fallback to current date if parsing fails
              submissionDate = new Date();
            }

            // Claim submission activity
            const claimStatus = claim.status || 'pending';
            const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
              'paid': 'success',
              'approved': 'success',
              'rejected': 'failed',
              'pending': 'pending',
              'under_review': 'pending',
              'ml_verification': 'pending',
            };

            const cropName = claim.cropType ? claim.cropType.charAt(0).toUpperCase() + claim.cropType.slice(1) : 'Crop';
            const claimDescription = `${cropName} damage claim${claim.affectedArea ? ` for ${claim.affectedArea} acres` : ''}${claim.claimedAmount ? ` - ₹${claim.claimedAmount.toLocaleString('en-IN')}` : ''}${claim.mlApproved === false ? ' - ML verification failed' : claim.mlApproved === true ? ' - ML verified' : ''}`;

            activitiesList.push({
              id: `claim-${claim.id}`,
              type: 'claim',
              title: `Claim ${claimStatus === 'paid' ? 'Paid' : claimStatus === 'approved' ? 'Approved' : claimStatus === 'rejected' ? 'Rejected' : 'Submitted'}`,
              description: claimDescription,
              timestamp: formatRelativeTime(submissionDate),
              status: statusMap[claimStatus] || 'pending',
              date: submissionDate,
            });

            // Payment activity for paid claims
            if (claimStatus === 'paid' && claim.claimedAmount) {
              activitiesList.push({
                id: `payment-${claim.id}`,
                type: 'payment',
                title: 'Payment Received',
                description: `Insurance payout of ₹${claim.claimedAmount.toLocaleString('en-IN')} credited to your account${claim.blockchainTxHash ? ' (Blockchain verified)' : ''}`,
                timestamp: formatRelativeTime(submissionDate),
                status: 'success',
                date: submissionDate,
              });
            }
          });
        }
      } catch (claimsError) {
        console.warn('Failed to fetch claims for activity timeline:', claimsError);
      }

      // Fetch dashboard stats for predictions
      try {
        const dashboardResponse = await apiClient.getDashboard();
        if (dashboardResponse.success && dashboardResponse.dashboard) {
          const stats = dashboardResponse.dashboard.stats;
          
          // Parse last updated date
          let lastUpdatedDate = stats.lastUpdated ? parseDate(stats.lastUpdated) : null;
          if (!lastUpdatedDate) {
            lastUpdatedDate = new Date(); // Fallback to current date
          }
          const cropName = dashboardResponse.dashboard.farmer.cropType 
            ? dashboardResponse.dashboard.farmer.cropType.charAt(0).toUpperCase() + dashboardResponse.dashboard.farmer.cropType.slice(1) 
            : '';

          // Yield prediction activity
          if (stats.predictedYield && stats.predictedYield > 0) {
            activitiesList.push({
              id: 'prediction-yield',
              type: 'prediction',
              title: 'Yield Prediction Generated',
              description: `AI prediction completed${cropName ? ` for ${cropName} crop` : ''} - Expected yield: ${stats.predictedYield.toFixed(1)} ${stats.yieldUnit || 'quintals'}${stats.riskScore !== undefined ? ` (Risk score: ${stats.riskScore}/100)` : ''}`,
              timestamp: formatRelativeTime(lastUpdatedDate),
              status: stats.riskScore && stats.riskScore > 70 ? 'pending' : 'success',
              date: lastUpdatedDate,
            });
          }

          // Risk assessment activity (only if different from yield prediction or if no yield prediction)
          if (stats.riskScore !== undefined && (!stats.predictedYield || stats.predictedYield === 0)) {
            const riskLevel = stats.riskScore <= 30 ? 'Low' : stats.riskScore <= 70 ? 'Medium' : 'High';
            activitiesList.push({
              id: 'prediction-risk',
              type: 'prediction',
              title: 'Risk Assessment',
              description: `${riskLevel} risk detected${cropName ? ` for ${cropName} crop` : ''} - Risk score: ${stats.riskScore}/100`,
              timestamp: formatRelativeTime(lastUpdatedDate),
              status: stats.riskScore > 70 ? 'pending' : 'success',
              date: lastUpdatedDate,
            });
          }
        }
      } catch (dashboardError) {
        console.warn('Failed to fetch dashboard for activity timeline:', dashboardError);
      }

      // Profile update activity (from farmer data)
      if (farmerData) {
        activitiesList.push({
          id: 'profile-created',
          type: 'profile',
          title: 'Profile Created',
          description: `Account created${farmerData.isPhoneVerified && farmerData.isEmailVerified ? ' - Phone and email verified' : farmerData.isPhoneVerified ? ' - Phone verified' : farmerData.isEmailVerified ? ' - Email verified' : ''}`,
          timestamp: 'Account created',
          status: 'success',
          date: new Date(), // Use current date as fallback
        });
      }

      // Sort activities by date (most recent first)
      activitiesList.sort((a, b) => {
        const dateA = a.date?.getTime() || 0;
        const dateB = b.date?.getTime() || 0;
        return dateB - dateA; // Most recent first
      });

      setActivities(activitiesList);
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      // Don't set error state - activities are optional
    }
  };

  const fetchFarmerData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Check if user is authenticated
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/authentication');
        return;
      }

      // Fetch farmer data from backend
      const response = await apiClient.getCurrentFarmer();
      
      if (response.success && response.farmer) {
        const farmer = response.farmer;
        setFarmerData(farmer);
        
        // Update user state with farmer data
        setUser({
          name: farmer.name || 'Farmer',
          email: farmer.email || '',
          phone: farmer.phone || '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name || 'Farmer')}&background=10b981&color=fff&size=128`,
          avatarAlt: `${farmer.name} profile picture`,
          language: 'en',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });

        // Create initial parcel from registration data if available
        if (farmer.state && farmer.landSizeAcres && farmer.cropType) {
          const initialParcel: LandParcel = {
            id: '1',
            area: farmer.landSizeAcres,
            unit: 'acres',
            cropType: farmer.cropType,
            soilType: 'Alluvial', // Default, can be updated
            irrigationType: 'Canal', // Default, can be updated
            location: `${farmer.village || ''}${farmer.village && farmer.district ? ', ' : ''}${farmer.district || ''}${farmer.district && farmer.state ? ', ' : ''}${farmer.state || ''}`.trim() || farmer.state || 'Not specified'
          };
          setParcels([initialParcel]);
        }

        // Fetch activities after farmer data is loaded
        await fetchActivities();
      }
    } catch (error: any) {
      console.error('Failed to fetch farmer data:', error);
      setError(error.message || 'Failed to load profile data');
      
      // If unauthorized, redirect to login
      if (error.message?.includes('token') || error.message?.includes('Unauthorized')) {
        router.push('/authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (file: File) => {
    if (!isHydrated) return;
    console.log('Avatar uploaded:', file.name);
  };

  const handleLanguageChange = (language: string) => {
    if (!isHydrated) return;
    setUser({ ...user, language });
    console.log('Language changed to:', language);
  };

  const handleAddParcel = (parcel: Omit<LandParcel, 'id'>) => {
    if (!isHydrated) return;
    const newParcel = {
      ...parcel,
      id: Date.now().toString()
    };
    setParcels([...parcels, newParcel]);
  };

  const handleEditParcel = (id: string, updates: Partial<LandParcel>) => {
    if (!isHydrated) return;
    setParcels(parcels.map((p) => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteParcel = (id: string) => {
    if (!isHydrated) return;
    setParcels(parcels.filter((p) => p.id !== id));
  };

  const handleDocumentUpload = (files: FileList) => {
    if (!isHydrated) return;
    console.log('Documents uploaded:', files.length);
  };

  const handleDocumentDelete = (id: string) => {
    if (!isHydrated) return;
    setDocuments(documents.filter((d) => d.id !== id));
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-96 bg-muted rounded-lg animate-pulse" />
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !farmerData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
            <p className="text-error font-body">{error}</p>
            <button
              onClick={fetchFarmerData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-body"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader
          user={user}
          onAvatarUpload={handleAvatarUpload}
          />


        <FarmInformation
          parcels={parcels}
          onAddParcel={handleAddParcel}
          onEditParcel={handleEditParcel}
          onDeleteParcel={handleDeleteParcel} />


       
        <ActivityTimeline activities={activities} />
      </div>
    </div>);

};

export default UserProfileInteractive;

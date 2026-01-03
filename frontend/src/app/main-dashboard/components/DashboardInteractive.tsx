'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';

import YieldPredictionForm from './YieldPredictionForm';
import YieldResults from './YieldResults';
import FileUploadZone from './FileUploadZone';
import YieldComparisonChart from './YieldComparisonChart';
import FraudDistributionChart from './FraudDistributionChart';
import FarmLocationMap from './FarmLocationMap';

interface FormData {
  cropType: string;
  landAreaValue: number;
  landAreaUnit: string;
  sowingDate: string;
  soilType: string;
  irrigationType: string;
  fertilizerUsage: number;
}

interface DashboardStats {
  totalLandArea: number;
  landAreaUnit: string;
  predictedYield: number;
  yieldUnit: string;
  riskScore: number;
  riskScoreUnit: string;
  activeClaims: number;
  trend: Record<string, any>;
  lastUpdated: string | null;
}

const DashboardInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [predictionResults, setPredictionResults] = useState({
    predictedYield: 0,
    confidence: 0,
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    recommendations: [] as string[],
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    
    // Check authentication before fetching dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!token || !isAuthenticated) {
        router.push('/authentication');
        return;
      }
    }
    
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setError('');
      
      // Double-check token before making request
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/authentication');
          return;
        }
      }
      
      const resp = await apiClient.getDashboard();
      if (resp.success && resp.dashboard?.stats) {
        setStats(resp.dashboard.stats as DashboardStats);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      
      // Handle authentication errors
      if (err.status === 401 || err.message?.toLowerCase().includes('token') || 
          err.message?.toLowerCase().includes('unauthorized') ||
          err.message?.toLowerCase().includes('authentication')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
        }
        router.push('/authentication');
      }
    }
  };

  const quickStats = [
    {
      title: 'Total Land Area',
      value: (stats?.totalLandArea || 0).toFixed(2),
      unit: stats?.landAreaUnit || 'acres',
      trend: (stats?.trend?.landArea as 'up' | 'down' | 'neutral') || 'neutral',
      trendValue: stats?.trend?.landAreaValue || '0%',
      trendLabel: stats?.trend?.landAreaLabel || 'Land utilisation',
      icon: 'MapIcon',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Active Claims',
      value: String(stats?.activeClaims ?? 0),
      unit: 'claims',
      trend: (stats?.trend?.claims as 'up' | 'down' | 'neutral') || 'neutral',
      trendValue: stats?.trend?.claimsValue || '0%',
      trendLabel: stats?.trend?.claimsLabel || 'Claim activity',
      icon: 'DocumentTextIcon',
      bgColor: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
    {
      title: 'Predicted Yield',
      value: (stats?.predictedYield || 0).toFixed(1),
      unit: stats?.yieldUnit || 'quintals',
      trend: (stats?.trend?.yield as 'up' | 'down' | 'neutral') || 'neutral',
      trendValue: stats?.trend?.yieldValue || '0%',
      trendLabel: stats?.trend?.yieldLabel || 'Latest prediction',
      icon: 'ChartBarIcon',
      bgColor: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      title: 'Risk Score',
      value: String(stats?.riskScore || 0),
      unit: stats?.riskScoreUnit || '/100',
      trend: (stats?.trend?.risk as 'up' | 'down' | 'neutral') || 'neutral',
      trendValue: stats?.trend?.riskValue || '0%',
      trendLabel: stats?.trend?.riskLabel || 'Risk trend',
      icon: 'ShieldCheckIcon',
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
    },
  ];

  const yieldComparisonData = [
    { season: 'Last Season', predicted: (stats?.predictedYield || 0) * 0.92, actual: (stats?.predictedYield || 0) * 0.9 },
    { season: 'Current', predicted: stats?.predictedYield || 0, actual: 0 },
  ];

  const fraudDistributionData = [
    { category: 'Genuine Claims', value: 82, color: '#10B981' },
    { category: 'Suspicious', value: 12, color: '#F59E0B' },
    { category: 'Fraudulent', value: 6, color: '#DC2626' },
  ];

  const farmLocations = [
    {
      id: '1',
      name: 'Registered Farm',
      lat: 20.5937,
      lng: 78.9629,
      area: stats?.totalLandArea || 0,
      crop: 'Primary Crop',
    },
  ];

  const handlePredictionSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      setShowResults(false);
      setError('');

      // Check authentication before making request
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/authentication');
          setIsLoading(false);
          return;
        }
      }

      const response = await apiClient.predictYield({
        cropType: formData.cropType,
        landAreaValue: formData.landAreaValue,
        landAreaUnit: formData.landAreaUnit,
        sowingDate: formData.sowingDate,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        fertilizerUsage: formData.fertilizerUsage,
      });

      if (response.success && response.prediction) {
        setPredictionResults(response.prediction);
        setShowResults(true);
        await fetchDashboard();
      }
    } catch (err: any) {
      console.error('Prediction failed:', err);
      
      // Handle different error types
      if (err.status === 404) {
        setError('API endpoint not found. Please check if the backend server is running and has the latest code deployed.');
      } else if (err.status === 401 || err.message?.toLowerCase().includes('token') || 
                 err.message?.toLowerCase().includes('unauthorized') ||
                 err.message?.toLowerCase().includes('authentication')) {
        setError('Authentication failed. Please login again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
        }
        router.push('/authentication');
      } else {
        setError(err.message || 'Prediction failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesUploaded = (files: File[]) => {
    console.log('Files uploaded:', files.length);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg text-error font-body text-sm">
            {error}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-card border border-border rounded-lg p-4 shadow-card flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${stat.bgColor}`}>
                  <Icon name={stat.icon as any} size={20} className={stat.iconColor} />
                </div>
                <span
                  className={`text-xs font-body px-2 py-1 rounded-full ${
                    stat.trend === 'up'
                      ? 'bg-success/10 text-success'
                      : stat.trend === 'down'
                      ? 'bg-error/10 text-error'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {stat.trendValue}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-secondary font-body">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-heading font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-text-secondary font-body">{stat.unit}</span>
                </div>
                <p className="text-xs text-text-secondary font-body mt-1">{stat.trendLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prediction Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <YieldPredictionForm onSubmit={handlePredictionSubmit} isLoading={isLoading} />
          {showResults && <YieldResults {...predictionResults} />}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUploadZone onFilesUploaded={handleFilesUploaded} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <YieldComparisonChart data={yieldComparisonData} />
          <FraudDistributionChart data={fraudDistributionData} />
        </div>

        {/* Map */}
        <FarmLocationMap locations={farmLocations} />
      </div>
    </div>
  );
};

export default DashboardInteractive;

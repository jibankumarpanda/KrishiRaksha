'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthTabs from './AuthTabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OTPVerification from './OTPVerification';
import { apiClient } from '@/lib/api';

interface LoginFormData {
  identifier: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmLocation: string;
  landArea?: string;
  landAreaValue?: string;
  landAreaUnit?: string;
  primaryCrop: string;
  termsAccepted: boolean;
  // Bank details
  bankName?: string;
  accountHolderName?: string;
  ifscCode?: string;
  accountNumber?: string;
  upiId?: string;
  bankMobile?: string;
  accountType?: 'savings' | 'current' | '';
  aadhaarNumber?: string;
}

interface Testimonial {
  name: string;
  location: string;
  image: string;
  alt: string;
  rating: number;
  text: string;
}

const AuthenticationInteractive = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [pendingMobile, setPendingMobile] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Reset form step when switching tabs
  useEffect(() => {
    setAuthStep('form');
    setErrorMessage('');
    setPendingRegisterData(null);
  }, [activeTab]);

  const testimonials: Testimonial[] = [
    {
      name: 'Rajesh Kumar',
      location: 'Punjab',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d7437585-1763294112440.png",
      alt: 'Middle-aged Indian farmer in white turban and blue shirt standing in wheat field',
      rating: 5,
      text: 'AgriInsure helped me get instant payout when my crop failed. Very easy to use!'
    },
    {
      name: 'Lakshmi Devi',
      location: 'Tamil Nadu',
      image: "https://images.unsplash.com/photo-1709207516801-c8cd368ca089",
      alt: 'Indian woman farmer in green saree with red border smiling in rice paddy field',
      rating: 5,
      text: 'The AI prediction saved my harvest. I got early warning about pest attack.'
    }
  ];

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Extract phone number from identifier (can be phone or email)
      let phone = data.identifier;
      
      // If it's an email, we need to handle it differently
      // For now, backend expects phone number, so we'll use identifier as-is
      // If it's a phone number format (10 digits), use it directly
      if (/^[6-9]\d{9}$/.test(data.identifier)) {
        phone = data.identifier;
      } else {
        // If it's an email, show error (backend currently requires phone)
        setErrorMessage('Please login with your phone number');
        setIsLoading(false);
        return;
      }

      const response = await apiClient.login(phone, data.password);
      
      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', response.farmer.name);
        localStorage.setItem('userId', response.farmer.id);
      }
      
      // Redirect to wallet connection page first
      router.push('/connect-wallet');
    } catch (error: any) {
      setErrorMessage(error.message || 'Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Store registration data for later use
      setPendingRegisterData(data);
      setPendingMobile(data.mobile);
      setPendingEmail(data.email);

      // Move to OTP verification step
      // OTPs will be sent automatically when OTPVerification component mounts
      setAuthStep('otp');
      setIsLoading(false);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to start registration. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    if (!pendingRegisterData) {
      setErrorMessage('Registration data not found. Please try again.');
      setAuthStep('form');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Convert land area to acres if needed
      let landSizeAcres = 0;
      if (pendingRegisterData.landAreaValue && pendingRegisterData.landAreaUnit) {
        const value = parseFloat(pendingRegisterData.landAreaValue);
        const unit = pendingRegisterData.landAreaUnit;
        
        // Convert to acres (approximate conversions)
        switch (unit) {
          case 'acre':
            landSizeAcres = value;
            break;
          case 'hectare':
            landSizeAcres = value * 2.47105;
            break;
          case 'bigha':
            landSizeAcres = value * 0.6198; // Approximate for India
            break;
          case 'katha':
            landSizeAcres = value * 0.06198;
            break;
          case 'kanal':
            landSizeAcres = value * 0.125;
            break;
          case 'marla':
            landSizeAcres = value * 0.00625;
            break;
          case 'guntha':
            landSizeAcres = value * 0.025;
            break;
          case 'cent':
            landSizeAcres = value * 0.01;
            break;
          default:
            landSizeAcres = value;
        }
      }

      // Prepare registration payload
      const registrationData = {
        phone: pendingRegisterData.mobile,
        email: pendingRegisterData.email,
        password: pendingRegisterData.password,
        name: pendingRegisterData.fullName,
        village: '', // Not in current form
        district: '', // Not in current form
        state: pendingRegisterData.farmLocation,
        landSizeAcres: landSizeAcres,
        cropType: pendingRegisterData.primaryCrop,
        upiId: pendingRegisterData.upiId || undefined,
        bankAccountNumber: pendingRegisterData.accountNumber || undefined,
        bankIfscCode: pendingRegisterData.ifscCode || undefined,
        bankName: pendingRegisterData.bankName || undefined,
      };

      const response = await apiClient.register(registrationData);

      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', response.farmer.name);
        localStorage.setItem('userId', response.farmer.id);
      }

      // Redirect to wallet connection page first
      router.push('/connect-wallet');
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      setIsLoading(false);
      // Optionally go back to form
      // setAuthStep('form');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      if (isHydrated && typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', 'Social User');
      }
      router.push('/main-dashboard');
    }, 1500);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Welcome to KRISHI RAKSHA
              </h1>
              <p className="text-base font-body text-text-secondary">
                Secure your harvest with AI-powered insurance
              </p>
            </div>

            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {errorMessage && (
              <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-sm font-body text-error">{errorMessage}</p>
              </div>
            )}

            {authStep === 'form' ? (
              activeTab === 'login' ? (
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
              ) : (
                <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
              )
            ) : (
              <OTPVerification
                mobile={pendingMobile}
                email={pendingEmail}
                onVerified={handleOTPVerified}
                onBack={() => {
                  setAuthStep('form');
                  setErrorMessage('');
                }}
              />
            )}

            <div className="mt-6">
              {/* Additional content can go here */}
            </div>
          </div>

          {/* Right Column - Trust Indicators & Testimonials */}
          <div className="space-y-6">
            {/* Trust indicators and testimonials can go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationInteractive;

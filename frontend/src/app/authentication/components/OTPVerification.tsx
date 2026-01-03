'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Props {
  mobile: string;
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function OTPVerification({ mobile, email, onVerified, onBack }: Props) {
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'email'>('phone'); // Start with phone verification
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Send phone OTP on mount
  useEffect(() => {
    if (step === 'phone' && mobile) {
      handleSendPhoneOTP();
    }
  }, [mobile]);

  // Send email OTP when moving to email step
  useEffect(() => {
    if (step === 'email' && email) {
      handleSendEmailOTP();
    }
  }, [step, email]);

  const handleSendPhoneOTP = async () => {
    setSendingOtp(true);
    setError('');
    setSuccess('');
    
    try {
      await apiClient.sendPhoneOTP(mobile);
      setSuccess('OTP sent to your phone number');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to phone');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setSendingOtp(true);
    setError('');
    setSuccess('');
    
    try {
      await apiClient.sendEmailOTP(email);
      setSuccess('OTP sent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to email');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.verifyPhoneOTP(mobile, phoneOtp);
      setSuccess('Phone verified successfully!');
      // Move to email verification after a brief delay
      setTimeout(() => {
        setStep('email');
        setPhoneOtp('');
        setError('');
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.verifyEmailOTP(email, emailOtp);
      setSuccess('Email verified successfully!');
      // Both OTPs verified, call onVerified callback
      setTimeout(() => {
        onVerified();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-heading text-foreground">
          Verify {step === 'phone' ? 'Phone' : 'Email'}
        </h2>
        {step === 'email' && (
          <button
            onClick={() => {
              setStep('phone');
              setEmailOtp('');
              setError('');
              setSuccess('');
            }}
            className="text-sm text-primary hover:text-primary/80 font-body"
          >
            ← Back to Phone
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-medium ${
              step === 'phone' || step === 'email'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary'
            }`}
          >
            1
          </div>
          <span className="text-xs font-body text-text-secondary mt-1">Phone</span>
        </div>
        <div className={`w-16 h-1 ${step === 'email' ? 'bg-primary' : 'bg-input'}`} />
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-body font-medium ${
              step === 'email'
                ? 'bg-primary text-primary-foreground'
                : 'bg-input text-text-secondary'
            }`}
          >
            2
          </div>
          <span className="text-xs font-body text-text-secondary mt-1">Email</span>
        </div>
      </div>

      {step === 'phone' ? (
        <>
          <p className="text-sm font-body text-text-secondary mb-4">
            OTP sent to <strong className="text-foreground">+91 {mobile}</strong>
          </p>

          <div>
            <label htmlFor="phoneOtp" className="block text-sm font-body font-medium text-foreground mb-2">
              Enter Phone OTP
            </label>
            <input
              id="phoneOtp"
              type="text"
              value={phoneOtp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPhoneOtp(value);
                setError('');
              }}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-3 border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-center text-xl tracking-widest"
              disabled={loading || sendingOtp}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendPhoneOTP}
              disabled={sendingOtp || loading}
              className="text-sm font-body text-primary hover:text-primary/80 transition-colors duration-150 disabled:opacity-50"
            >
              {sendingOtp ? 'Sending...' : 'Resend OTP'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-body text-text-secondary hover:text-foreground transition-colors duration-150"
            >
              ← Back
            </button>
          </div>

          <button
            onClick={handleVerifyPhoneOTP}
            disabled={loading || phoneOtp.length !== 6}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Phone & Continue</span>
            )}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm font-body text-text-secondary mb-4">
            OTP sent to <strong className="text-foreground">{email}</strong>
          </p>

          <div>
            <label htmlFor="emailOtp" className="block text-sm font-body font-medium text-foreground mb-2">
              Enter Email OTP
            </label>
            <input
              id="emailOtp"
              type="text"
              value={emailOtp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setEmailOtp(value);
                setError('');
              }}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-3 border rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-center text-xl tracking-widest"
              disabled={loading || sendingOtp}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendEmailOTP}
              disabled={sendingOtp || loading}
              className="text-sm font-body text-primary hover:text-primary/80 transition-colors duration-150 disabled:opacity-50"
            >
              {sendingOtp ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <button
            onClick={handleVerifyEmailOTP}
            disabled={loading || emailOtp.length !== 6}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Email & Complete</span>
            )}
          </button>
        </>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-sm font-body text-error">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-primary/10 border border-primary rounded-lg">
          <p className="text-sm font-body text-primary">{success}</p>
        </div>
      )}
    </div>
  );
}

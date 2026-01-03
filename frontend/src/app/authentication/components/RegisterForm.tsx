'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
}

interface RegisterFormData {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmLocation: string;
  landArea: string;
  landAreaValue: string;
  landAreaUnit: string;
  primaryCrop: string;
  termsAccepted: boolean;
  bankName: string;
  accountHolderName: string;
  ifscCode: string;
  accountNumber: string;
  upiId: string;
  bankMobile: string;
  accountType: 'savings' | 'current' | '';
  aadhaarNumber: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmLocation: '',
    landArea: '',
    landAreaValue: '',
    landAreaUnit: '',
    primaryCrop: '',
    termsAccepted: false,
    bankName: '',
    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
    upiId: '',
    bankMobile: '',
    accountType: '',
    aadhaarNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const indianStates = [
    'Andhra Pradesh',
    'Bihar',
    'Gujarat',
    'Haryana',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Punjab',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'West Bengal',
  ];

  const cropTypes = [
    'Rice',
    'Wheat',
    'Cotton',
    'Sugarcane',
    'Maize',
    'Pulses',
    'Groundnut',
    'Soybean',
    'Millets',
    'Vegetables',
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.farmLocation) {
      newErrors.farmLocation = 'Farm location is required';
    }

    if (!formData.landAreaValue) {
      newErrors.landAreaValue = 'Land area value is required';
    } else if (isNaN(Number(formData.landAreaValue)) || Number(formData.landAreaValue) <= 0) {
      newErrors.landAreaValue = 'Enter valid land area value';
    }

    if (!formData.landAreaUnit) {
      newErrors.landAreaUnit = 'Land area unit is required';
    }

    if (!formData.primaryCrop) {
      newErrors.primaryCrop = 'Primary crop is required';
    }
    
    // Bank details validation
    if (!formData.bankName || !formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountHolderName || !formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Enter valid IFSC code';
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Account type is required';
    }

    if (!formData.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Enter valid 12-digit Aadhaar number';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = {
        ...formData,
        landArea: `${formData.landAreaValue} ${formData.landAreaUnit}`,
      } as RegisterFormData;
      onSubmit(payload);
    }
  };

  const handleChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-body font-medium text-foreground mb-2">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
            errors.fullName ? 'border-error' : 'border-input'
          }`}
          placeholder="Enter your full name"
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-error font-body">{errors.fullName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mobile" className="block text-sm font-body font-medium text-foreground mb-2">
            Mobile Number
          </label>
          <input
            id="mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.mobile ? 'border-error' : 'border-input'
            }`}
            placeholder="10-digit mobile"
            disabled={isLoading}
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-error font-body">{errors.mobile}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.email ? 'border-error' : 'border-input'
            }`}
            placeholder="your@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error font-body">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-body font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.password ? 'border-error' : 'border-input'
              }`}
              placeholder="Min 6 characters"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors duration-150"
              disabled={isLoading}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error font-body">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-body font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.confirmPassword ? 'border-error' : 'border-input'
              }`}
              placeholder="Re-enter password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors duration-150"
              disabled={isLoading}
            >
              <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error font-body">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="farmLocation" className="block text-sm font-body font-medium text-foreground mb-2">
          Farm Location (State)
        </label>
        <select
          id="farmLocation"
          value={formData.farmLocation}
          onChange={(e) => handleChange('farmLocation', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
            errors.farmLocation ? 'border-error' : 'border-input'
          }`}
          disabled={isLoading}
        >
          <option value="">Select state</option>
          {indianStates.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.farmLocation && (
          <p className="mt-1 text-sm text-error font-body">{errors.farmLocation}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="landAreaValue" className="block text-sm font-body font-medium text-foreground mb-2">
            Land Area Value
          </label>
          <input
            id="landAreaValue"
            type="number"
            step="0.1"
            value={formData.landAreaValue}
            onChange={(e) => handleChange('landAreaValue', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.landAreaValue ? 'border-error' : 'border-input'
            }`}
            placeholder="e.g., 5"
            disabled={isLoading}
          />
          {errors.landAreaValue && (
            <p className="mt-1 text-sm text-error font-body">{errors.landAreaValue}</p>
          )}
        </div>

        <div>
          <label htmlFor="landAreaUnit" className="block text-sm font-body font-medium text-foreground mb-2">
            Land Area Unit
          </label>
          <select
            id="landAreaUnit"
            value={formData.landAreaUnit}
            onChange={(e) => handleChange('landAreaUnit', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.landAreaUnit ? 'border-error' : 'border-input'
            }`}
            disabled={isLoading}
          >
            <option value="">Select unit</option>
            <option value="acre">Acre</option>
            <option value="hectare">Hectare</option>
            <option value="bigha">Bigha</option>
            <option value="katha">Katha</option>
            <option value="kanal">Kanal</option>
            <option value="marla">Marla</option>
            <option value="guntha">Guntha</option>
            <option value="cent">Cent</option>
          </select>
          {errors.landAreaUnit && (
            <p className="mt-1 text-sm text-error font-body">{errors.landAreaUnit}</p>
          )}
        </div>

        <div>
          <label htmlFor="primaryCrop" className="block text-sm font-body font-medium text-foreground mb-2">
            Primary Crop
          </label>
          <select
            id="primaryCrop"
            value={formData.primaryCrop}
            onChange={(e) => handleChange('primaryCrop', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.primaryCrop ? 'border-error' : 'border-input'
            }`}
            disabled={isLoading}
          >
            <option value="">Select crop</option>
            {cropTypes.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
          {errors.primaryCrop && (
            <p className="mt-1 text-sm text-error font-body">{errors.primaryCrop}</p>
          )}
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="pt-4 border-t border-input">
        <h4 className="text-md font-heading font-semibold text-foreground mb-3">Bank Details</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bankName" className="block text-sm font-body font-medium text-foreground mb-2">Bank Name</label>
            <input
              id="bankName"
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.bankName ? 'border-error' : 'border-input'
              }`}
              placeholder="e.g., State Bank of India"
              disabled={isLoading}
            />
            {errors.bankName && <p className="mt-1 text-sm text-error font-body">{errors.bankName}</p>}
          </div>

          <div>
            <label htmlFor="accountHolderName" className="block text-sm font-body font-medium text-foreground mb-2">Account Holder Name</label>
            <input
              id="accountHolderName"
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => handleChange('accountHolderName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.accountHolderName ? 'border-error' : 'border-input'
              }`}
              placeholder="Name as on bank account"
              disabled={isLoading}
            />
            {errors.accountHolderName && <p className="mt-1 text-sm text-error font-body">{errors.accountHolderName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="ifscCode" className="block text-sm font-body font-medium text-foreground mb-2">IFSC Code</label>
            <input
              id="ifscCode"
              type="text"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.ifscCode ? 'border-error' : 'border-input'
              }`}
              placeholder="AAAA0XXXXXX"
              disabled={isLoading}
            />
            {errors.ifscCode && <p className="mt-1 text-sm text-error font-body">{errors.ifscCode}</p>}
          </div>

          <div>
            <label htmlFor="accountType" className="block text-sm font-body font-medium text-foreground mb-2">Account Type</label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.accountType ? 'border-error' : 'border-input'
              }`}
              disabled={isLoading}
            >
              <option value="">Select type</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </select>
            {errors.accountType && <p className="mt-1 text-sm text-error font-body">{errors.accountType}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-body font-medium text-foreground mb-2">Account Number</label>
            <input
              id="accountNumber"
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.accountNumber ? 'border-error' : 'border-input'
              }`}
              placeholder="Enter account number"
              disabled={isLoading}
            />
            {errors.accountNumber && <p className="mt-1 text-sm text-error font-body">{errors.accountNumber}</p>}
          </div>

          <div>
            <label htmlFor="upiId" className="block text-sm font-body font-medium text-foreground mb-2">UPI ID</label>
            <input
              id="upiId"
              type="text"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                errors.upiId ? 'border-error' : 'border-input'
              }`}
              placeholder="e.g., name@bank"
              disabled={isLoading}
            />
            {errors.upiId && <p className="mt-1 text-sm text-error font-body">{errors.upiId}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="bankMobile" className="block text-sm font-body font-medium text-foreground mb-2">Bank Registered Mobile</label>
          <input
            id="bankMobile"
            type="tel"
            value={formData.bankMobile}
            onChange={(e) => handleChange('bankMobile', e.target.value.replace(/\D/g, ''))}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.bankMobile ? 'border-error' : 'border-input'
            }`}
            placeholder="10-digit mobile"
            disabled={isLoading}
          />
          {errors.bankMobile && <p className="mt-1 text-sm text-error font-body">{errors.bankMobile}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="aadhaarNumber" className="block text-sm font-body font-medium text-foreground mb-2">Aadhaar Number</label>
          <input
            id="aadhaarNumber"
            type="text"
            value={formData.aadhaarNumber}
            onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
              errors.aadhaarNumber ? 'border-error' : 'border-input'
            }`}
            placeholder="12-digit Aadhaar"
            disabled={isLoading}
          />
          {errors.aadhaarNumber && <p className="mt-1 text-sm text-error font-body">{errors.aadhaarNumber}</p>}
        </div>
      </div>

      <div>
        <label className="flex items-start space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => handleChange('termsAccepted', e.target.checked)}
            className="w-4 h-4 mt-1 text-primary border-input rounded focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm font-body text-text-secondary">
            I accept the{' '}
            <button type="button" className="text-primary hover:text-primary/80">
              Terms and Conditions
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary hover:text-primary/80">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="mt-1 text-sm text-error font-body">{errors.termsAccepted}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
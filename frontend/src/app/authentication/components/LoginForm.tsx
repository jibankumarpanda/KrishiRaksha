'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
}

interface LoginFormData {
  identifier: string;
  password: string;
}

interface FormErrors {
  identifier?: string;
  password?: string;
}

const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Mobile number or email is required';
    } else if (
      !/^[6-9]\d{9}$/.test(formData.identifier) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)
    ) {
      newErrors.identifier = 'Enter valid mobile number or email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="block text-sm font-body font-medium text-foreground mb-2">
          Mobile Number or Email
        </label>
        <input
          id="identifier"
          type="text"
          value={formData.identifier}
          onChange={(e) => handleChange('identifier', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg font-body text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
            errors.identifier ? 'border-error' : 'border-input'
          }`}
          placeholder="Enter mobile or email"
          disabled={isLoading}
        />
        {errors.identifier && (
          <p className="mt-1 text-sm text-error font-body">{errors.identifier}</p>
        )}
      </div>

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
            placeholder="Enter password"
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

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm font-body text-text-secondary">Remember me</span>
        </label>
        <button
          type="button"
          className="text-sm font-body text-primary hover:text-primary/80 transition-colors duration-150"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;

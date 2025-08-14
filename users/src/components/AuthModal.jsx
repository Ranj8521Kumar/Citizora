import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import apiService from '../services/api';

export function AuthModal({ mode, onLogin, onRegister, onClose, onSwitchMode }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation for all modes
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation only for login and register modes
    if (mode !== 'forgotPassword') {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    // Additional register-specific validations
    if (mode === 'register') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const response = await apiService.login(formData.email, formData.password);
        
        // Check if user has the required role (user)
        const userData = response.user;
        if (!userData || userData.role !== 'user') {
          throw new Error('Access denied. Only citizens can log in to this application.');
        }
        
        // Check if user is active
        if (userData.isActive === false || userData.active === false) {
          throw new Error('Your account has been deactivated. Please contact support for assistance.');
        }
        
        onLogin(response.user, response.token);
      } else if (mode === 'forgotPassword') {
        // Call the forgot password API
        await apiService.forgotPassword(formData.email);
        setResetEmailSent(true);
        // Clear errors if any
        setErrors({});
      } else {
        const response = await apiService.register(formData.firstName, formData.lastName, formData.email, formData.password);
        onRegister(response.user, response.token);
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'login' 
              ? 'Welcome Back' 
              : mode === 'register' 
                ? 'Join CivicConnect' 
                : 'Reset Your Password'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {mode !== 'forgotPassword' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {errors.general && (
            <p className="text-sm text-destructive text-center">{errors.general}</p>
          )}
          
          {mode === 'forgotPassword' && resetEmailSent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-center">
              Password reset instructions have been sent to your email.
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? 'Please wait...' 
              : mode === 'login' 
                ? 'Sign In' 
                : mode === 'register' 
                  ? 'Create Account' 
                  : 'Reset Password'}
          </Button>
        </form>

        <div className="relative my-4">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => onSwitchMode(mode === 'forgotPassword' ? 'login' : mode === 'login' ? 'register' : 'login')}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : mode === 'register'
                ? "Already have an account? Sign in"
                : "Back to login"
            }
          </button>
        </div>

        {mode === 'login' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => onSwitchMode('forgotPassword')}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
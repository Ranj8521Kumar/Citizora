import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

export function ResetPassword({ token, onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true); // Assume token is valid initially

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('Validating token:', token);
        // Skip token validation if on localhost (optional)
        if (window.location.hostname === 'localhost') {
          console.log('Development mode: Skipping token validation');
          return;
        }
        
        // Try to validate the token
        await apiService.validateResetToken(token);
      } catch (error) {
        console.error('Invalid or expired token:', error);
        setTokenValid(false);
        setError('This password reset link is invalid or has expired. Please request a new one.');
      }
    };
    
    if (token) {
      validateToken();
    } else {
      setTokenValid(false);
      setError('No reset token provided. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      console.log('Submitting password reset with token:', token);
      
      // Call API to reset password
      await apiService.resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        // Call the onComplete callback first
        if (onComplete) {
          onComplete();
        }
        
        // Force a complete URL change by directly setting location.href
        // This is more reliable than history.pushState for clearing URL parameters
        window.location.href = window.location.origin;
      }, 3000);
    } catch (error) {
      console.error('Failed to reset password:', error);
      
      // Extract meaningful error message from API response if possible
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.message) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          errorMessage = 'This password reset link is invalid or has expired. Please request a new one.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {!tokenValid ? 'Invalid Reset Link' : success ? 'Password Updated' : 'Reset Your Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}
          
          {success ? (
            <div className="bg-green-50 text-green-800 rounded-md p-3 flex items-start space-x-2">
              <Check className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Password reset successfully!</p>
                <p className="text-sm">You will be redirected to login shortly.</p>
              </div>
            </div>
          ) : tokenValid ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="pr-10"
                    required
                    disabled={isSubmitting}
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
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4">This password reset link is invalid or has expired.</p>
              <Button 
                onClick={() => onComplete('forgotPassword')} 
                variant="outline"
              >
                Request New Reset Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

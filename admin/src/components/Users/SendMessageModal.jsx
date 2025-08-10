import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Label } from '../ui/label.jsx';
import { Input } from '../ui/input.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Checkbox } from '../ui/checkbox.jsx';
import { Loader2, Send, CheckCircle, Mail } from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import apiService from '../../services/api.js';

export const SendMessageModal = ({ user, open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    sendEmail: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens with new user
  useEffect(() => {
    if (open) {
      setFormData({
        subject: '',
        message: '',
        sendEmail: false
      });
      setErrors({});
      setIsSuccess(false);
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    if (!user || (!user.id && !user._id)) {
      showToast({
        title: 'Error',
        message: 'User information is missing. Cannot send message.',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use our API service to send the message
      const userId = user.id || user._id;
      const result = await apiService.sendMessage(userId, {
        subject: formData.subject,
        message: formData.message,
        sendEmail: formData.sendEmail
      });
      
      console.log('Message sent successfully to:', user.name, result);
      
      // Show success state in the modal
      setIsSuccess(true);
      
      const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      
      showToast({
        title: 'Message Sent',
        message: result.data?.emailSent 
          ? `Your message has been sent to ${userName} and an email was delivered`
          : `Your message has been sent to ${userName} (no email sent)`,
        type: 'success'
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess({
          recipientId: user.id,
          subject: formData.subject,
          timestamp: new Date()
        });
      }
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        // Reset form data after successful submission
        setFormData({
          subject: '',
          message: ''
        });
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // Reset form when closing the modal
          setFormData({
            subject: '',
            message: '',
            sendEmail: false
          });
          setErrors({});
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'this user'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={user?.email || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '')}
              readOnly
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'border-red-500' : ''}
            />
            {errors.subject && (
              <p className="text-sm text-red-500">{errors.subject}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={errors.message ? 'border-red-500' : ''}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formData.message.length}/1000 characters</span>
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="sendEmail" 
              name="sendEmail"
              checked={formData.sendEmail}
              disabled={!user?.email}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  sendEmail: checked
                }));
              }}
            />
            <div className="flex items-center space-x-1.5">
              <Label htmlFor="sendEmail" className={`cursor-pointer ${!user?.email ? 'text-gray-400' : ''}`}>
                Also send as email 
              </Label>
              <Mail className={`h-4 w-4 ${!user?.email ? 'text-gray-400' : 'text-gray-500'}`} />
              {user?.email ? (
                <span className="text-xs text-gray-500">({user.email})</span>
              ) : (
                <span className="text-xs text-red-500">(No email available)</span>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

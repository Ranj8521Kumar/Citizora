import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { useToast } from '../ui/use-toast.jsx';
import { Loader2 } from 'lucide-react';
import apiService from '../../services/api.js';

export function EditReportModal({ isOpen, onClose, reportId, onReportUpdated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingReport, setFetchingReport] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    category: '',
    location: {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    }
  });
  
  // Fetch report data when modal opens
  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);
  
  const fetchReportDetails = async () => {
    try {
      setFetchingReport(true);
      setError(null);
      
      // Call API to get report details
      const response = await apiService.getReportDetails(reportId);
      const reportData = response.data?.report || response.report || response;
      
      // Set form data from report
      setReportData({
        title: reportData.title || '',
        description: reportData.description || '',
        status: reportData.status || '',
        priority: reportData.priority || '',
        category: reportData.category || '',
        location: {
          address: {
            street: reportData.location?.address?.street || '',
            city: reportData.location?.address?.city || '',
            state: reportData.location?.address?.state || '',
            zipCode: reportData.location?.address?.zipCode || ''
          }
        }
      });
      
      setFetchingReport(false);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details. Please try again.');
      setFetchingReport(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [name]: value
        }
      }
    }));
  };
  
  const handleStatusChange = (value) => {
    setReportData(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handlePriorityChange = (value) => {
    setReportData(prev => ({
      ...prev,
      priority: value
    }));
  };
  
  const handleCategoryChange = (value) => {
    setReportData(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Call API to update report with all fields
      const response = await apiService.updateReport(reportId, reportData);
      console.log('Report update response:', response);
      
      toast({
        title: 'Success',
        description: 'Report updated successfully',
        variant: 'success',
      });
      
      // Notify parent component that the report was updated
      if (onReportUpdated) {
        onReportUpdated(response.data?.report || response.report || response);
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Failed to update report. Please try again.');
      
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive',
      });
      
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>
            Update the report details and click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {fetchingReport ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading report details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input 
                id="title"
                name="title"
                value={reportData.title}
                onChange={handleInputChange}
                placeholder="Enter report title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={reportData.description}
                onChange={handleInputChange}
                placeholder="Enter report description"
                rows={5}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={reportData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={reportData.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={reportData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road_damage">Road Damage</SelectItem>
                    <SelectItem value="streetlight">Street Light</SelectItem>
                    <SelectItem value="graffiti">Graffiti</SelectItem>
                    <SelectItem value="trash">Trash/Debris</SelectItem>
                    <SelectItem value="water_issue">Water Issue</SelectItem>
                    <SelectItem value="sewer">Sewer Problem</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="street" className="text-xs">Street</Label>
                  <Input 
                    id="street"
                    name="street"
                    value={reportData.location.address.street}
                    onChange={handleAddressChange}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    value={reportData.location.address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs">State</Label>
                  <Input 
                    id="state"
                    name="state"
                    value={reportData.location.address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="zipCode" className="text-xs">Zip Code</Label>
                  <Input 
                    id="zipCode"
                    name="zipCode"
                    value={reportData.location.address.zipCode}
                    onChange={handleAddressChange}
                    placeholder="Zip Code"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

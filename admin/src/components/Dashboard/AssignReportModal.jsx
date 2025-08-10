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
import { Label } from '../ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { useToast } from '../ui/use-toast.jsx';
import { Loader2, Search } from 'lucide-react';
import apiService from '../../services/api.js';

export function AssignReportModal({ isOpen, onClose, reportId, onReportAssigned }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  
  // Fetch field workers when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset states and fetch field workers when modal opens
      setLoading(false);
      setError(null);
      setSelectedWorkerId('');
      setComment('');
      fetchFieldWorkers();
    }
  }, [isOpen]);
  
  const fetchFieldWorkers = async () => {
    try {
      setLoadingWorkers(true);
      setError(null);
      
      // Call API to get field workers
      const response = await apiService.getAllUsers({ role: 'employee', isActive: true });
      
      // Extract field workers from response
      const workers = response.users || [];
      
      if (workers.length === 0) {
        setError('No active field workers found.');
      }
      
      setFieldWorkers(workers);
    } catch (err) {
      console.error('Error fetching field workers:', err);
      setError('Failed to load field workers. Please try again.');
    } finally {
      setLoadingWorkers(false); // Always set loading workers to false when done
    }
  };
  
  const handleWorkerChange = (value) => {
    setSelectedWorkerId(value);
  };
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWorkerId) {
      setError('Please select a field worker.');
      return;
    }
    
    try {
      setLoading(true); // Set loading state to true at the start of submission
      
      // Call API to assign report
      const response = await apiService.assignReport(reportId, {
        employeeId: selectedWorkerId, // Changed from assigneeId to employeeId to match backend expectation
        comment: comment.trim() ? comment : undefined
      });
      
      console.log('Assignment successful, API response:', response);
      
      toast({
        title: 'Success',
        description: 'Report assigned successfully',
        variant: 'success',
      });
      
      // Notify parent component that the report was assigned
      if (onReportAssigned) {
        // Check for the report data in different possible response formats
        let updatedReport = response.data?.report || response.report || response;
        
        // Find the selected field worker to include name information
        const selectedWorker = fieldWorkers.find(worker => worker._id === selectedWorkerId);
        
        // Make sure the assignedTo field has the complete worker information
        if (selectedWorker && updatedReport) {
          updatedReport = {
            ...updatedReport,
            assignedTo: {
              _id: selectedWorkerId,
              firstName: selectedWorker.firstName,
              lastName: selectedWorker.lastName
            }
          };
        }
        
        console.log('Passing updated report to parent with worker details:', updatedReport);
        onReportAssigned(updatedReport);
      }
      
      // Reset state and close modal
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Error assigning report:', err);
      
      // Get the error message from the response if available
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign report. Please try again.';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // Always reset loading state, whether successful or not
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      // Reset loading state when closing the modal
      if (loading) {
        setLoading(false);
      }
      onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Report</DialogTitle>
          <DialogDescription>
            Select a field worker to assign to this report.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="worker">Assign to Field Worker</Label>
            {loadingWorkers ? (
              <div className="flex items-center space-x-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading field workers...</span>
              </div>
            ) : (
              <Select value={selectedWorkerId} onValueChange={handleWorkerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a field worker" />
                </SelectTrigger>
                <SelectContent>
                  {fieldWorkers.length === 0 ? (
                    <div className="flex items-center justify-center py-2">
                      <span className="text-sm text-gray-500">No field workers available</span>
                    </div>
                  ) : (
                    fieldWorkers.map((worker) => (
                      <SelectItem key={worker._id} value={worker._id}>
                        {worker.firstName} {worker.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Assignment Note (Optional)</Label>
            <Textarea 
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Add any notes or instructions for the field worker"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setLoading(false); // Reset loading state when cancelling
                onClose();
              }} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || loadingWorkers || fieldWorkers.length === 0 || !selectedWorkerId}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

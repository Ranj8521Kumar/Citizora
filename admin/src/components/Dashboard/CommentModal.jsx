import React, { useState } from 'react';
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
import { Textarea } from '../ui/textarea.jsx';
import { useToast } from '../ui/use-toast.jsx';
import { Loader2 } from 'lucide-react';
import apiService from '../../services/api.js';

export function CommentModal({ isOpen, onClose, reportId, onCommentAdded }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please enter a comment.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Adding comment to report:', reportId, 'with text:', comment.trim());
      
      // Call API to add comment
      const response = await apiService.addReportComment(reportId, {
        text: comment.trim()
      });
      
      console.log('Comment added successfully, API response:', response);
      
      toast({
        title: 'Success',
        description: 'Comment added successfully',
        variant: 'success',
      });
      
      // Notify parent component that the comment was added
      if (onCommentAdded) {
        const commentData = response.data?.comment || response.comment || response;
        console.log('Passing comment data to parent:', commentData);
        onCommentAdded(commentData);
      }
      
      setComment('');
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Error adding comment:', err);
      
      // Get a more user-friendly error message
      let errorMessage = 'Failed to add comment. Please try again.';
      
      if (err.message && err.message.includes('validation failed')) {
        errorMessage = 'There was an issue with the comment format. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      // Reset state when closing the modal
      if (loading) {
        setLoading(false);
      }
      setError(null);
      onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Add a comment to the report. This will be visible to field workers and other administrators.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea 
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Enter your comment here"
              rows={5}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !comment.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Comment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

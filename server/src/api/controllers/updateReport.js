const Report = require('../models/report.model');
const Notification = require('../models/notification.model');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Update a report (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.updateReport = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const { title, description, category, priority, status, location } = req.body;
    
    // Log the update request
    console.log(`Updating report ${reportId}:`, req.body);
    
    // Validate that report exists
    const report = await Report.findById(reportId);
    if (!report) {
      return next(new ApiError('Report not found', 404));
    }
    
    // Only admins can perform full report updates
    if (req.user.role !== 'admin') {
      return next(new ApiError('Only administrators can update report details', 403));
    }
    
    // Update report fields if provided
    if (title) report.title = title;
    if (description) report.description = description;
    if (category) report.category = category;
    if (priority) report.priority = priority;
    
    // Handle location updates if provided
    if (location) {
      if (location.address) {
        report.location.address = {
          ...report.location.address,
          ...location.address
        };
      }
      
      if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        report.location.coordinates = location.coordinates;
      }
    }
    
    // Handle status change with timeline event if status is provided
    if (status && status !== report.status) {
      const comment = `Status updated to ${status} by admin during report edit`;
      await report.addTimelineEvent(status, comment, req.user._id);
      report.status = status;
      
      // If changing to resolved, add resolved time
      if (status === 'resolved' && !report.resolvedAt) {
        report.resolvedAt = new Date();
      }
    }
    
    // Save the updated report
    const updatedReport = await report.save();
    
    // Create a notification for the reporter
    if (updatedReport.reportedBy) {
      await Notification.createNotification({
        recipient: updatedReport.reportedBy,
        type: 'report_updated',
        title: `Report Updated: ${updatedReport.title}`,
        message: `Your report has been updated by an administrator`,
        relatedTo: {
          model: 'Report',
          id: updatedReport._id
        }
      });
    }
    
    // Create a notification for assigned employee
    if (updatedReport.assignedTo) {
      await Notification.createNotification({
        recipient: updatedReport.assignedTo,
        type: 'report_updated',
        title: `Report Updated: ${updatedReport.title}`,
        message: `A report assigned to you has been updated by an administrator`,
        relatedTo: {
          model: 'Report',
          id: updatedReport._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    console.error('Error updating report:', error);
    next(error);
  }
};

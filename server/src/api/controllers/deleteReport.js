/**
 * Delete Report Controller
 * Handles deletion of individual reports
 */

const mongoose = require('mongoose');
const Report = require('../models/report.model');
const Notification = require('../models/notification.model');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Delete a report
 * This is a soft delete that changes the status to 'closed'
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || { reason: 'Report deleted by administrator' };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError('Invalid report ID', 400));
    }

    // Find report
    const report = await Report.findById(id);

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Soft delete by updating to closed status
    await report.addTimelineEvent(
      'closed',
      reason || 'Report deleted by administrator',
      req.user._id
    );

    // Create notification for report submitter
    await Notification.create({
      recipient: report.submittedBy,
      type: 'report_status',
      title: 'Report Closed',
      message: `Your report "${report.title}" has been closed. ${reason ? 'Reason: ' + reason : ''}`,
      relatedTo: {
        model: 'Report',
        id: report._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report successfully deleted',
      data: {
        reportId: report._id
      }
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    next(new ApiError('Failed to delete report', 500));
  }
};

module.exports = { deleteReport };

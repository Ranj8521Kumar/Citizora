const Report = require('../models/report.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const Notification = require('../models/notification.model');

/**
 * Add comment to a report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.addReportComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { id: reportId } = req.params;

    if (!text || !text.trim()) {
      return next(new ApiError('Comment text is required', 400));
    }

    const report = await Report.findById(reportId).populate('assignedTo submittedBy');

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Add comment to the report timeline
    const timelineEvent = await report.addTimelineEvent('comment', text, req.user._id);
    
    // If the report is assigned to someone, notify them about the new comment
    if (report.assignedTo && report.assignedTo._id.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: report.assignedTo._id,
        type: 'comment',
        title: 'New Comment on Report',
        message: `${req.user.firstName} ${req.user.lastName} commented on a report: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        relatedTo: {
          model: 'Report',
          id: report._id
        },
        priority: report.priority === 'critical' ? 'high' : 'normal'
      });
    }
    
    // If the comment is not by the submitter, notify the submitter
    if (report.submittedBy && report.submittedBy._id.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: report.submittedBy._id,
        type: 'comment',
        title: 'New Comment on Your Report',
        message: `${req.user.firstName} ${req.user.lastName} commented on your report: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        relatedTo: {
          model: 'Report',
          id: report._id
        },
        priority: report.priority === 'critical' ? 'high' : 'normal'
      });
    }

    // Return the comment
    const comment = {
      _id: timelineEvent._id,
      text,
      createdAt: timelineEvent.timestamp,
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role
      }
    };

    res.status(201).json({
      success: true,
      data: {
        comment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getReportComments = async (req, res, next) => {
  try {
    const { id: reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate({
        path: 'timeline.user',
        select: 'firstName lastName role'
      });

    if (!report) {
      return next(new ApiError('Report not found', 404));
    }

    // Filter timeline events to only include comments
    const comments = report.timeline
      .filter(event => event.type === 'comment')
      .map(event => ({
        _id: event._id,
        text: event.description,
        createdAt: event.timestamp,
        user: event.user ? {
          _id: event.user._id,
          firstName: event.user.firstName,
          lastName: event.user.lastName,
          role: event.user.role
        } : {
          _id: 'system',
          firstName: 'System',
          lastName: '',
          role: 'system'
        }
      }));

    res.status(200).json({
      success: true,
      data: {
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

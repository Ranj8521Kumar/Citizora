/**
 * Report Model
 * Defines the schema for reports submitted by users
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Report category is required'],
    enum: ['road_issue', 'water_issue', 'electricity_issue', 'waste_management', 'public_safety', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  timeline: [{
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for geospatial queries
reportSchema.index({ 'location.coordinates': '2dsphere' });

// Method to add a timeline event
reportSchema.methods.addTimelineEvent = function(status, comment, userId) {
  this.timeline.push({
    status,
    comment,
    updatedBy: userId,
    timestamp: new Date()
  });
  this.status = status;
  return this.save();
};

// Create and export the Report model
const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

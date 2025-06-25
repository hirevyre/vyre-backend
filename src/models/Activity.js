const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'viewed', 'status_change', 'other'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['job', 'candidate', 'interview', 'report', 'user', 'company', 'settings'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for faster queries
ActivitySchema.index({ user: 1, createdAt: -1 });
ActivitySchema.index({ companyId: 1, createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1 });

// Static method to log activity
ActivitySchema.statics.logActivity = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent affecting main operation
    return null;
  }
};

module.exports = mongoose.model('Activity', ActivitySchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['request', 'accepted', 'rejected', 'general'],
      default: 'general',
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    start_time: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    end_time: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'cancelled'],
      default: 'active',
    },
    category: {
      type: String,
      default: 'general',
    },
    picture: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

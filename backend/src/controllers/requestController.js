const Request = require('../models/Request');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const AcceptedTask = require('../models/AcceptedTask');

// @desc   Send a request for a task
// @route  POST /api/requests
const sendRequest = async (req, res) => {
  try {
    const { task_id, message } = req.body;

    const task = await Task.findById(task_id).populate('user_id', 'first_name last_name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.user_id._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own task.' });
    }

    const existing = await Request.findOne({ task_id, requester_id: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already sent a request for this task.' });
    }

    const request = await Request.create({
      task_id,
      requester_id: req.user._id,
      message: message || '',
    });

    // Create notification for task owner
    await Notification.create({
      user_id: task.user_id._id,
      body: `${req.user.first_name} ${req.user.last_name} requested to help with your task: "${task.title}"`,
      type: 'request',
      reference_id: request._id,
    });

    res.status(201).json({ success: true, message: 'Request sent successfully.', request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already sent a request for this task.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get requests received (for task owners)
// @route  GET /api/requests/received
const getReceivedRequests = async (req, res) => {
  try {
    // Get all tasks by current user
    const myTasks = await Task.find({ user_id: req.user._id }).select('_id');
    const taskIds = myTasks.map((t) => t._id);

    const requests = await Request.find({ task_id: { $in: taskIds } })
      .populate('requester_id', 'first_name last_name profile_picture email_id')
      .populate('task_id', 'title category location start_time')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my sent requests
// @route  GET /api/requests/my-requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester_id: req.user._id })
      .populate('task_id', 'title category location start_time picture user_id')
      .populate({
        path: 'task_id',
        populate: { path: 'user_id', select: 'first_name last_name profile_picture' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Accept a request
// @route  PUT /api/requests/:id/accept
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('task_id')
      .populate('requester_id', 'first_name last_name');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    // Verify ownership
    if (request.task_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    request.status = 'accepted';
    await request.save();

    // Update task status
    await Task.findByIdAndUpdate(request.task_id._id, { status: 'in_progress' });

    // Create AcceptedTask record
    await AcceptedTask.findOneAndUpdate(
      { user_id: request.requester_id._id, task_id: request.task_id._id },
      { user_id: request.requester_id._id, task_id: request.task_id._id, status: 'accepted' },
      { upsert: true, new: true }
    );

    // Notify the helper
    await Notification.create({
      user_id: request.requester_id._id,
      body: `Your request for "${request.task_id.title}" has been accepted! 🎉`,
      type: 'accepted',
      reference_id: request._id,
    });

    res.status(200).json({ success: true, message: 'Request accepted.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Reject a request
// @route  PUT /api/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('task_id')
      .populate('requester_id', 'first_name last_name');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.task_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    request.status = 'rejected';
    await request.save();

    // Notify the helper
    await Notification.create({
      user_id: request.requester_id._id,
      body: `Your request for "${request.task_id.title}" was not accepted this time.`,
      type: 'rejected',
      reference_id: request._id,
    });

    res.status(200).json({ success: true, message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendRequest, getReceivedRequests, getMyRequests, acceptRequest, rejectRequest };

const Task = require('../models/Task');
const Request = require('../models/Request');
const path = require('path');

// @desc   Create task
// @route  POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, location, start_time, end_time, category } = req.body;

    if (!title || !description || !location || !start_time) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const picture = req.file
      ? `/uploads/${req.file.filename}`
      : '';

    const task = await Task.create({
      user_id: req.user._id,
      title,
      description,
      location,
      start_time,
      end_time: end_time || null,
      category: category || 'general',
      picture,
    });

    await task.populate('user_id', 'first_name last_name profile_picture');

    res.status(201).json({ success: true, message: 'Task created successfully.', task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all tasks (feed - excludes own tasks)
// @route  GET /api/tasks/feed
const getFeedTasks = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {
      user_id: { $ne: req.user._id },
      status: 'active',
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const tasks = await Task.find(filter)
      .populate('user_id', 'first_name last_name profile_picture')
      .sort({ createdAt: -1 });

    // Add requester status for each task
    const tasksWithStatus = await Promise.all(
      tasks.map(async (task) => {
        const request = await Request.findOne({
          task_id: task._id,
          requester_id: req.user._id,
        });
        return {
          ...task.toObject(),
          myRequestStatus: request ? request.status : null,
          myRequestId: request ? request._id : null,
        };
      })
    );

    res.status(200).json({ success: true, tasks: tasksWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my tasks
// @route  GET /api/tasks/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { user_id: req.user._id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('user_id', 'first_name last_name profile_picture')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single task
// @route  GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'user_id',
      'first_name last_name profile_picture email_id'
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update task
// @route  PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task.' });
    }

    const updates = { ...req.body };
    if (req.file) updates.picture = `/uploads/${req.file.filename}`;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(
      'user_id',
      'first_name last_name profile_picture'
    );

    res.status(200).json({ success: true, message: 'Task updated.', task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete task
// @route  DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (task.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    await Request.deleteMany({ task_id: req.params.id });

    res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTask, getFeedTasks, getMyTasks, getTask, updateTask, deleteTask };

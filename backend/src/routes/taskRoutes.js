const express = require('express');
const router = express.Router();
const {
  createTask,
  getFeedTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/feed', getFeedTasks);
router.get('/my-tasks', getMyTasks);
router.post('/', upload.single('picture'), createTask);
router.get('/:id', getTask);
router.put('/:id', upload.single('picture'), updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

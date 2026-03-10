const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getReceivedRequests,
  getMyRequests,
  acceptRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendRequest);
router.get('/received', getReceivedRequests);
router.get('/my-requests', getMyRequests);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;

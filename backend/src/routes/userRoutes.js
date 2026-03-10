const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, removeProfilePicture } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.put('/profile', upload.single('profile_picture'), updateProfile);
router.put('/change-password', changePassword);
router.put('/remove-picture', removeProfilePicture);

module.exports = router;

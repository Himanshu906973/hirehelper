const User = require('../models/User');

// @desc   Update profile
// @route  PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, bio } = req.body;

    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (bio !== undefined) updates.bio = bio;
    if (req.file) updates.profile_picture = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Change password
// @route  PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Remove profile picture
// @route  PUT /api/users/remove-picture
const removeProfilePicture = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { profile_picture: '' });
    res.status(200).json({ success: true, message: 'Profile picture removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProfile, changePassword, removeProfilePicture };

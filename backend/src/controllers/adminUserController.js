const User = require('../models/User');

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const pageSize = 5; // As requested
    const page = Number(req.query.pageNumber) || 1;
    const category = req.query.category;

    const query = { role: { $ne: 'admin' } }; // Exclude admin users
    if (category && category !== 'All') {
      query.interestedCategories = category;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .select('-password'); // Exclude passwords from the result

    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (user) {
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.college !== undefined) user.college = req.body.college;
      if (req.body.state !== undefined) user.state = req.body.state;
      if (req.body.mobile !== undefined) user.mobile = req.body.mobile;
      if (req.body.interestedCategories !== undefined) user.interestedCategories = req.body.interestedCategories;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        state: updatedUser.state,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        interestedCategories: updatedUser.interestedCategories,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (user) {
      // Add any pre-deletion logic here.
      // For example, prevent deleting the main admin account.
      if (user.role === 'admin') {
         // A simple check to prevent deleting other admins.
         // You could have more robust logic, e.g., based on a specific email.
         return res.status(400).json({ message: 'Cannot delete admin users.' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

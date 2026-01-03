const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminUserController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes in this file are protected and admin-only
router.use(protect, authorize('admin'));

router.route('/')
  .get(getAllUsers);

router.route('/:userId')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;

const express = require('express');
const { loginUser, registerUser, getUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.put('/role', protect, updateUserRole);
router.get('/', protect, getUsers);

module.exports = router;

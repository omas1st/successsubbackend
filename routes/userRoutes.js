const express = require('express');
const { registerUser, getAllUsers } = require('../controllers/userController');

const router = express.Router();

// Matches your React form POST to /api/subscribe
router.post('/subscribe', registerUser);

// Optional: view all subscriptions
router.get('/subscribe', getAllUsers);

module.exports = router;

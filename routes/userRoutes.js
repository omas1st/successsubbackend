const express = require('express');
const { registerUser, getAllUsers } = require('../controllers/userController');

const router = express.Router();

// Frontend does: POST /api/subscribe
router.post('/subscribe', registerUser);

// Optional: GET /api/subscribe to list all
router.get('/subscribe', getAllUsers);

module.exports = router;

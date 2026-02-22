const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateShortlist } = require('../controllers/recruit.controller');

// Generate AI Shortlist & Download PDF
router.post('/shortlist', protect, generateShortlist);

module.exports = router;

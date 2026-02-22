const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOpportunity, getOpportunities, applyForOpportunity, getMyOpportunities } = require('../controllers/opportunity.controller');

// Create a new post / opportunity (Must be logged in as recruiter)
router.post('/', protect, createOpportunity);

// Get all opportunities (Need to be logged in to view feed)
router.get('/', protect, getOpportunities);

// Get recruiter's own opportunities
router.get('/me', protect, getMyOpportunities);

// Apply for an opportunity
router.post('/:id/apply', protect, applyForOpportunity);

module.exports = router;

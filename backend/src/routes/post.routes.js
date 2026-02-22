const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { uploadVideo, getFeed, getUserPosts } = require('../controllers/post.controller');

// Configure Multer to temporarily save incoming files into an 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// Route to upload a video (Protected: Only Athletes allowed)
// The frontend MUST send the file in a FormData field named 'video'
router.post('/videos/upload', protect, authorizeRole('athlete'), upload.single('video'), uploadVideo);

// Route to get the feed (Protected: Anyone logged in can view)
router.get('/videos/feed', protect, getFeed);

// Route to get logged-in athlete's own posts
router.get('/videos/my-posts', protect, getUserPosts);

module.exports = router;

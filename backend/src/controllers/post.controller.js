const Post = require('../models/post.model');
const fs = require('fs');
const ImageKit = require('imagekit'); // The Node.js SDK
const { GoogleGenAI, createUserContent, createPartFromUri } = require('@google/genai');
const { recalculateScoutScore } = require('../utils/scoringEngine');

// 1. Initialize ImageKit (Backend Configuration)
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// 2. Initialize Gemini (New Unified SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Upload video, get AI metrics, and save to feed
// @route   POST /api/videos/upload
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file provided' });
        }

        const filePath = req.file.path;

        // 3. Upload to ImageKit (Node.js SDK method)
        // We use createReadStream to safely handle potentially large video files
        const imageKitResponse = await imagekit.upload({
            file: fs.createReadStream(filePath),
            fileName: `athlete_video_${Date.now()}_${req.file.originalname}`,
            folder: '/hackathon_videos'
        });
        const videoUrl = imageKitResponse.url;

        // 4. Upload to Gemini using the new Files API
        const myfile = await ai.files.upload({
            file: filePath,
            config: { mimeType: req.file.mimetype }
        });

        // 5. Polling: Wait for Google's servers to process the video
        let getFile = await ai.files.get({ name: myfile.name });

        while (getFile.state === 'PROCESSING') {
            console.log('Video is processing by Gemini, retrying in 3 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 3000));
            getFile = await ai.files.get({ name: myfile.name });
        }

        if (getFile.state === 'FAILED') {
            throw new Error("Gemini AI failed to process the video.");
        }

        // ... (Previous code: video uploads to ImageKit and Gemini, and polling finishes)

        // 6. Define the expected JSON keys based on the Athlete's profile
        // 6. Define the expected JSON keys based on the Athlete's profile
        const { sport, playerRole, subRole, style } = req.user;
        let expectedMetrics = "";

        if (sport === 'Cricket') {
            if (playerRole === 'Batsman' || playerRole === 'All-Rounder') {
                expectedMetrics = "'footwork_score' (Number 1-10), 'timing_score' (Number 1-10), 'shot_selection' (Number 1-10), 'signature_shot' (String)";
            } else if (playerRole === 'Bowler') {
                expectedMetrics = "'run_up_balance' (Number 1-10), 'release_point_score' (Number 1-10), 'line_and_length_rating' (Number 1-10), 'stock_delivery' (String)";
            }
        } else if (sport === 'Badminton') {
            expectedMetrics = "'court_coverage' (Number 1-10), 'smash_power' (Number 1-10), 'reflex_speed' (Number 1-10), 'dominant_stroke' (String)";
        } else if (sport === 'Football') {
            expectedMetrics = "'ball_control' (Number 1-10), 'agility_score' (Number 1-10), 'passing_accuracy' (Number 1-10), 'play_style' (String)";
        } else {
            // A generic fallback just in case
            expectedMetrics = "'athleticism_score' (Number 1-10), 'technique_rating' (Number 1-10), 'game_awareness' (Number 1-10), 'primary_strength' (String)";
        }

        // 7. The Magic Dynamic Prompt
        const prompt = `You are an elite sports scout analyzing a video of a grassroots athlete.
        
        ATHLETE PROFILE:
        - Sport: ${sport || 'Unknown'}
        - Role: ${playerRole || 'General Athlete'}
        - Position/Sub-Role: ${subRole || 'N/A'}
        - Playing Style: ${style || 'N/A'}

        INSTRUCTIONS:
        Watch the video and evaluate this athlete specifically through the lens of their profile (e.g., if they are a Wrist Spin Bowler, look for flight and turn; if an Aggressive Batsman, look for bat speed).

        Extract the following specific metrics: 
        ${expectedMetrics}
        And provide a 'scout_summary' (max 20 words highlighting their potential).

        CRITICAL REQUIREMENT: Return ONLY a valid JSON object with those exact keys. All metric scores MUST be raw numerical values (e.g., 8.5) and NOT strings. Do not include text like "/10". No markdown, no conversational text, no extra properties.`;

        // 8. Generate Content using the cutting-edge model
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: createUserContent([
                createPartFromUri(myfile.uri, myfile.mimeType),
                prompt
            ]),
        });

        // 9. Parse the AI Response 
        const responseText = response.text;
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiMetrics = JSON.parse(cleanJson);

        // ... (Continue to Step 10: Saving to MongoDB)

        // 10. Save the final "Stat Card" to MongoDB
        const post = await Post.create({
            athleteId: req.user._id, // Secured by your Auth Middleware
            videoUrl: videoUrl,
            aiMetrics: aiMetrics,
            scoutSummary: aiMetrics.scout_summary || aiMetrics.scoutSummary
        });

        // Trigger score recalculation in the background asynchronously 
        recalculateScoutScore(req.user._id);

        // 11. Delete the temporary file from your local Node server
        fs.unlinkSync(filePath);

        // Send the completed object back to the frontend
        res.status(201).json(post);

    } catch (error) {
        console.error("Video Pipeline Error:", error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error during video processing', error: error.message });
    }
};

// @desc    Get all verified videos for the main feed
// @route   GET /api/videos/feed
exports.getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('athleteId', 'name location sport playerRole subRole style bio')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
};

// @desc    Get logged-in athlete's own posts
// @route   GET /api/videos/my-posts
exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ athleteId: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching your posts' });
    }
};

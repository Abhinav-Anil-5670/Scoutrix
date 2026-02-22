const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/user.model');
const Post = require('./src/models/post.model');
const { recalculateScoutScore } = require('./src/utils/scoringEngine');

const fixScores = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const athletes = await User.find({ role: 'athlete' });
        console.log(`Found ${athletes.length} athletes. Recalculating scores...`);

        for (const athlete of athletes) {
            await recalculateScoutScore(athlete._id);
        }

        console.log("Done updating all athletes!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixScores();

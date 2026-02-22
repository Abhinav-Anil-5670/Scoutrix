const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/user.model');

const mockScores = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const athletes = await User.find({ role: 'athlete' });
        console.log(`Found ${athletes.length} athletes. Checking for missing scores...`);

        let updated = 0;
        for (const athlete of athletes) {
            // If the athlete has no sportScore, generate a realistic mock score
            if (!athlete.sportScore || athlete.sportScore === 0) {
                // Generate a random SPI between 650 and 950
                const randomSpi = Math.floor(Math.random() * 300) + 650;

                // MetaScore is usually SPI + Activity + Validation
                const randomMeta = Math.min(1000, randomSpi + Math.floor(Math.random() * 100));

                athlete.sportScore = randomSpi;
                athlete.metaScore = randomMeta;

                // Add some realistic subScores
                athlete.subScores = {
                    power_rating: Math.floor(Math.random() * 30) + 70,
                    agility_score: Math.floor(Math.random() * 30) + 70,
                    stamina_rating: Math.floor(Math.random() * 30) + 70
                };

                await athlete.save();
                console.log(`✅ Assigned mock scores to ${athlete.name}: SPI(${randomSpi}), Meta(${randomMeta})`);
                updated++;
            } else {
                console.log(`⏭️ ${athlete.name} already has SPI: ${athlete.sportScore}`);
            }
        }

        console.log(`\nDone! Updated ${updated} profiles with baseline SPI scores.`);
        process.exit(0);
    } catch (err) {
        console.error("Error setting mock scores:", err);
        process.exit(1);
    }
};

mockScores();

const User = require('../models/user.model');
const Post = require('../models/post.model');

// @desc    Recalculate an athlete's complete Scoutrix Score profile
// @param   {String} athleteId - The MongoDB ID of the athlete
exports.recalculateScoutScore = async (athleteId) => {
    try {
        const athlete = await User.findById(athleteId);
        if (!athlete || athlete.role !== 'athlete') return;

        // Fetch the athlete's 5 most recent posts for the rolling average
        const recentPosts = await Post.find({ athleteId })
            .sort({ createdAt: -1 })
            .limit(5);

        const totalVideos = await Post.countDocuments({ athleteId });

        // ==========================================
        // PILLAR 1: ACTIVITY & CONSISTENCY (Max 200)
        // ==========================================
        let activityScore = 0;

        // Profile Completeness (+50)
        if (athlete.bio && athlete.height && athlete.weight) {
            activityScore += 50;
        }

        // Consistency Threshold (+50)
        if (totalVideos >= 3) {
            activityScore += 50;
        }

        // Freshness: Did they post recently? (+100)
        if (recentPosts.length > 0) {
            const daysSinceLastPost = (Date.now() - new Date(recentPosts[0].createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPost <= 14) {
                activityScore += 100;
            } else if (daysSinceLastPost <= 30) {
                activityScore += 50; // Partial credit if within a month
            }
        }

        // ==========================================
        // PILLAR 2: RECRUITER VALIDATION (Max 300)
        // ==========================================
        // Count how many recruiters have this athlete in their savedPlayers array
        const savesCount = await User.countDocuments({
            role: 'recruiter',
            savedPlayers: athleteId
        });

        // 50 points per recruiter save, capped at 300 maximum
        const validationScore = Math.min(savesCount * 50, 300);

        // ==========================================
        // PILLAR 3: AI PERFORMANCE (Max 500 mapped from 1000)
        // ==========================================
        let subScores = {};
        let rawSportScore = 0;

        if (recentPosts.length > 0) {
            // 1. Aggregate the numerical metrics from the AI across recent posts
            const metricSums = {};
            const metricCounts = {};

            recentPosts.forEach(post => {
                if (!post.aiMetrics) return;

                // Loop through keys like 'timing_score', 'footwork_score'
                Object.keys(post.aiMetrics).forEach(key => {
                    const value = post.aiMetrics[key];
                    // Only process actual numbers (ignore strings like 'signature_shot')
                    if (typeof value === 'number') {
                        if (!metricSums[key]) {
                            metricSums[key] = 0;
                            metricCounts[key] = 0;
                        }
                        metricSums[key] += value;
                        metricCounts[key] += 1;
                    }
                });
            });

            // 2. Calculate average SubScores (mapped to 0-1000 scale)
            let totalAveragedMetrics = 0;
            let metricTypesCount = 0;

            Object.keys(metricSums).forEach(key => {
                // Average the 1-10 score, then multiply by 100
                const averageScore = (metricSums[key] / metricCounts[key]) * 100;
                subScores[key] = Math.round(averageScore);

                totalAveragedMetrics += averageScore;
                metricTypesCount += 1;
            });

            // 3. Calculate Raw Sport Score (Average of all subscores)
            if (metricTypesCount > 0) {
                rawSportScore = totalAveragedMetrics / metricTypesCount;
            }
        }

        // 4. APPLY THE CONFIDENCE MULTIPLIER!
        let confidenceMultiplier = 0.80; // Default for 1 video
        if (totalVideos === 2) confidenceMultiplier = 0.90;
        if (totalVideos >= 3) confidenceMultiplier = 1.00;

        const sportScore = Math.round(rawSportScore * confidenceMultiplier);

        // ==========================================
        // FINAL: THE METASCORE CALCULATION
        // ==========================================
        // AI is worth 50% of the total rating
        const aiWeightedScore = sportScore * 0.50;

        const metaScore = Math.round(aiWeightedScore + validationScore + activityScore);

        const currentHistory = athlete.scoutScore?.history || [];

        if (currentHistory.length === 0 || currentHistory[currentHistory.length - 1].score !== metaScore) {
            currentHistory.push({
                score: metaScore,
                date: new Date()
            });
        }

        // Save everything back to the Athlete's profile
        athlete.metaScore = metaScore;
        athlete.sportScore = sportScore;
        athlete.subScores = subScores;

        await athlete.save();
        console.log(`Successfully updated Scoutrix Score for ${athlete.name}: Meta(${metaScore})`);

    } catch (error) {
        console.error("Error recalculating Scoutrix Score:", error);
    }
};
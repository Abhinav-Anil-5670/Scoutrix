const Opportunity = require('../models/opportunity.model');

// @desc    Create a new opportunity (Recruiter only)
// @route   POST /api/opportunities
exports.createOpportunity = async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can post opportunities' });
        }

        const { title, sport, role, location, date, description } = req.body;

        const opportunity = await Opportunity.create({
            recruiterId: req.user._id,
            title,
            sport,
            role,
            location,
            date,
            description
        });

        res.status(201).json(opportunity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating opportunity' });
    }
};

// @desc    Get all opportunities (Public feed)
// @route   GET /api/opportunities
exports.getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find()
            .populate('recruiterId', 'name organization')
            .sort({ createdAt: -1 });
        res.status(200).json(opportunities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching opportunities' });
    }
};

// @desc    Get opportunities created by logged-in recruiter (Includes applicants)
// @route   GET /api/opportunities/me
exports.getMyOpportunities = async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can view their opportunities' });
        }

        const opportunities = await Opportunity.find({ recruiterId: req.user._id })
            .populate('applicants', 'name email location sport playerRole subRole style metaScore sportScore profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json(opportunities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching your opportunities' });
    }
};

// @desc    Apply for an opportunity (Athlete only)
// @route   POST /api/opportunities/:id/apply
exports.applyForOpportunity = async (req, res) => {
    try {
        if (req.user.role !== 'athlete') {
            return res.status(403).json({ message: 'Only athletes can apply for opportunities' });
        }

        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if already applied
        if (opportunity.applicants.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        opportunity.applicants.push(req.user._id);
        await opportunity.save();

        res.status(200).json({ message: 'Successfully applied', opportunity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error applying for opportunity' });
    }
};
